const { customers } = require("../models/Customers");
const { users } = require("../models/Users");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {};

const admin_login = async (req, res) => {};

const staff_login = async (req, res) => {};

const logout = async (req, res) => {};

module.exports = {
  login,
  admin_login,
  logout,
};
