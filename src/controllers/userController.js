const { users } = require("../models/Users");
const bcryptjs = require("bcryptjs");
const { generateVin, generateVerificationToken } = require("../utils/helpers");
const { vins, vin_types } = require("../models/vins");
const { roles } = require("../models/Roles");
const { mail } = require("../utils/nodemailerConfig");
const { logger } = require("../utils/logger");

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

    user.verificationToken = await generateVerificationToken();

    const saved_user = await user.save();

    if (!saved_user) {
      return res.status().send({
        status: false,
        message: error,
      });
    }

    if (selected_role.role == "DISTRIBUTOR") {
      vin.type = vin_types[3];
      vin.distributor = saved_user._id;
      vin.vin = await generateVin(vin_types[3]);
    } else if (selected_role.role == "SUPPLIER") {
      vin.type = vin_types[6]
      vin.supplier = saved_user._id;
      vin.vin = await generateVin(vin_types[6]);
    }

    if (selected_role !== "SUPER_ADMIN") {
      const saved_vin = await vin.save();

      if (saved_vin)
        mail.sendMail({
          from: 'his-quiz@edspare.com',
          to: `${user.email}`, // list of receivers
          subject: "Welcome to HIS!!!✔", // Subject line
          text: `Congratulations!!!<br/><br/> Your <b>${selected_role.role}</b> account has been created successfully.<br/> <b>HIS</b>, welcomes you to it's community. Kindly, watch out for our emails giving you updates on new products and activities of HIS which you can participate to win amazing prices.<br/>.Meanwhile, here is your unique virtual identification number<br/><b>${saved_vin.vin}</b><br/><br/>Follow this link to complete your registration <a href=https://hism.hismobiles.com/auth/password_setup?verification_token=${user.verificationToken}&uid=${user._id}>https://hism.hismobiles.com/auth/password_setup?verification_token=${user.verificationToken}&uid=${user._id}</a>`,
          html: `Congratulations!!!<br/><br/> Your <b>${selected_role.role}</b> account has been created successfully.<br/> <b>HIS</b>, welcomes you to it's community. Kindly, watch out for our emails giving you updates on new products and activities of HIS which you can participate to win amazing prices.<br/>.Meanwhile, here is your unique virtual identification number<br/><b>${saved_vin.vin}</b><br/><br/>Follow this link to complete your registration <a href=https://hism.hismobiles.com/auth/password_setup?verification_token=${user.verificationToken}&uid=${user._id}>https://hism.hismobiles.com/auth/password_setup?verification_token=${user.verificationToken}&uid=${user._id}</a>`, // html body
        }, () => {
          if(err) {
            logger.error(err);
            res.status(500).json({ status: true, message: err });
          }

          return res.status(200).send({
            status: true,
            statusCode: 200,
            message: "Account created successfully!",
          });
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
      message: error,
    });
  }
};

const get_single_user = async (req, res) => {
  //const { } = req.params;
  const { id } = req.body;

  try{
    const user = await users.find({ $or: [{_id: id}] }).populate("role", "role").exec();

    return res.status(200).send({
      status: true,
      message: `User information`,
      users: user
    });
  } catch(error){
    logger.error(error);
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

const search_users = async (req, res) => {
  var found_role;
  const { role } = req.body;

  try {
    if (role) {
      found_role = await roles.findOne({
        $or: [{ role: role }],
      });
    }

    const found_users = await users.find({
      $or: [{ role: found_role._id }],
    });

    console.log(found_users);

    return res.status(200).send({
      status: true,
      message: `List of available distributors!`,
      users: found_users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const update_user = async (req, res) => {};

const suspend_user = async (req, res) => {};

const delete_user = async (req, res) => {};

module.exports = {
  get_all_users,
  get_single_user,
  get_users_by_role,
  search_users,
  create_user,
  update_user,
  suspend_user,
  delete_user,
};
