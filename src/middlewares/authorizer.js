const jwt = require("jsonwebtoken");

const authorize = async (req, res, next) => {
  next();
};

module.exports = authorize;
