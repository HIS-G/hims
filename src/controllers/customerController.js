require("dotenv").config();
const { customers } = require("../models/Customers");
const { roles } = require("../models/Roles");
const { vins, vin_types } = require("../models/vins");
const { devices } = require("../models/Devices");
const { generateVin, generateVerificationToken } = require("../utils/helpers");
const bcrypt = require("bcryptjs");
const { logger } = require("../utils/logger");
const crypto = require("crypto");
const { mail } = require("../utils/nodemailerConfig");
const { sharedAnnouncements, comments } = require("../models/Announcements");
const { generatePdfWithQrCode } = require("../utils/qr_generator");
const { referrals } = require("../models/Referrals");
const path = require("path");
const fs = require("fs");

const get_customers = async (req, res) => {
  try {
    const all_customers = await customers
      .find()
      .select("-password")
      .populate("device")
      .exec();

    return res.status(200).send({
      status: true,
      message: `List of customers!`,
      customers: all_customers,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ status: false, message: `` });
  }
};

const get_single_customer = async (req, res) => {
  const { customer_id } = req.params;

  try {
    const customer = await customers
      .findById(customer_id)
      .populate({
        path: "device",
        populate: { path: "device_model", select: "model_name type" },
      })
      .populate({ path: "role" })
      .exec();

    return res.status(200).send({
      status: true,
      message: ``,
      customer: customer,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ status: false, message: `` });
  }
};

const my_profile = async (req, res) => {
  const { customer_id } = req.params;

  if (!customer_id) {
    return res.status(400).send({
      status: false,
      message: "Invalid user ID",
    });
  }

  try {
    const customer = await customers.findById(customer_id);

    return res.status(200).send({
      status: true,
      message: "Customer Proifle",
      profile: customer,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({
      status: true,
      message: "Internal Server Error",
      error: error,
    });
  }
};

const create_customer = async (req, res) => {
  console.log(req.body);
  const {
    firstname,
    lastname,
    middlename,
    email,
    phone,
    password,
    country,
    state,
    username,
    address,
    zip_code,
    device,
    referral_link,
    referedBy,
    announcement,
  } = req.body;

  let referrer_id;
  let reffered_user;

  try {
    const exists = await customers.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (exists) {
      return res.status(409).send({
        status: false,
        message: "The username or email already exists!",
      });
    }
    const customer = new customers();
    //const new_vin = new vins();
    const new_fin = new vins();

    const role = await roles.findOne({ role: "CUSTOMER" });

    if (!role) {
      return res.status(404).send({
        status: false,
        message: "Role not found! Kindly contact an administrator",
      });
    }

    customer.firstname = firstname.toLowerCase();
    customer.lastname = lastname.toLowerCase();
    customer.email = email.toLowerCase();
    customer.phone = phone;
    customer.role = role._id;
    customer.activated = true;
    if (middlename) customer.middlename = middlename.toLowerCase();
    if (device) customer.device.push(device);
    if (username) customer.username = username.toLowerCase();
    if (country) customer.country = country.toLowerCase();
    if (state) customer.state = state.toLowerCase();
    if (zip_code) customer.zip_code = zip_code;
    if (address) customer.address = address.toLowerCase();
    if (referral_link) customer.referralLink = referral_link;

    if (referedBy) {
      const referral_vin = await vins.findOne({ customer: referedBy });

      if (!referral_vin) {
        const referral_customer = await customers.findById(referedBy);

        if (referral_customer) {
          referrer_id = referral_customer._id;
          reffered_user = referral_customer;
          customer.referedBy = referral_customer._id;
        }
      } else {
        referrer_id = referral_vin.customer;
        reffered_user = await customers.findOne(referral_vin.customer);
        customer.referedBy = reffered_user._id;
      }
    }

    if (password) {
      bcrypt.setRandomFallback((len) => crypto.randomBytes(len));

      let salt = await bcrypt.genSalt();
      customer.password = await bcrypt.hash(password, salt);
    }

    const new_customer = await customer.save();

    if (new_customer) {
      new_customer.verificationToken = await generateVerificationToken();
      const qrCode = await generateQRCode(
        `https://hism.hismobiles.com/auth/customers/register?referral_id=${new_customer._id}`
      );
      new_customer.qrCode = qrCode.split(",")[1];

      await new_customer.save();

      new_fin.type = vin_types[5];
      new_fin.customer = new_customer._id;
      new_fin.vin = await generateVin(vin_types[5]);

      const saved_fin = await new_fin.save();

      if (saved_fin) {
        const pdf = await generatePdfWithQRCode(
          new_customer,
          new_customer.qrCode
        );

        if (pdf) {
          await new_customer.save();
          mail.sendMail(
            {
              from: process.env.MAIL_FROM,
              to: `${new_customer.email}`, // list of receivers
              subject: "Welcome to HIS!!!✔", // Subject line
              text: `Congratulations!!! Your account has been created successfully. HIS, welcomes you to it's community. Kindly, watch out for our emails giving you updates on new products and activities of HIS which you can participate to win amazing prices.<br/>.Meanwhile, here is your unique virtual identification number<br/><b>${saved_fin.vin}</b><br/><br/>Kindly, click this link to activate and verify your account <a href=https://hism.hismobiles.com/auth/activate_account?verification_token=${new_customer.verificationToken}&uid=${new_customer._id}>https://hism.hismobiles.com/auth/activate_account?verification_token=${new_customer.verificationToken}&uid=${new_customer._id}</a>`,
              html: `Congratulations!!! Your account has been created successfully. HIS, welcomes you to it's community. Kindly, watch out for our emails giving you updates on new products and activities of HIS which you can participate to win amazing prices.<br/>.Meanwhile, here is your unique virtual identification number<br/><b>${saved_fin.vin}</b><br/><br/>Kindly, click this link to activate and verify your account <a href=https://hism.hismobiles.com/auth/activate_account?verification_token=${new_customer.verificationToken}&uid=${new_customer._id}>https://hism.hismobiles.com/auth/activate_account?verification_token=${new_customer.verificationToken}&uid=${new_customer._id}</a>`, // html body
              attachments: [
                {
                  filename: "hism-referral-code.pdf",
                  content: pdf,
                  contentDisposition: "attachment",
                  contentType: "application/pdf",
                },
              ],
            },
            async (err, result) => {
              if (err) {
                console.log(err);
                logger.error(err);
                return res.status(500).send({
                  status: true,
                  message: "Internal server error",
                  error: err,
                });
              }

              if (announcement) {
                await referrals.findOneAndUpdate(
                  { customer: reffered_user._id },
                  {
                    $inc: { referralCount: 1 },
                    customer: referred_user._id,
                    announcement: announcement,
                    announcement_link: referral_link,
                  },
                  { upsert: true, new: true }
                );
              } else if (!announcement && reffered_user) {
                await referrals.findOneAndUpdate(
                  { customer: reffered_user._id },
                  {
                    $inc: { referralCount: 1 },
                    referral_link: referral_link,
                    customer: reffered_user._id,
                  },
                  { upsert: true, new: true }
                );
              }

              if (reffered_user) {
                await mail.sendMail(
                  {
                    from: process.env.MAIL_FROM,
                    to: `${reffered_user.email}`, // list of receivers
                    subject: "Referral Notification", // Subject line
                    text: `Congratulations!!! A new account was just created using your referral link ${referral_link}. Thank you for the referral.<br/><br/> Keep referring to increase your chances of winning the reward.<br/><br/>The new registered user is <b>${
                      new_customer.firstname + " " + new_customer.lastname
                    }</b><br/><br/>`,
                    html: `Congratulations!!! A new account was just created using your referral link ${referral_link}. Thank you for the referral.<br/><br/> Keep referring to increase your chances of winning the reward.<br/><br/>The new registered user is <b>${
                      new_customer.firstname + " " + new_customer.lastname
                    }</b><br/><br/>`, // html body
                  },
                  async (err, result) => {
                    console.log(err);
                    if (err) {
                      logger.error(err);
                      return res.status(500).send({
                        status: false,
                        message: error,
                      });
                    }
                  }
                );
              }

              return res.status(200).send({
                status: true,
                message:
                  "Congratulations! Kindly, check your email to verify your account",
                //vin: saved_vin._id,
                fin: saved_fin._id,
                customer_id: new_customer._id,
              });
            }
          );
        }
      }
    }
  } catch (error) {
    console.log(error);
    logger.error(error);
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const update_user_status = async (req, res) => {
  const customer_id = req.params.customer_id;

  if (!customer_id) {
    return res.status(400).send({
      status: false,
      message: "Invalid user ID!",
    });
  }

  try {
    const updated_customer = await customers.findByIdAndUpdate(
      customer_id,
      [{ $set: { activated: { $not: "$activated" } } }],
      { upsert: true, new: true }
    );

    return res.status(200).send({
      status: true,
      message: `${
        updated_customer.firstname + " " + updated_customer.lastname
      }'s account has been successfully ${
        updated_customer.activated ? "activated" : "de-activated"
      }`,
      activated: updated_customer.activated,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({
      status: true,
    });
  }
};

const generate_vin = async (req, res) => {
  const id = req.params.customer_id;

  try {
    const customer = await customers.findById(id);

    if (!customer) {
      return res.status(400).send({
        status: false,
        message: "Invalid account!",
      });
    }

    const existing_fin = await vins.findOne({ customer: id });

    if (existing_fin) {
      return res.status(400).send({
        status: false,
        message: "This account already has a FIN",
      });
    }

    const new_fin = new vins();

    new_fin.customer = id;
    new_fin.type = vin_types[5];
    new_fin.vin = await generateVin(vin_types[5]);

    const saved_fin = await new_fin.save();

    return res.status(200).send({
      status: true,
      message: "FIN generated successfully!",
      fin: saved_fin.vin,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const update_customer = async (req, res) => {};

const delete_customer = async (req, res) => {
  const { customer_id } = req.body;

  if (!customer_id) {
  }

  try {
    await comments.deleteMany({ customer: customer_id }); // Delete related comments
    await sharedAnnouncements.deleteMany({ customer: customer_id }); // Delete Shares
    await vins.deleteOne({ customer: customer_id }); // Delete related comments
    const customer = await customers.findByIdAndDelete(customer_id);

    return res.status(200).send({
      status: true,
      message: "Account deleted successfully",
      customer: customer,
    });
  } catch (error) {
    console.log(error);
    logger.error(error);
    return res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

const submit_sla = async (req, res) => {
  const { email, device } = req.body;

  try {
    const customer = await customers.findOne({ email: email });
    const device_found = await devices.findById(device);
    console.log(customer);
    if (device_found && device_found.customer) {
      return res.status(400).send({
        status: false,
        message: `This device already has a signed SLA!`,
      });
    }

    device_found.customer = customer._id;
    customer.device.push(device_found._id);

    const updated_device = await device_found.save();
    const updated_customer = await customer.save();

    return res.status(200).send({
      status: true,
      message: `Congratulations on submitting your SLA!`,
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

const retrieve_daily_registrants = async (req, res) => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const end_of_day = new Date(new Date().setHours(23, 59, 59, 999));
  try {
    const customers_list = await customers
      .find({
        createdAt: {
          $gte: today,
          $lt: end_of_day,
        },
      })
      .select("-password");

    return res.status(200).send({
      status: true,
      message: "List of customers registered today",
      customers: customers_list,
      total: customers_list.length,
    });
  } catch (error) {
    console.log(error);
    logger.error(error);
    return res.status(500).send({
      status: false,
      error: error,
      message: "",
    });
  }
};

const get_customer_referrals = async (req, res) => {
  const { customer_id } = req.params;

  if (!customer_id) {
    return res.status(400).send({
      status: false,
      message: "Invalid User ID",
    });
  }

  try {
    const customer_referrals = await customers.find({ referedBy: customer_id });

    return res.status(200).send({
      status: true,
      message: "List of your referrals",
      referrals: customer_referrals,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({
      status: false,
      error: error,
      message: "Internal Server Error",
    });
  }
};

const generateQrCode = async (req, res) => {
  const { customer_id } = req.params;

  if (!customer_id) {
    return res.status(400).send({
      status: false,
      message: "Invalid user ID",
    });
  }

  try {
    const customer = await customers.findById(customer_id);

    if (customer) {
      const qrCode = await generateQRCode(
        `https://hism.hismobiles.com/auth/customer/login?referral_id=${customer._id}`
      );
      customer.qrCode = qrCode.split(",")[1];
      await customer.save();
    }

    return res.status(200).send({
      status: true,
      message: "QR-CODE generated successfully",
      qrCode: customer.qrCode,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

const downloadQrCode = async (req, res) => {
  const { customer_id } = req.params;

  if (!customer_id) {
    return res.status(400).json({
      status: false,
      message: "Invalid customer ID",
    });
  }

  try {
    const customer = await customers.findById(customer_id);

    if (!customer) {
      return res.status(404).json({
        status: false,
        message: "Customer not found",
      });
    }

    let qrCodeData;
    if (!customer.qrCode) {
      const qrCode = await generateQRCode(
        `https://hism.hismobiles.com/auth/customers/register?referral_id=${customer._id}`
      );
      customer.qrCode = qrCode.split(",")[1];
      await customer.save();
      qrCodeData = qrCode;
    } else {
      qrCodeData = `data:image/png;base64,${customer.qrCode}`;
    }

    const pdfBuffer = await generateQrCodePdf(qrCodeData);

  

    // Set headers for PDF streaming
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="HISM_QRCode_${customer_id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Pipe the stream to response
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error downloading QR code PDF:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message || error,
    });
  }
};

module.exports = {
  get_customers,
  get_single_customer,
  get_customer_referrals,
  downloadQrCode,
  generateQrCode,
  submit_sla,
  my_profile,
  generate_vin,
  retrieve_daily_registrants,
  create_customer,
  update_customer,
  delete_customer,
  update_user_status,
};
