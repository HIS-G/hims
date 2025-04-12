const { careers } = require("../models/Careers");
const { customers } = require("../models/Customers");
const logger = require("../utils/logger");

const create = async (req, res) => {
    const {title, description, renumeration, type, posted_by, applications} = req.body;

    try {
        const new_career = new careers();

        new_career.title = title;
        new_career.description = description;
        new_career.renumeration = renumeration;
        new_career.type = type;
        new_career.posted_by = posted_by;

        const saved_career = await new_career.save();

        return res.status(200).send({
            status: true,
            message: "job created successfully.",
            career: saved_career._id
        });
    } catch (error) {
        console.log(error);
        logger.error(error);
        return res.status(500).send({
            status: true,
            message: "Internal Server Error",
            error: error
        });
    }
};

const read = async (req, res) => {
    try {
        const careers_list = await careers.find();

        if(careers_list.length == 0) {
            return res.status(404).send({
                status: false.value,
                message: "No available jobs at this time!"
            });
        }

        return res.status(200).send({
            status: true,
            message: "List of careers",
            careers: careers_list
        });
    }catch(error) {
        logger.error(error);
        return res.status(500).send({
            status: false,
            message: "Internal Server Error",
            error: error
        });
    }
};

const read_one = async (req, res) => {
    const { id } = req.params;

    if(!id) {
        return res.status(400).send({
            status: false,
            message: "Unauthorized! Access denied."
        });
    }

    try {
        const career = await careers.findById(id);

        return res.status(200).send({
            status: true,
            message: "Career Details",
            career: career
        });
    } catch(error) {
        console.log(error);
        logger.error(error);
        res.status(500).send({
            status: false,
            message: "Internal Server Error",
            error: error
        });
    }
};

const update = async (req, res) => {

};

const apply = async (req, res) => {
    const { id } = req.params;

    if(!id) {

    }

    try {

    } catch (error) {
        logger.error(error);
        return res.status(500).send({
            status: false,
            message: "Internal Server Error",
            error: error
        });
    }
};

const delete_career = async (req, res) => {

};

module.exports = {
    create, 
    read, 
    read_one,
    update, 
    delete_career,
    apply
};