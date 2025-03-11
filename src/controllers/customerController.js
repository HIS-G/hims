const { customers } = require("../models/Customers");
const { roles } = require("../models/Roles");
const { vins, vin_types } = require("../models/vins");
const { devices } = require("../models/Devices");
const { generateVin } = require("../utils/helpers");
const bcrypt = require("bcryptjs");
const { logger } = require("../utils/logger");
const crypto = require("crypto");
const { mail } = require('../utils/nodemailerConfig');
const { populate } = require("dotenv");

const get_customers = async (req, res) => {
  try {
    const all_customers = await customers.find().select("-password").populate("device").exec();

    return res.status(200).send({
      status: true,
      message: `List of customers!`,
      customers: all_customers,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ status: false, message: `` });
  }
};

const get_single_customer = async (req, res) => {
  const { customer_id } = req.params;

  try {
    const customer = await customers
                          .findById(customer_id)
                          .populate({
                            path: "device", 
                            populate: { path: "device_model", select: 'model_name type' }
                          })
                          .populate({ path: "role"})
                          .exec();

    return res.status(200).send({
      status: true,
      message: ``,
      customer: customer,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ status: false, message: `` });
  }
};

const my_profile = async (req, res) => {};

const create_customer = async (req, res) => {
  const {
    firstname,
    lastname,
    middlename,
    email,
    phone,
    password,
    country,
    state,
    username,
    address,
    zip_code,
    device,
  } = req.body;

  try {
    const customer = new customers();
    //const new_vin = new vins();
    const new_fin = new vins();

    const role = await roles.findOne({ role: "CUSTOMER" });

    if (!role) {
      return res.status(404).send({
        status: false,
        message: "Role not found! Kindly contact an administrator",
      });
    }

    customer.firstname = firstname;
    customer.lastname = lastname;
    customer.email = email;
    customer.phone = phone;
    customer.role = role._id;
    if (middlename) customer.middlename = middlename;
    if (device) customer.device.push(device);
    if (username) customer.username = username;
    if (country) customer.country = country;
    if (state) customer.state = state;
    if (zip_code) customer.zip_code = zip_code;
    if (address) customer.address = address;

    if (password) {
      bcrypt.setRandomFallback((len) => crypto.randomBytes(len));

      let salt = await bcrypt.genSalt();
      customer.password = await bcrypt.hash(password, salt);
    }

    const new_customer = await customer.save();

    if (new_customer) {
      /* new_vin.type = vin_types[0];
      new_vin.customer = new_customer._id;
      new_vin.vin = await generateVin(vin_types[0]); */

      new_fin.type = vin_types[5];
      new_fin.customer = new_customer._id;
      new_fin.vin = await generateVin(vin_types[5]);

      const saved_fin = await new_fin.save();
      //const saved_vin = await new_vin.save();

      if (saved_fin /* && saved_vin */) {
        mail.sendMail({
          from: 'his-quiz@edspare.com',
          to: `${new_customer.email}`, // list of receivers
          subject: "Welcome to HIS!!!✔", // Subject line
          text: `Congratulations!!! Your account has been created successfully. HIS, welcomes you to it's community. Kindly, watch out for our emails giving you updates on new products and activities of HIS which you can participate to win amazing prices.<br/>.Meanwhile, here is your unique virtual identification number<br/><b>${saved_fin.vin}</b>`,
          html: `Congratulations!!! Your account has been created successfully. HIS, welcomes you to it's community. Kindly, watch out for our emails giving you updates on new products and activities of HIS which you can participate to win amazing prices.<br/>.Meanwhile, here is your unique virtual identification number<br/><b>${saved_fin.vin}</b>`, // html body
        }, (err, result) => {
          if(err) {
            logger.error(err);
            res.status(500).json({ status: true, message: err });
          }
          
          return res.status(200).send({
            status: true,
            message:
              "Congratulations! Kindly, check your email to verify your account",
            //vin: saved_vin._id,
            fin: saved_fin._id,
            customer_id: new_customer._id,
          });
        });
      }
    }
  } catch (error) {
    console.log(error);
    logger.error(error);
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const update_customer = async (req, res) => {};

const delete_customer = async (req, res) => {};

const submit_sla = async (req, res) => {
  const { email, device } = req.body;

  try{
    const customer = await customers.findOne({ email: email });
    const device_found = await devices.findById(device);
    console.log(customer);
    if(device_found && device_found.customer) {
      return res.status(400).send({
        status: false,
        message: `This device already has a signed SLA!`
      });
    }
    
    device_found.customer = customer._id;
    customer.device.push(device_found._id);

    const updated_device = await device_found.save();
    const updated_customer = await customer.save();
    
    return res.status(200).send({
      status: true,
      message: `Congratulations on submitting your SLA!`,
    }); 
  }catch(error) {
    console.log(error)
    logger.error(error);
    return res.status(500).send({
      status: false,
      message: error
    });
  }
};

module.exports = {
  get_customers,
  get_single_customer,
  submit_sla,
  my_profile,
  create_customer,
  update_customer,
  delete_customer,
};
