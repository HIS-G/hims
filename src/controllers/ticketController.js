const { tickets } = require("../models/Tickets");
const { customers } = require("../models/Customers");
const { users } = require("../models/Users");
const { logger } = require("../utils/logger");

const create_ticket = async (req, res) => {
    const { title, complaint, user, complaintCategory, customCategory, customer } = req.body;

    try {
        const new_ticket = new tickets();

        new_ticket.title = title;
        new_ticket.complaint = complaint;
        new_ticket.complaintCategory = complaintCategory;
        if(user) new_ticket.user = user;
        if(customer) new_ticket.customer = customer;

        const saved_ticket = await new_ticket.save();

        return res.status(200).send({
            status: true,
            message: 'Your ticket has been created successfully!',
            ticketId: saved_ticket._id 
        })
    } catch(error) {
        logger.error(error);
        return res.status(500).send({
            status: false,
            message: error
        });
    }
};

const list_tickets = async (req, res) => {
    const tickets = req.body;


};

const search_tickets = async (req, res) => {
    var current_user;
    const { customer, user } = req.body;

    if(!customer && !user) {
        return res.status(400).send({
            status: false,
            message: ''
        });
    }

    try {
        if(user) {
            current_user = await users.find({_id: user}).populate("role").exec();
            console.log(current_user);
        } else if(customer) {
            current_user = await customers.find({_id: customer}).populate("role").exec();
            console.log(current_user);
        }
        
        if(current_user.length == 0) {
            return res.status(404).send({
                status: true,
                message: "Not found!"
            });
        }

        if(current_user[0].role.role == "ADMIN" || current_user[0].role.role == "SUPER_ADMIN") {
            const ticket_list = await tickets.find();
            
            return res.status(200).send({
                status: true,
                message: "",
                tickets: ticket_list,
            });
        }

        const ticket_list = await tickets.find({$or: [{user: current_user._id}, {customer: current_user._id}]});

        return res.status(200).send({ 
            status: true, 
            tickets: ticket_list, 
            message: '' 
        });
        
    } catch(error) {
        logger.error(error);
        return res.status().send({
            status: false,
            message: error
        });
    }
}
 
const get_ticket = async (req, res) => {
    
};

const filter_tickets = async (req, res) => {

};

module.exports = {
    create_ticket,
    list_tickets,
    search_tickets,
    get_ticket,
    filter_tickets
}