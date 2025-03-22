const { vin_types } = require("../models/vins");
const { mail } = require("../utils/nodemailerConfig"); 
const { logger } = require("./logger");

async function generateVin(type) {
  // Generate a random number between 1000000000000000 and 9999999999999999 (16 digits)
  if(type !== vin_types[6]){
    const vin_no = Math.floor(Math.random() * 1e16);
    return `${type}-${vin_no}`;
  } else if(type == vin_types[7]) {
    const sid_no = Math.floor(1000 + Math.random() * 9000).toString();
    return `${type}-${sid_no}`;
  } else if(type == vin_types[6]) {
    const min_no = Math.floor(1000 + Math.random() * 9000).toString();
    return `${type}-${min_no}`;
  }
}

async function generateVerificationToken() {
  const code = await Math.random().toString().substring(2, 8);
  return code;    
}

async function sendCustomerVerificationMail (user, vin) {
  mail.sendMail({
        from: 'his-quiz@edspare.com',
        to: user.email, // list of receivers
        subject: "Welcome to HIS!!!✔", // Subject line
        text: `Congratulations!!!<br/><br/> Your <b>${user.role.role}</b> account has been created successfully.<br/> <b>HIS</b>, welcomes you to it's community. Kindly, watch out for our emails giving you updates on new products and activities of HIS which you can participate to win amazing prices.<br/>.Meanwhile, here is your unique virtual identification number<br/><b>${vin.vin}</b><br/><br/>Follow this link to complete your registration <a href=https://hism.hismobiles.com/auth/password_setup?verification_token=${user.verificationToken}&uid=${user._id}>https://hism.hismobiles.com/auth/password_setup?verification_token=${user.verificationToken}&uid=${user._id}</a>`,
        html: `Congratulations!!!<br/><br/> Your <b>${user.role.role}</b> account has been created successfully.<br/> <b>HIS</b>, welcomes you to it's community. Kindly, watch out for our emails giving you updates on new products and activities of HIS which you can participate to win amazing prices.<br/>.Meanwhile, here is your unique virtual identification number<br/><b>${vin.vin}</b><br/><br/>Follow this link to complete your registration <a href=https://hism.hismobiles.com/auth/password_setup?verification_token=${user.verificationToken}&uid=${user._id}>https://hism.hismobiles.com/auth/password_setup?verification_token=${user.verificationToken}&uid=${user._id}</a>`, // html body
      }, () => {
        if(err) {
          logger.error(err);
          return res.status(500).send({ status: true, message: 'The email verification failed to deliver', error: err });
        }

        return true
      });
}

module.exports = { generateVin, generateVerificationToken, sendCustomerVerificationMail };
