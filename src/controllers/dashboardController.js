const { users } = require("../models/Users");
const { customers } = require("../models/Customers");
const { vins } = require("../models/vins");
const { devices } = require("../models/Devices");
const { roles } = require("../models/Roles");
const { schools } = require("../models/Schools");
const { tickets } = require("../models/Tickets");
const { sharedAnnouncements, comments, announcements } = require("../models/Announcements");
const { logger } = require("../utils/logger");

const dashboard_data = async (req, res) => {
    var vin;
    const { customer_id, user_id } = req.body;

    try{
        if(user_id) {
            const user = await users.findById(user_id).populate("role").exec();

            if(!user) {
                return res.status(404).send({
                    status: false,
                    message: "User not found!"
                });
            } 

            if(user.role.role == "SUPER_ADMIN" || user.role.role == "ADMIN") {
                vin = await vins.find({ user: user._id});

                const total_customers = await customers.countDocuments();
                console.log("total_customers:::::::", total_customers)
                /* const total_users = await users.countDocuments({ _id: {$ne: user_id }});
                console.log("total_users:::::::", total_users)
                const total_vins = await vins.countDocuments({ _id: { $ne: vin._id }});
                console.log("total_vins:::::::", total_vins) */
                const total_products = await devices.countDocuments();
                console.log("total_products:::::::", total_products)
                const total_schools = await schools.countDocuments();
                console.log("total_schools:::::::", total_schools)
                const total_tickets = await tickets.countDocuments();
                console.log("total_tickets:::::::", total_tickets)
                /* const total_announcements = await announcements.countDocuments();
                console.log("total_announcements:::::::", total_announcements)
                const total_comments = await comments.countDocuments();
                console.log("total_comments:::::::", total_comments)
                const total_roles = await roles.countDocuments();
                console.log("total_roles:::::::", total_roles) */

                return res.status(200).send({
                    status: true,
                    message: "",
                    data: {
                        info: [
                            /* {count: total_users, name: "Total Users"},  */
                            {count: total_customers, name: "Customer" }, 
                            {count: total_products, name: "Product"}, 
                            {count: total_tickets, name: "Ticket"},
                            /* {count: total_vins, name: "Total Vins"},
                            {count: total_announcements, name: "Total Announcements"},
                            {count: total_comments, name: "Total Comments"},
                            {count: total_roles, name: "Total Roles"}, */
                            {count: total_schools, name: "School"}
                        ],
                        attributes: {}
                    }
                })
            } else {

            }
        }   

        if(customer_id) {
            const customer = await customers.findById(customer_id);
            
            if(!customer) {
                return res.status(401).send({
                    status: false,
                    message: "Unauthorized! Access denied."
                })
            }

            vin = await vins.find({ customer: customer._id });

            const announcementShares = await sharedAnnouncements.countDocuments({ vin: vin });
            const products = await devices.countDocuments({ customer: customer._id });
            const comments_list = await comments.countDocuments({ customer: customer._id });
            const ticket_list = await tickets.countDocuments({ customer: customer._id });

            return res.status(200).send({
                status: true,
                message: "Your usage overview of HIS",
                data: {
                    info: [
                        {count: products, name: 'Product' }, 
                        {count: announcementShares, name:'Share' }, 
                        {count: comments_list, name: 'Comment'}, 
                        {count: ticket_list, name: "Ticket"}
                    ],
                    attributes: {},
                }
            });
        }
    } catch(error) {
        console.log(error);
        logger.error(error);
        return res.status(500).send({
            status: false,
            message: error
        });
    }
}

module.exports = {
    dashboard_data
};