const { users } = require("../models/Users");
const bcryptjs = require("bcryptjs");
const { generateVin } = require("../utils/helpers");
const { vins, vin_types, owners } = require("../models/vins");

const create_user = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    phone,
    country,
    state,
    address,
    zip_code,
    role,
    password,
  } = req.body;

  console.log(req.body);

  if (
    !firstname ||
    !lastname ||
    !email ||
    !phone ||
    !country ||
    !state ||
    !zip_code ||
    !address ||
    !role ||
    !password
  ) {
    return res.status(400).send({
      errorCode: 400,
      errorMsg: "All fields are required!",
    });
  }

  try {
    const user = users();
    const vin = vins();

    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.phone = phone;
    user.country = country;
    user.address = address;
    user.state = state;
    user.zip_code = zip_code;
    user.role = role;

    const hashed_password = await bcryptjs.hash(password, 10);
    user.password = hashed_password;

    const saved_user = await user.save();

    if (!saved_user) {
      return res.status().send({
        errorCode: 400,
        errorMsg: "",
      });
    }

    vin.type = vin_types[3];
    vin.owner = owners[0];
    vin.distributor = saved_user._id;
    vin.vin = generateVin();

    const saved_vin = await vin.save();

    if (!saved_vin) {
      return res.status(400).send({
        errorCode: 400,
        errorMsg: "",
      });
    }

    return res.status(200).send({
      status: true,
      statusCode: 200,
      message: "Account created successfully!",
    });
  } catch (error) {
    console.log(error);
  }
};

const update_user = async (req, res) => {};

const suspend_user = async (req, res) => {};

const delete_user = async (req, res) => {};

module.exports = {
  create_user,
  update_user,
  suspend_user,
  delete_user,
};
