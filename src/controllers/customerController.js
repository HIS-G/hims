const { customers } = require("../models/Customers");
const { vins, vin_types, owners } = require("../models/vins");
const { generateVin } = require("../utils/helpers");

const get_customers = async (req, res) => {
  try {
    const all_customers = await customers.find();

    return res.status(200).send({
      status: true,
      message: ``,
      customers: all_customers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: `` });
  }
};

const get_customer = async (req, res) => {
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

const create_customer = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    phone,
    password,
    country,
    state,
    address,
    zip_code,
    vin,
    sub_vin,
    fin,
    hin,
  } = req.body;

  try {
    const customer = new customers();
    const new_vin = new vins();

    customer.firstname = firstname;
    customer.lastname = lastname;
    customer.email = email;
    customer.phone = phone;
    if (password) customer.password = password;
    customer.country = country;
    if (state) customer.state = state;
    if (zip_code) customer.zip_code = zip_code;
    if (address) customer.address = address;
    /* if (hin) customer.hin = hin;
    if (vin) customer.vin = vin;
    if (fin) customer.fin = fin;
    if (sub_vin) customer.sub_vin = sub_vin; */

    const new_customer = await customer.save();

    if (new_customer) {
      new_vin.type = vin_types[0];
      new_vin.customer = new_customer._id;
      new_vin.vin = await generateVin(vin_types[0]);

      const saved_vin = await new_vin.save();

      if (saved_vin) {
        return res.status(200).send({
          status: true,
          customer_id: new_customer._id,
        });
      }
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      errorMsg: "",
    });
  }
};

const update_customer = async (req, res) => {};

const delete_customer = async (req, res) => {};

module.exports = {
  get_customers,
  get_customer,
  create_customer,
  update_customer,
  delete_customer,
};
