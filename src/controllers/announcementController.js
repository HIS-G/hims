const { announcements, sharedAnnouncements, comments } = require("../models/Announcements");
const { vins } = require("../models/vins");
const { logger } = require("../utils/logger");

const post_announcement = async (req, res) => {
    const { title, instructions, announcement, amount, reward, rewardTypes, twitterShare, facebookShare, linkedInShare } = req.body;

    try {
        const new_announcement = new announcements();

        new_announcement.title = title,
        new_announcement.instructions = instructions;
        new_announcement.announcement = announcement;
        new_announcement.reward = reward;
        if (amount) new_announcement.amount = amount; 
        if (reward) new_announcement.rewardTypes = rewardTypes;
        if (twitterShare) new_announcement.twitterShare = twitterShare;
        if (facebookShare) new_announcement.facebookShare = facebookShare;
        if (linkedInShare) new_announcement.linkedInShare = linkedInShare;

        const result = await new_announcement.save();

        return res.status(200).send({
            status: true,
            message: "Your announcement was created successfully!",
            announcementId: result._id
        });
    } catch(error) {
        console.log(error);
        logger.error(error);
        return res.status(500).send({
            status: false,
            message: error
        });
    }
};

const list_announcements = async (req, res) => {
    /* const { user } = req.body;

    if(!user) {
        return res.status(400).send({
            status: false,
            message: ``
        });
    } */

    try{
        const all_announcements = await announcements.find();

        if(all_announcements.length < 1) {
            return res.status(404).send({
                status: false,
                message: `There are currently no announcements!`
            });
        }

        return res.status(200).send({
            status: true,
            message: ``,
            announcements: all_announcements,
        })
    } catch(error) {
        logger.error(error);
        return res.status(500).send({
            status: false,
            message: error
        });
    }
    
};

const list_announcements_comments = async (req, res) => {
    const announcement_id = req.params.id;

    try {
        const announcement_comments = await comments.find({ announcement: announcement_id }).sort({ createdAt: -1 });

        if(announcement_comments.length == 0) {
            return res.status(404).send({
                status: false,
                message: "No comments available"
            });
        }   

        return res.status(200).send({
            status: true,
            message: "List of all Comments",
            comments: announcement_comments
        });
    } catch(error) {
        logger.error(error);
        return res.status(500).send({
            status: false,
            message: error
        });
    }
}

const get_announcement = async (req, res) => {
    const { announcement_id } = req.params;

    if(!announcement_id) {
        return res.status(404).send({
            status: false,
            message: ""
        });
    }

    try {
        const announcement = await announcements.findById(announcement_id);

        return res.status(200).send({
            status: true,
            message: '',
            announcement: announcement
        });
    } catch(error) {
        logger.error(error);
        return res.status(500).send({
            status: false,
            error: error
        });
    }
};

const update_announcement = async (req, res) => {};

const delete_announcement = async (req, res) => {
    const { id } = req.body;
    
    if(!id) {
        return res.status(400).send({
            status: false,
            message: "Invalid announcement ID",
        });
    }

    try {
        const announcement = await announcements.findByIdAndDelete(id);
        
        if(!announcement) {
            return res.status(404).send({
                status: false, 
                message: "Announcement not found"
            });
        }

        return res.status(200).send({
            status: true,
            message: "Announcement deleted successfully!"
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).send({
            status: false,
            message: error
        });
    }
};

const comment_on_announcement = async (req, res) => {
    const { user, customer, comment, announcement_id, parent_comment } = req.body;

    try{
        const new_comment = new comments();

        new_comment.announcement = announcement_id;
        new_comment.comment = comment;
        if (parent_comment) new_comment.parent_comment = parent_comment;
        if (user) new_comment.user = user;
        if (customer) new_comment.customer = customer;

        const saved_comment = await new_comment.save();
    
        return res.status(200).send({
            status: true,
            message: "comment saved successfully.",
            comment: saved_comment._id
        });        

    } catch(error) {
        logger.error(error);
        res.status(500).send({
            status: false,
            message: error
        });
    }
}

const claim_reward = async (req, res) => {};

const record_shared_announcement_visit = async (req, res) => {
    const { announcement, vin, shareLink } = req.body;

    try {
        const user_vin = await vins.find({ vin: vin });

        if(!user_vin) {
            return res.status(404).send({
                status: false,
                message: "Your VIN is invalid!"
            });
        }

        const shared_announcement = 
        await sharedAnnouncements
            .findOneAndUpdate(
            {
                $and: [
                    {announcement: announcement}, 
                    {vin: vin}, 
                    {shareLink: shareLink}
                ]
            }, 
            {
                $set: {vin: vin},
                $inc: {clickCount: 1 }
            },
            {
                new: true, 
                upsert: true, 
                /* setDefaultsOnInsert: true */
            }
        );

        /* const new_share = new sharedAnnouncements();

        new_share.announcement = announcement;
        new_share.shareLink = shareLink;
        new_share.vin = vin; */

        if(shared_announcement) {
            console.log(shared_announcement)
            return res.status(200).send({
                status: true,
                message: "Welcome to HIS marketplace!"
            });
        }
    } catch(error) {
        logger.error(error);
        return res.status(500).send({
            status: false,
            message: error
        });
    }
};

module.exports = {
    post_announcement,
    get_announcement,
    list_announcements,
    list_announcements_comments,
    update_announcement,
    comment_on_announcement,
    claim_reward,
    record_shared_announcement_visit,
    delete_announcement
}