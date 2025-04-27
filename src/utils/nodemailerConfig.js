require("dotenv").config();
const nodemailer = require("nodemailer");

const mail = nodemailer.createTransport({
  //service: process.env.SMTP_END_POINT,
  host: process.env.MAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    ciphers: "SSLv3", // optional but sometimes helps
  },
});

module.exports = { mail };
