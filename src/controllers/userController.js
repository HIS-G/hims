const { users } = require("../models/Users");
const bcryptjs = require("bcryptjs");
const { generateVin } = require("../utils/helpers");
const { vins, vin_types } = require("../models/vins");
const { roles } = require("../models/Roles");

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

  if (!firstname || !lastname || !email || !phone || !country || !role) {
    return res.status(400).send({
      errorCode: 400,
      errorMsg: "All fields are required!",
    });
  }

  try {
    const user = users();
    const vin = vins();

    const selected_role = await roles.findById(role);

    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.phone = phone;
    user.country = country;
    user.address = address;
    user.state = state;
    user.zip_code = zip_code;
    user.role = role;

    if (password) {
      const hashed_password = await bcryptjs.hash(password, 10);
      user.password = hashed_password;
    }

    const saved_user = await user.save();

    if (!saved_user) {
      return res.status().send({
        errorCode: 400,
        errorMsg: "",
      });
    }

    vin.type = vin_types[3];
    if (selected_role.role == "DISTRIBUTOR") {
      vin.distributor = saved_user._id;
      vin.vin = await generateVin(vin_types[3]);
    } else if (selected_role.role == "SUPPLIER") {
      vin.supplier = saved_user._id;
      vin.vin = await generateVin(vin_types[4]);
    }

    if (selected_role !== "SUPER_ADMIN") {
      const saved_vin = await vin.save();

      if (saved_vin)
        return res.status(200).send({
          status: true,
          statusCode: 200,
          message: "Account created successfully!",
        });
    }

    return res.status(200).send({
      status: true,
      statusCode: 200,
      message: "Account created successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error
    });
  }
};

const get_all_users = async (req, res) => {
  var { page, size } = req.query;

  if (!page) {
    page = 1;
  }

  if (!size) {
    size = 15;
  }

  const skip = (page - 1) * size;

  try {
    const all_users = await users
      .find()
      .skip(skip)
      .limit(size)
      .populate("role", "role active permission type")
      .exec();

    return res
      .status(200)
      .send({ status: true, message: ``, users: all_users });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: `` });
  }
};

const get_users_by_role = async (req, res) => {
  const role = req.params;
  var { page, size } = req.query;

  console.log(role);

  if (!page) {
    page = 1;
  }

  if (!size) {
    size = 15;
  }

  const skip = (page - 1) * size;

  try {
    const selected_users = await users
      .find({ "role.role": role })
      .skip(skip)
      .limit(size)
      .exec();

    console.log(selected_users);
    return res
      .status(200)
      .send({ status: true, message: ``, users: selected_users });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: `` });
  }
};

const update_user = async (req, res) => {};

const suspend_user = async (req, res) => {};

const delete_user = async (req, res) => {};

module.exports = {
  get_all_users,
  get_users_by_role,
  create_user,
  update_user,
  suspend_user,
  delete_user,
};
