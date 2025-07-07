require("dotenv").config();
const jwt = require("jsonwebtoken");

const authorize = async (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1];

  if (!token) {
    console.log(token);
    return res.status(401).send({
      status: "failed",
      message: "Unauthorized! Access denied",
    });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send({
        status: "Forbidden",
        message: "You are forbidden from accessing this resource.",
      });
    }
    req.uid = decoded.sub;
    next();
  });
};

module.exports = authorize;
