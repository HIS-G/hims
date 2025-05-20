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

    return res.status().send({
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

const read = async (req, res) => {};

const read_one = async (req, res) => {};

const search = async (req, res) => {
    const {} = req.query;
};

const update = async (req, res) => {};

const delete_data = async (req, res) => {};

module.exports = {
  create,
  read,
  read_one,
  search,
  update,
  delete_data,
};
