require("dotenv").config();
const { customers } = require("../models/Customers");
const { schools } = require("../models/Schools");
const { users } = require("../models/Users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { logger } = require("../utils/logger");
const { vins } = require("../models/vins");
const { mail } = require("../utils/nodemailerConfig");
const { generateVerificationToken } = require("../utils/helpers");
const { log_activity } = require("./activityLogs");
const { actions } = require("../models/Activities");

const customer_login = async (req, res) => {
  console.log(req.body);
  var vin;
  const { is_school, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      status: 400,
      message: `Invalid login credentials!`,
    });
  }

  try {
    if (is_school) {
      const school = await schools
        .findOne({ $or: [{ school_email: email }] })
        .populate("role", "role")
        .exec();

      if (!school) {
      }

      if (school && !school.password) {
        return res.status(400).send({
          status: false,
          message: ``,
        });
      }

      const matched = await bcrypt.compare(password, school.password);

      if (!matched) {
        return res.status(400).send({
          status: false,
          message: ``,
        });
      }

      const access_token = await jwt.sign(
        { email: school.school_email, sub: school._id },
        process.env.SECRET_KEY,
        { algorithm: "HS512", expiresIn: "7d" }
      );

      vin = await vins.findOne({ school: school._id }).select("type vin");

      return res.status(200).send({
        status: true,
        school: {
          id: school._id,
          name: school.school_name,
          email: school.school_email,
          phone: school.school_phone,
          role: school.role,
          vin: vin,
        },
        access_token: access_token,
      });
    }

    const user = await customers
      .findOne({ $or: [{ email: email }, { username: email }] })
      .populate("role", "role")
      .exec();

    if (!user) {
      return res.status(400).send({
        status: false,
        message: "email and password is incorrect!",
      });
    }

    if (!user.activated) {
      return res.status(401).send({
        status: false,
        message:
          "Account Inactive!...Kindly, contact administrator for support.",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).send({
        status: true,
        message: "Email and password is incorrect!",
      });
    }

    const access_token = await jwt.sign(
      { email: user.email, sub: user._id, role: user.role.role },
      process.env.SECRET_KEY,
      { algorithm: "HS512", expiresIn: "7d" }
    );

    vin = await vins.findOne({ customer: user }).select("type vin");
    await log_activity(actions[0], user._id, user.role.role);

    return res.status(200).send({
      status: true,
      message: `Welcome back ${user.firstname}!`,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        photo_url: user.photo_url,
        photo_public_id: user.photo_public_id,
        qrCode: user.qrCode,
        verified: user.verified,
        active: user.activated,
        role: user.role,
        vin: vin,
      },
      access_token: access_token,
    });
  } catch (error) {
    console.log(error);
    logger.error(error);
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const admin_login = async (req, res) => {
  var vin;
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      status: 400,
      message: `Invalid login credentials!`,
    });
  }

  try {
    const user = await users
      .findOne({ email: email })
      .populate("role", "role active permission type")
      .exec();

    if (!user) {
      return res.status(400).send({
        status: false,
        message: "email and password is incorrect!",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const access_token = await jwt.sign(
        { email: user.email, sub: user._id },
        process.env.SECRET_KEY,
        { algorithm: "HS512", expiresIn: "7d" }
      );

      if (user.role.role == "SUPER_ADMIN") {
        vin = await vins.findOne({ user: user.id }).select("type vin");
      } else if (user.role.role == "SUPPLIER") {
        vin = await vins.findOne({ supplier: user.id }).select("type vin");
      } else if (user.role.role == "DISTRIBUTOR") {
        vin = await vins.findOne({ distributor: user.id }).select("type vin");
      }

      return res.status(200).send({
        status: true,
        message: `Welcome back ${user.name}!`,
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phone: user.phone,
          photo_url: user.photo_url,
          photo_public_id: user.photo_public_id,
          verified: user.verified,
          approvedAt: user.approvedAt,
          approvedBy: user.approvedBy,
          active: user.activated,
          role: user.role,
          vin: vin,
        },
        access_token: access_token,
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "email and password is incorrect!",
      });
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const create_admin_password = async (req, res) => {
  const { user_id } = req.params;
  const { verification_token, password, confirmation } = req.body;

  if (!user_id) {
    return res.status(401).send({
      status: false,
      message: `Unauthorized! Access denied.`,
    });
  }

  if ((!password && !confirmation) || password !== confirmation) {
    return res.status(400).send({
      status: false,
      message: `Password does not match!`,
    });
  }

  try {
    if (password == confirmation) {
      bcrypt.setRandomFallback((len) => crypto.randomBytes(len));

      const hashed_password = await bcrypt.hash(password, 10);
      const password_updated = await users.findByIdAndUpdate(
        user_id,
        {
          $set: { password: hashed_password, verified: true, activated: true },
          $unset: { verificationToken: verification_token },
        },
        { upsert: true, new: true }
      );

      if (password_updated) {
        return res.status(200).send({
          status: true,
          message: "Password updated successfully!",
          user: user_id,
        });
      }
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const create_customer_password = async (req, res) => {
  const { customer_id } = req.params;
  const { password, confirmation, password_reset_token } = req.body;

  if (!customer_id) {
    return res.status(401).send({
      status: false,
      message: `Unauthorized! Access denied.`,
    });
  }

  if ((!password && !confirmation) || password !== confirmation) {
    return res.status(400).send({
      status: false,
      message: `Password does not match!`,
    });
  }

  /* if (!password_reset_token) {
    return res.status(400).send({
      status: false,
      message: `Invalid reset token!`,
    });
  } */

  try {
    if (password == confirmation) {
      bcrypt.setRandomFallback((len) => crypto.randomBytes(len));

      let salt = await bcrypt.genSalt();

      const hashed_password = await bcrypt.hash(password, salt);
      const password_updated = await customers.findOneAndUpdate(
        {
          $and: [
            { _id: customer_id },
            { passwordResetToken: password_reset_token },
          ],
        },
        {
          password: hashed_password,
          $unset: { passwordResetToken: password_reset_token },
        },
        { upsert: true, new: true }
      );

      if (password_updated) {
        await log_activity(actions[9], customer_id, "CUSTOMER");
        return res.status(200).send({
          status: true,
          message: "Password updated successfully!",
          user: customer_id,
        });
      }
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).send({
      status: false,
      message: JSON.stringify(error),
    });
  }
};

const create_school_password = async (req, res) => {
  const { school_id } = req.params;
  const { verification_token, password, confirmation } = req.body;

  if (!school_id) {
    return res.status(401).send({
      status: false,
      message: `Unauthorized! Access denied.`,
    });
  }

  if ((!password && !confirmation) || password !== confirmation) {
    return res.status(400).send({
      status: false,
      message: `Password does not match!`,
    });
  }

  try {
    if (password == confirmation) {
      bcrypt.setRandomFallback((len) => crypto.randomBytes(len));

      const hashed_password = await bcrypt.hash(password, 10);
      const password_updated = await schools.findByIdAndUpdate(
        school_id,
        {
          $set: { password: hashed_password, verified: true, activated: true },
          $unset: { verificationToken: verification_token },
        },
        { upsert: true, new: true }
      );

      if (password_updated) {
        return res.status(200).send({
          status: true,
          message: "Password updated successfully!",
          school: school_id,
        });
      }
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const send_password_reset_link = async (req, res) => {
  const { email } = req.body;

  try {
    const customer = await customers.findOne({ email: email });

    if (!customer) {
      return res.status(200).send({
        status: true,
        meesage: "A password reset link has been sent to your email",
      });
    }

    const password_reset_token = await generateVerificationToken();

    customer.passwordResetToken = password_reset_token;

    const updated_customer = await customer.save();

    mail.sendMail(
      {
        from: "his-quiz@edspare.com",
        to: `${customer.email}`, // list of receivers
        subject: "Password Reset✔", // Subject line
        text: `Congratulations!!! Your request to reset your password was recieved successfully.<br/><br/> If you did not initiate this request kindly ignore this mail. <br/><br/>However, If you did, kindly click the link below to reset your password.<br/><br/><a href=https://hism.hismobiles.com/auth/customers/password_reset?password_reset_token=${password_reset_token}&uid=${customer._id}>https://hism.hismobiles.com/auth/customers/password_reset?password_reset_token=${password_reset_token}&uid=${customer._id}</a>`,
        html: `Congratulations!!! Your request to reset your password was recieved successfully.<br/><br/> If you did not initiate this request kindly ignore this mail. <br/><br/>However, If you did, kindly click the link below to reset your password.<br/><br/><a href=https://hism.hismobiles.com/auth/customers/password_reset?password_reset_token=${password_reset_token}&uid=${customer._id}>https://hism.hismobiles.com/auth/customers/password_reset?password_reset_token=${password_reset_token}&uid=${customer._id}</a>`,
      },
      async (err, result) => {
        if (err) {
          logger.error(err);
          res.status(500).json({ status: true, message: err });
        }

        await log_activity(actions[8], customer._id, "CUSTOMER");
        return res.status(200).send({
          status: true,
          message: "A password reset link has been sent to your email",
        });
      }
    );
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ status: false, message: error });
  }
};

const verify_account = async (req, res) => {
  const { verificationToken, uid } = req.body;

  if (!verificationToken && !uid) {
    return res.status(401).send({
      status: false,
      message: "Unauthorized! Access denied.",
    });
  }

  try {
    const customer = await customers.findOneAndUpdate(
      { $and: [{ _id: uid }, { verificationToken: verificationToken }] },
      { verified: true, $unset: { verificationToken: verificationToken } },
      { upsert: true, new: true }
    );

    await log_activity(actions[11], customer._id, "CUSTOMER");
    return res.status(200).send({
      status: true,
      message: "Account verified successfully!",
      customer: customer._id,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

const admin_logout = async (req, res) => {};

const customer_logout = async (req, res) => {
  try {

  } catch(error) {
    logger.error(error);
    return res.status(500).send({
      status: "internal server error",
      message: "Oops, you have encountered an internal server error"
    });
  }
};

module.exports = {
  customer_login,
  admin_login,
  create_admin_password,
  create_customer_password,
  send_password_reset_link,
  create_school_password,
  send_password_reset_link,
  admin_logout,
  verify_account,
  customer_logout,
};
