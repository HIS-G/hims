const { schools } = require("../models/Schools");
const { vins, vin_types } = require("../models/vins");
const { generateVin } = require("../utils/helpers");
const { mail } = require("../utils/nodemailerConfig");

const fetch_schools = async (req, res) => {
  try {
    const schools_list = await schools.find();

    return res.status(200).send({
      status: true,
      message: "",
      schools: schools_list,
    });
  } catch (error) {
    console.log(error);
  }
};

const get_school = async (req, res) => {
  const schools_list = await schools.find();
};

const create_school = async (req, res) => {
  console.log(req.body);
  const {
    school_name,
    school_email,
    school_phone,
    school_type,
    principal_name,
    principal_email,
    principal_phone,
    country,
    address,
    state,
    role,
    province,
    zip_code,
    total_students,
  } = req.body;

  try {
    const new_school = new schools();
    const new_vin = new vins();

    new_school.school_name = school_name;
    new_school.school_email = school_email;
    new_school.school_phone = school_phone;
    new_school.principal_name = principal_name;
    new_school.principal_email = principal_email;
    new_school.principal_phone = principal_phone;
    new_school.school_type = school_type;
    new_school.country = country;
    new_school.address = address;
    new_school.zip_code = zip_code;
    new_school.state = state;
    new_school.total_students = total_students;
    new_school.province = province;
    new_school.role = role;
    new_school.verificationToken = await generateVerificationToken();

    const saved_school = await new_school.save();

    if (saved_school) {
      new_vin.type = vin_types[2];
      new_vin.school = saved_school._id;
      new_vin.vin = await generateVin(vin_types[2]);

      const saved_vin = await new_vin.save();

      if (saved_vin) {
        mail.sendMail({
          from: 'his-quiz@edspare.com',
          to: `${new_school.email}, ${new_school.principal_email}`, // list of receivers
          subject: "Welcome to HIS!!!✔", // Subject line
          text: `<b>Congratulations ${new_school.name}!!!</b><br/><br/> Your account was created successfully.<br/><br/> <b>HIS-Group</b>, Cordially welcomes you to it's community. Kindly, watch out for our emails to keep you updated on all of our newest products, services and activities in which you stand a chance to win amazing prices, through active participation and engagements.<br/><br/>Meanwhile, here is your unique virtual identification number<br/><b>${saved_vin.vin}</b> ensure you keep it safe.`,
          html: `<b>Congratulations ${new_school.name}!!!</b><br/><br/> Your account was created successfully.<br/><br/> <b>HIS-Group</b>, Cordially welcomes you to it's community. Kindly, watch out for our emails to keep you updated on all of our newest products, services and activities in which you stand a chance to win amazing prices, through active participation and engagements.<br/><br/>Meanwhile, here is your unique virtual identification number<br/><b>${saved_vin.vin}</b> ensure you keep it safe.`, // html body
        }, (err, result) => {
          if(err) {
            logger.error(err);
            res.status(500).json({ status: true, message: err });
          }

          return res.status(200).send({
            status: true,
            school_id: saved_school._id,
          });
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: ``,
    });
  }
};

const update_school = async (req, res) => {};

const delist_school = async (req, res) => {};

module.exports = {
  create_school,
  fetch_schools,
  get_school,
  update_school,
  delist_school,
};
