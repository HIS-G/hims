require('dotenv').config();
const nodemailer = require('nodemailer');

const mail = nodemailer.createTransport({
    //service: process.env.SMTP_END_POINT,
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    },
});

module.exports = { mail };