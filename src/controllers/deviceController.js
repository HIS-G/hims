const { devices, deviceModels, model_types } = require("../models/Devices");
const { buyers } = require("../models/Buyers");

const create_device = async (req, res) => {
  const { device_name, device_model, serial_no, imei, build_no } = req.body;

  try {
    const device = new devices();

    device.device_name = device_name;
    device.device_model = device_model;
    device.serial_no = serial_no;
    device.imei = imei;
    device.build_no = build_no;

    const saved_device = await device.save();

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
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

const create_device_models = async (req, res) => {
  const { model_name, type } = req.body;

  try {
    const new_model = new deviceModels();

    new_model.model_name = model_name;
    new_model.type = type;

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
    const device_list = await devices.find().populate("device_model").exec();

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
  const { imei, serial_no } = req.body;

  if (!imei && !serial_no) {
    return res.status(400).send({
      status: false,
      message: "",
    });
  }

  try {
    const device = await devices
      .findOne({
        $or: [{ imei: imei }, { serial_no: serial_no }],
      })
      .populate([
        "device-models",
        "din",
        "sub_din",
        "buyer",
        "vin",
        "sub_vin",
        "fin",
        "hin",
      ])
      .exec();

    if (!device) {
      return res.status(404).send({
        status: true,
        message: "kindly provide the right imei or serial no for your device",
      });
    }

    return res.status(200).send({
      status: true,
      message: "Congratulations on purchasing your Device!",
      device: device,
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

module.exports = {
  create_device,
  create_device_models,
  fetch_device_models,
  fetch_devices,
  get_device,
  search_devices,
  update_device,
  device_purchase,
};
