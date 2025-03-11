const { devices, deviceModels, model_types } = require("../models/Devices");
const { buyers } = require("../models/Buyers");
const { vins } = require("../models/vins");
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');
const { logger } = require("../utils/logger");
const process = require("process");

const create_device = async (req, res) => {
  const { user, vin, device_name, device_model, serial_no, imei, build_no, color } = req.body;

  if(!user) {
    return res.status(400).send({
      status: false,
      message: ``
    });
  }

  try {
    const device = new devices();

    device.device_name = device_name;
    device.device_model = device_model;
    device.color = color;
    device.serial_no = serial_no;
    device.imei = imei;
    device.build_no = build_no;
    if(vin) device.min = vin;
    device.createdBy = user;

    const saved_device = await device.save();
    console.log(saved_device);

    if (!saved_device) {
      return res.status(400).send({
        status: false,
        message: "",
      });
    }

    return res.status(200).send({
      status: true,
      device_id: saved_device._id,
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

const create_device_models = async (req, res) => {
  const { model_name, type, colors } = req.body;

  if(!colors || colors.length < 1) {
    return res.status(400).send({
      status: false,
      message: `Kindly, specify the available colors for this model.`
    });
  }

  try {
    const new_model = new deviceModels();

    new_model.model_name = model_name;
    new_model.type = type;
    new_model.colors = colors;

    const saved = await new_model.save();

    return res.status(200).send({
      status: true,
      message: `Model created successfully!`,
      model_id: saved._id,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const fetch_device_models = async (req, res) => {
  try {
    const models = await deviceModels.find();

    return res.status(200).send({
      status: true,
      message: "List of all available models",
      models: models,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const fetch_devices = async (req, res) => {
  try {
    const device_list = await devices
      .find()
      .populate([
        "customer",
        "device_model",
        "sub_din",
        "buyer",
        "vin",
        "sub_vin",
        "fin",
        "hin",
      ])
      .populate({
        path: "din",
        populate: { path: "distributor" },
      })
      .exec();

    if (devices.length < 1) {
      return res.status(404).send({
        status: false,
        message: "",
      });
    }

    return res.status(200).send({
      status: true,
      message: `List of all available devices!`,
      devices: device_list,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const search_devices = async (req, res) => {
  const { imei, serial_no, user, customer, vin } = req.body;

  /* if(!vin) {
    return res.status(400).send({
      status: false,
      message: `Please provide your VIN`
    });
  } */

  try {
    if(!vin) {
      const found_devices = await devices
      .find()
      .populate([
        "customer",
        "device_model",
        "sub_din",
        "buyer",
        "vin",
        "sub_vin",
        "fin",
      ])
      .populate({ path: "din", populate: { path: "distributor" } })
      .populate({ path: "hin", populate: { path: "customer" } })
      .populate({ path: "vin", populate: { path: "school" } })
      .exec();

      if (found_devices.length <= 0) {
        return res.status(404).send({
          status: true,
          message: "No available device found!",
        });
      }

      return res.status(200).send({
        status: true,
        message: "List of devices!",
        devices: found_devices,
      });
    }

    const user_vin = await vins.findOne({
      $or: [
        {vin: vin }
      ],
    });
    console.log("user_vin:::::", user_vin);

    const found_devices = await devices
      .find({
        $or: [
          { imei: imei },
          { serial_no: serial_no },
          { min: user_vin._id },
          { din: user_vin._id },
          { vin: user_vin._id },
          { hin: user_vin._id },
          { createdBy: user }
        ],
      })
      .populate([
        "customer",
        "device_model",
        "sub_din",
        "buyer",
        "vin",
        "sub_vin",
        "fin",
      ])
      .populate({ path: "min", populate: { path: "supplier" } })
      .populate({ path: "din", populate: { path: "distributor" } })
      .populate({ path: "hin", populate: { path: "customer" } })
      .populate({ path: "vin", populate: { path: "school" } })
      .populate({ path: "createdBy" })
      .exec();

    if (found_devices.length <= 0) {
      return res.status(404).send({
        status: true,
        message: "No available device found!",
      });
    }

    return res.status(200).send({
      status: true,
      message: "List of devices!",
      devices: found_devices,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const get_device = async (req, res) => {
  const { id } = req.params.id;

  if (!id) {
    return res.status(400).send({
      status: false,
      message: "",
    });
  }

  try {
    const device = await devices.findById(id);

    if (!device) {
      return res.status(400).send({
        status: 400,
        message: "",
      });
    }

    return res.status(200).send({
      status: true,
      device: device,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const update_device = async (req, res) => {
  const device_id = req.params.id;
  const {
    device_name,
    model,
    color,
    imei,
    build_no,
    vin,
    din,
    sch_vin,
    fin,
    hin,
  } = req.body;

  try {
    const updated_device = await devices.findByIdAndUpdate(
      device_id,
      {
        device_name,
        model,
        color,
        imei,
        build_no,
        vin,
        din,
        sch_vin,
        fin,
        hin,
      },
      { new: true, upsert: true }
    );

    return res
      .status(200)
      .send({ status: true, device_id: updated_device._id });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const device_purchase = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    phone,
    country,
    state,
    province,
    zip_code,
    address,
    device,
  } = req.body;

  try {
    const new_buyer = new buyers();

    new_buyer.firstname = firstname;
    new_buyer.lastname = lastname;
    new_buyer.email = email;
    new_buyer.phone = phone;
    new_buyer.country = country;
    new_buyer.state = state;
    new_buyer.address = address;

    if (province) {
      new_buyer.province = province;
    }

    if (zip_code) {
      new_buyer.zip_code = zip_code;
    }

    const saved_buyer = await new_buyer.save();

    if (saved_buyer) {
      const device = await devices.findByIdAndUpdate(
        device,
        { buyer: saved_buyer._id },
        { new: true, upsert: true }
      );

      return res.status(200).send({
        status: true,
        message: `Purchase of ${device.device_name} was successful!`,
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const assign_distributor_to_product = async (req, res) => {
  const { device, distributor } = req.body;

  try {
    const vin = await vins.findOne({ $or: [{ distributor: distributor }] });
    const updated = await devices
      .findByIdAndUpdate(device, { din: vin._id }, { upsert: true, new: true })
      .populate({ path: "din", populate: { path: "distributor" } })
      .exec();

    return res.status(200).send({
      status: true,
      message: `Congratulations! You have successfully assigned ${
        updated.device_name
      } to ${
        updated.din.distributor.firstname +
        " " +
        updated.din.distributor.lastname
      }`,
      device: updated._id,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const upload_devices = async (req, res) => {
  const cwd = process.cwd();
  const { user, vin, base64File } = req.body;
  
  if(!user) {
    return res.status(400).json({ message: 'Unauthorized! Access denied.' });
  }

  if (!base64File) {
    return res.status(400).json({ message: 'No file provided' });
  }

  const uploadsDir = `${cwd}uploads`;
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);  // Create the directory if it doesn't exist
  }

  try {
    // Decode the base64 string
    const buffer = Buffer.from(base64File, 'base64');

    // Define the file path to save the decoded Excel file
    const filePath = path.join(uploadsDir, `${user}-${Date.now()}.xlsx`);

    // Write the buffer to the file
    fs.writeFileSync(filePath, buffer);

    // Read the saved Excel file using xlsx
    const workbook = xlsx.readFile(filePath);

    // Extract data from the first sheet (you can adjust this to process other sheets if necessary)
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    const user_vin = await vins.findOne({ vin: vin });

    const uploaded_devices = jsonData.map(data => ({
      ...data,
      min: user_vin._id,
      createdBy: user
    }));

    const bulkDevices = uploaded_devices.map(device => ({
      insertOne: {
        document: device
      }
    }));

    const saved_devices = await devices.bulkWrite(bulkDevices);

    // Return the parsed data as a response
    res.status(200).json({
      message: 'File uploaded and processed successfully!',
      data: saved_devices,
    });
    
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).json({ message: 'Error processing the file' });
  }
};

const delete_device = async (req, res) => {
  const { id } = req.body;

  if(!id) {
    return res.status(400).send({
      status: false,
      message: ``
    });
  }

  try {
    const device = await devices.findOneAndDelete({ $and: [{_id: id}, { buyer: { $exists: false }}, { customer: { $exists: false }}] });

    if(!device) {
      return res.status(400).send({
        status: false,
        message: `You cannot delete a device that has been purchased!`
      });
    }

    return res.status(200).send({
      status: true,
      message: `Device was deleted successfully!`,
      deleted_id: device._id
    });
    
  } catch(error) {
    logger.error(error);
    return res.status(500).send({
      status: false,
      message: error
    });
  }
}; 

module.exports = {
  create_device,
  create_device_models,
  fetch_device_models,
  assign_distributor_to_product,
  fetch_devices,
  get_device,
  search_devices,
  update_device,
  upload_devices,
  device_purchase,
  delete_device
};
