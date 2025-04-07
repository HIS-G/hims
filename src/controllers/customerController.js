const { customers } = require("../models/Customers");
const { roles } = require("../models/Roles");
const { vins, vin_types } = require("../models/vins");
const { devices } = require("../models/Devices");
const { generateVin } = require("../utils/helpers");
const bcrypt = require("bcryptjs");
const { logger } = require("../utils/logger");
const crypto = require("crypto");
const { mail } = require('../utils/nodemailerConfig');
const { sharedAnnouncements } = require("../models/Announcements");
const { upload_file } = require("../utils/uploads");

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
    referral_link,
    referedBy,
    announcement
  } = req.body;

  let referrer_id;
  let refferer_role;

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
    customer.activated = true;
    if (middlename) customer.middlename = middlename;
    if (device) customer.device.push(device);
    if (username) customer.username = username;
    if (country) customer.country = country;
    if (state) customer.state = state;
    if (zip_code) customer.zip_code = zip_code;
    if (address) customer.address = address;
    if (referral_link) customer.referralLink = referral_link;

    if (referedBy) {
      const referral_vin = await vins.findOne({ vin: referedBy });

      if(!referral_vin) {
        return res.status(400).send({
          status: false,
          message: "Invalid Refferal ID!"
        });
      }

      if(referral_vin.customer) {
        refferer_role = "customer";
        referrer_id = vin.customer;
      } else if(referral_vin.user) {
        referrer_id = vin.user;
        refferer_role = "user";
      }
      customer.referedBy = referral_vin._id;
    }

    if (password) {
      bcrypt.setRandomFallback((len) => crypto.randomBytes(len));

      let salt = await bcrypt.genSalt();
      customer.password = await bcrypt.hash(password, salt);
    }

    const new_customer = await customer.save();
    console.log(new_customer);

    if (new_customer) {
      new_fin.type = vin_types[5];
      new_fin.customer = new_customer._id;
      new_fin.vin = await generateVin(vin_types[5]);

      const saved_fin = await new_fin.save();

      if (saved_fin) {
        mail.sendMail({
          from: 'his-quiz@edspare.com',
          to: `${new_customer.email}`, // list of receivers
          subject: "Welcome to HIS!!!✔", // Subject line
          text: `Congratulations!!! Your account has been created successfully. HIS, welcomes you to it's community. Kindly, watch out for our emails giving you updates on new products and activities of HIS which you can participate to win amazing prices.<br/>.Meanwhile, here is your unique virtual identification number<br/><b>${saved_fin.vin}</b><br/><br/>Kindly, click this link to activate and verify your account <a href=https://hism.hismobiles.com/auth/activate_account?verification_token=${new_customer.verificationToken}&uid=${new_customer._id}>https://hism.hismobiles.com/auth/activate_account?verification_token=${new_customer.verificationToken}&uid=${new_customer._id}</a>`,
          html: `Congratulations!!! Your account has been created successfully. HIS, welcomes you to it's community. Kindly, watch out for our emails giving you updates on new products and activities of HIS which you can participate to win amazing prices.<br/>.Meanwhile, here is your unique virtual identification number<br/><b>${saved_fin.vin}</b><br/><br/>Kindly, click this link to activate and verify your account <a href=https://hism.hismobiles.com/auth/activate_account?verification_token=${new_customer.verificationToken}&uid=${new_customer._id}>https://hism.hismobiles.com/auth/activate_account?verification_token=${new_customer.verificationToken}&uid=${new_customer._id}</a>`, // html body
        }, async (err, result) => {
          if(err) {
            logger.error(err);
            res.status(500).json({ status: true, message: err });
          }
          
          if(announcement) {
            await sharedAnnouncements.findOneAndUpdate(
              { vin: referedBy }, 
              { $inc: { leadConvertCount: 1 }, 
                shareLink: referral_link, 
                vin: referedBy,
                user: refferer_role === 'user' ? referrer_id : null,
                customer: refferer_role === 'customer' ? referrer_id : null,
                announcement: announcement 
              }, 
              { upsert: true, 
                new: true 
              }
            );
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

const update_user_status = async (req, res) => {
  const customer_id = req.params.customer_id;

  if(!customer_id) {
    return res.status(400).send({
      status: false,
      message: "Invalid user ID!"
    });
  } 
  
  try {
    const updated_customer = await customers.findByIdAndUpdate(customer_id, [
        { $set: { activated: { $not: "$activated" } } } 
      ], { upsert: true, new: true });

    return res.status(200).send({
      status: true,
      message: `${updated_customer.firstname + " " + updated_customer.lastname}'s account has been successfully ${updated_customer.activated ? 'activated' : 'de-activated'}`,
      activated: updated_customer.activated
    });    
  } catch(error) {
    logger.error(error);
    return res.status(500).send({
      status: true,
      
    })
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

const generate_vin = async (req, res) => {
  const id = req.params.customer_id;

  try {
    const customer = await customers.findById(id);

    if(!customer) {
      return res.status(400).send({
        status: false,
        message: "Invalid account!"
      });
    }

    const existing_fin = await vins.findOne({ customer: id, });

    if(existing_fin) {
      return res.status(400).send({
        status: false,
        message: "This account already has a FIN"
      });
    }

    const new_fin = new vins();

    new_fin.customer = id;
    new_fin.type = vin_types[5];
    new_fin.vin = await generateVin(vin_types[5]);

    const saved_fin = await new_fin.save();

    return res.status(200).send({
      status: true,
      message: "FIN generated successfully!",
    });

  } catch(error) {
    logger.error(error);
    res.status(500).send({
      status: false,
      message: ""
    });
  }
};

const retrieve_daily_registrants = async (req, res) => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const end_of_day = new Date(new Date().setHours(23, 59, 59, 999));
  try {
    const customers_list = await customers.find({ createdAt: {
      $gte: today,
      $lt: end_of_day
    } }).select('-password');

    return res.status(200).send({
      status: true,
      message: "List of customers registered today",
      customers: customers_list,
      total: customers_list.length
    })
  } catch(error) {
    console.log(error);
    logger.error(error)
    return res.status(500).send({
      status: false,
      error: error,
      message: ""
    });
  }
};

module.exports = {
  get_customers,
  get_single_customer,
  generate_vin,
  submit_sla,
  my_profile,
  retrieve_daily_registrants,
  create_customer,
  update_customer,
  delete_customer,
  update_user_status
};
