const { customers } = require("../models/Customers");
const { roles } = require("../models/Roles");
const { vins, vin_types, owners } = require("../models/vins");
const { generateVin } = require("../utils/helpers");
const bcrypt = require("bcryptjs");

const get_customers = async (req, res) => {
  try {
    const all_customers = await customers.find().populate("device").exec();

    return res.status(200).send({
      status: true,
      message: `List of customers!`,
      customers: all_customers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: `` });
  }
};

const get_single_customer = async (req, res) => {
  const { customer_id } = req.params;

  try {
    const customer = await customers.findById(customer_id);

    return res.status(200).send({
      status: true,
      message: ``,
      customer: customer,
    });
  } catch (error) {
    console.log(error);
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
    const new_vin = new vins();
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
      customer.password = await bcrypt.hash(password, 10);
    }

    const new_customer = await customer.save();

    if (new_customer) {
      new_vin.type = vin_types[0];
      new_vin.customer = new_customer._id;
      new_vin.vin = await generateVin(vin_types[0]);

      new_fin.type = vin_types[5];
      new_fin.customer = new_customer._id;
      new_fin.vin = await generateVin(vin_types[5]);

      const saved_fin = await new_fin.save();
      const saved_vin = await new_vin.save();

      if (saved_fin && saved_vin) {
        return res.status(200).send({
          status: true,
          message:
            "Congratulations! Your account has been created successfully.",
          vin: saved_vin._id,
          fin: saved_fin._id,
          customer_id: new_customer._id,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const update_customer = async (req, res) => {};

const delete_customer = async (req, res) => {};

module.exports = {
  get_customers,
  get_single_customer,
  my_profile,
  create_customer,
  update_customer,
  delete_customer,
};
