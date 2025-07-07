const { Activities } = require("../models/Activities");
const { users } = require("../models/Users");
const { customers } = require("../models/Customers");
const logger = require("../utils/logger");

const log_activity = async (action, user, role) => {
  const new_activity = new Activities();

  new_activity.action = action;

  if (role != "CUSTOMER") {
    new_activity.user = user;
  } else {
    new_activity.customer = user;
  }

  try {
    const saved = await new_activity.save();

    return saved;
  } catch (error) {
    logger.error(error);
    console.log(error);
    return {
      message: "Failed to save activity to logs",
    };
  }
};

const fetch_activities = async (req, res) => {
  try {
    const account = await users.findById(req.uid).populate("role");

    if (!account || account.role.role == "CUSTOMER") {
      return res.status(401).send({
        status: "failed",
        message: "Unauthorized! Access denied",
      });
    }

    const activities = await Activities.find();

    if (activities.length == 0) {
      return res.status(404).send({
        status: "Not found!",
        message: "Oops, there are no logged activities at the moment",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "",
      data: activities,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({
      status: "internal server error",
      message: "Oops, you have encountered an internal server error",
    });
  }
};

const my_activities = async (req, res) => {
  try {
    const account = await customers.findById(req.uid);

    if (!account) {
      return res.status(401).send({
        status: "failed",
        message: "Unauthorized! Access denied",
      });
    }

    const activities = await Activities.find({ customer: req.uid });

    if (activities.length == 0) {
      res.status(404).send({
        status: "Not Found",
        message: "You do not have any activities logged at the moment.",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "",
      activities: activities,
    });
  } catch (error) {
    logger.error(error);
    console.log(error);
    return res.status(500).send({
      status: "internal server error",
      message: "Oops, you have encountered an internal server errror",
    });
  }
};

const search_activities = async (req, res) => {};

module.exports = {
  log_activity,
  fetch_activities,
  my_activities,
  search_activities,
};
