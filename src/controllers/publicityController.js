const { messages } = require("../models/Messages");
const { publicity } = require("../models/Publicize");
const { logger } = require("../utils/logger");

const create = async (req, res) => {
  const {
    title,
    name,
    content,
    contact,
    address,
    profession,
    industry,
    photo,
    type,
    featured,
  } = req.body;

  try {
    const publicize = new publicity();

    publicize.title = title;
    publicize.name = name;
    publicize.type = type;
    publicize.featured = featured ?? false;
    if (content) publicize.content = content;
    if (contact) publicize.contact = contact;
    if (address) publicize.address = address;
    if (profession) publicize.profession = profession;
    if (industry) publicize.industry = industry;
    if (photo) publicize.photo = photo;

    const saved = await publicize.save();

    return res.status(200).send({
      status: true,
      message: `Information saved successfully @${saved._id}`,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({
      status: false,
      message: "Oops, you have encountered a server error",
      error: error,
    });
  }
};

const read = async (req, res) => {
  try {
    const publications = await publicity.find();

    if (publications.length == 0) {
      return res.status(404).send({
        status: "Not found",
        message: "No result found",
      });
    }

    const result = {
      status: "true",
      message: "List of publications",
      data: publications,
    };

    return res.status(200).send(result);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({
      status: false,
      message: "Oops, you have encountered a server error",
      error: error,
    });
  }
};

const read_one = async (req, res) => {};

const search = async (req, res) => {
  try {
    const result = await publicity.find(req.body);

    if (result.length == 0) {
      return res.status(404).send({
        status: false,
        message: "No result was found.",
      });
    }

    return res.status(200).send({
      status: true,
      message: "List of sponsors",
      data: result,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({
      status: true,
      message: "Oops, you have encountered a server error.",
    });
  }
};

const update = async (req, res) => {
  const id = req.params.id;

  try {
    const updated_publicity = await publicity.findByIdAndUpdate(id, req.body, {
      upsert: true,
      new: true,
    });

    if (!updated_publicity) {
      return res.status(400).send({
        status: false,
        message: "failed to update data!",
      });
    }

    return res.status(200).send({
      status: true,
      message: "Congratulations, the data has been updated successfully",
      data: updated_publicity,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      status: false,
      message: "Oops, you have encountered a server error.",
    });
  }
};

const delete_data = async (req, res) => {};

module.exports = {
  create,
  read,
  read_one,
  search,
  update,
  delete_data,
};
