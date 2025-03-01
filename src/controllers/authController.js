require("dotenv").config();
const { customers } = require("../models/Customers");
const { schools } = require("../models/Schools");
const { users } = require("../models/Users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const customer_login = async (req, res) => {
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

      return res.status(200).send({
        status: true,
        school: {
          id: school._id,
          name: school.school_name,
          email: school.school_email,
          phone: school.school_phone,
          role: school.role,
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
    console.log(user);

    if (user && !user.password) {
      return res.status(400).send({
        status: false,
        message:
          "Kindly verify your account to enable you complete the registration process!",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log(match);

    if(!match) {
       return res.status(400).send({
         status: true,
         message: 'Email and password is incorrect!'
       });
    }

      const access_token = await jwt.sign(
        { email: user.email, sub: user._id },
        process.env.SECRET_KEY,
        { algorithm: "HS512", expiresIn: "7d" }
      );

      return res.status(200).send({
        status: true,
        message: `Welcome back ${user.firstname}!`,
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phone: user.phone,
          verified: user.verified,
          active: user.activated,
          role: user.role,
        },
        access_token: access_token,
      });
    
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const admin_login = async (req, res) => {
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

      return res.status(200).send({
        status: true,
        message: `Welcome back ${user.name}!`,
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phone: user.phone,
          verified: user.verified,
          approvedAt: user.approvedAt,
          approvedBy: user.approvedBy,
          active: user.activated,
          role: user.role,
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
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const create_admin_password = async (req, res) => {
  const { user_id } = req.params;
  const { password, confirmation } = req.body;

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
      const hashed_password = await bcrypt.hash(password, 10);
      const password_updated = await users.findByIdAndUpdate(
        user_id,
        { password: hashed_password },
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
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const create_customer_password = async (req, res) => {
  const { customer_id } = req.params;
  const { password, confirmation } = req.body;

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

  try {
    if (password == confirmation) {
      const hashed_password = await bcrypt.hash(password, 10);
      const password_updated = await customers.findByIdAndUpdate(
        customer_id,
        { password: hashed_password },
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
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const create_school_password = async (req, res) => {
  const { school_id } = req.params;
  const { password, confirmation } = req.body;

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
      const hashed_password = await bcrypt.hash(password, 10);
      const password_updated = await schools.findByIdAndUpdate(
        school_id,
        { password: hashed_password },
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
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const admin_logout = async (req, res) => {};

const customer_logout = async (req, res) => {};

module.exports = {
  customer_login,
  admin_login,
  create_admin_password,
  create_customer_password,
  create_school_password,
  admin_logout,
  customer_logout,
};
