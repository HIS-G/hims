const { announcements } = require("../models/Announcements");
const { logger } = require("../utils/logger");

const post_announcement = async (req, res) => {};

const list_announcements = async (req, res) => {
    const { user } = req.body;

    if(!user) {
        return res.status(400).send({
            status: false,
            message: ``
        });
    }

    try{
        const all_announcements = await announcements.find();

        if(all_announcements.length < 1) {
            return res.status(400).send({
                status: false,
                message: ``
            });
        }

        return res.status(200).send({
            status: true,
            message: ``,
            announcements: all_announcements
        })
    } catch(error) {
        logger.error(error);
        return res.status(500).send({
            status: false,
            message: error
        });
    }
    
};

const update_announcement = async (req, res) => {};

const delete_announcement = async (req, res) => {};

const comment_on_announcement = async (req, res) => {}

const claim_reward = async (req, res) => {};

const share_announcement = async (req, res) => {}

module.exports = {
    post_announcement,
    list_announcements,
    update_announcement,
    comment_on_announcement,
    claim_reward,
    share_announcement,
    delete_announcement
}