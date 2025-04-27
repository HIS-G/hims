const { users } = require("../models/Users");
const { customers } = require("../models/Customers");
const { vins } = require("../models/vins");
const { devices } = require("../models/Devices");
const { roles } = require("../models/Roles");
const { schools } = require("../models/Schools");
const { tickets } = require("../models/Tickets");
const { sharedAnnouncements, comments, announcements } = require("../models/Announcements");
const { logger } = require("../utils/logger");
const moment = require("moment");

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

            const announcementShares = await sharedAnnouncements.findOne({ vin: vin }).select("-_id leadConvertCount");
            const products = await devices.countDocuments({ customer: customer._id });
            const comments_list = await comments.countDocuments({ customer: customer._id });
            const ticket_list = await tickets.countDocuments({ customer: customer._id });

            /* const ticket_data = await tickets.find(
                [
                    // 1. Filter records within the date range
                    {
                        $match: {
                        createdAt: {
                            $gte: new Date(), // Start date (inclusive)
                            $lt: new Date(endDate)     // End date (exclusive)
                        }
                        }
                    },
                    // 2. Group by day (YYYY-MM-DD format)
                    {
                        $group: {
                        _id: { 
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } // Convert to "YYYY-MM-DD"
                        },
                        totalValue: { $sum: "$value" },  // Sum up 'value' for each day
                        count: { $sum: 1 },              // Count records per day
                        records: { $push: "$$ROOT" }     // Store all records for the day
                        }
                    },
                    // 3. Sort by date (ascending)
                    { $sort: { _id: 1 } }
                ]
            ); */

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
};

const filtered_tickets = async (req, res) => {
    try {
        const ticket_list = await tickets.find(req.body);

        if(ticket_list.length == 0) {
            return res.status(404).send({
                status: false,
                message: 'There was no result found!'
            });
        }

        return res.status(200).send({
            status: true,
            tickets: ticket_list
        });
    } catch(error) {
        logger.error(error);
        return res.status(500).send({
            status: false,
            message: error
        });
    }
};

const filtered_announcements = async (req, res) => {

};



/**
 * @api {post} /dashboard/growth-trends Get Growth Trends
 * @apiName GetGrowthTrends
 * @apiGroup Dashboard
 * @apiDescription Retrieves growth trends data for either an admin user or a customer
 *
 * @apiBody {String} [user_id] ID of the admin user
 * @apiBody {String} [customer_id] ID of the customer
 * @apiBody {Object} timeRange Time range configuration for trend calculation
 * @apiBody {String} timeRange.type Type of time range ('days', 'months', 'years')
 * @apiBody {Number} timeRange.value Number of time units to look back
 *
 * @apiSuccess {Boolean} status Success status
 * @apiSuccess {Object} data Trend data
 * @apiSuccess {Object} data.customers Growth trends for customers (admin only)
 * @apiSuccess {Object} data.products Growth trends for products (customer only)
 * @apiSuccess {Object} data.shares Growth trends for shares (customer only)
 * @apiSuccess {Object} data.comments Growth trends for comments (customer only)
 * @apiSuccess {Object} data.tickets Growth trends for tickets (customer only)
 *
 * @apiError (404) {Boolean} status false
 * @apiError (404) {String} message User not found
 * @apiError (401) {Boolean} status false
 * @apiError (401) {String} message Unauthorized access
 * @apiError (400) {Boolean} status false
 * @apiError (400) {String} message Invalid request parameters
 * @apiError (500) {Boolean} status false
 * @apiError (500) {String} message Error message
 */
const getGrowthTrends = async (req, res) => {
    const { user_id, customer_id, timeRange } = req.body;
    
    try {
        if (user_id) {
            const user = await users.findById(user_id).populate("role").exec();
            
            if (!user) {
                return res.status(404).send({ status: false, message: "User not found!" });
            }

            if (user.role.role == "SUPER_ADMIN" || user.role.role == "ADMIN") {
                const trends = {
                    customers: await calculateGrowthTrend(customers, timeRange),
                    // products: await calculateGrowthTrend(devices, timeRange),
                    // tickets: await calculateGrowthTrend(tickets, timeRange),
                    // schools: await calculateGrowthTrend(schools, timeRange)
                };

                return res.status(200).send({
                    status: true,
                    data: trends
                });
            }
        }

        if (customer_id) {
            const customer = await customers.findById(customer_id);
            
            if (!customer) {
                return res.status(401).send({
                    status: false,
                    message: "Unauthorized! Access denied."
                });
            }

            const trends = {
                products: await calculateGrowthTrend(devices, timeRange, { customer: customer._id }),
                shares: await calculateGrowthTrend(sharedAnnouncements, timeRange, { customer: customer._id }),
                comments: await calculateGrowthTrend(comments, timeRange, { customer: customer._id }),
                tickets: await calculateGrowthTrend(tickets, timeRange, { customer: customer._id })
            };

            return res.status(200).send({
                status: true,
                data: trends
            });
        }

        return res.status(400).send({
            status: false,
            message: "Invalid request parameters"
        });

    } catch (error) {
        logger.error(error);
        return res.status(500).send({
            status: false,
            message: error.message || "Internal server error"
        });
    }
};



/**
 * Calculates growth trends for a given model over a specified time range
 * @function calculateGrowthTrend
 * @async
 * 
 * @param {mongoose.Model} model - Mongoose model to calculate trends for
 * @param {Object} timeRange - Time range configuration
 * @param {String} timeRange.type - Type of time range ('days', 'months', 'years')
 * @param {Number} timeRange.value - Number of time units to look back (default: 7 days)
 * @param {Object} query - Additional query parameters for filtering
 * 
 * @returns {Object} Growth trend data
 * @returns {Object} .timeRange - Time range information
 * @returns {String} .timeRange.start - Start date (YYYY-MM-DD)
 * @returns {String} .timeRange.end - End date (YYYY-MM-DD)
 * @returns {String} .timeRange.type - Time range type
 * @returns {Number} .timeRange.value - Time range value
 * @returns {Number} .total - Total count of records in the period
 * @returns {Array<Object>} .dailyCounts - Daily count data
 * @returns {String} .dailyCounts[].date - Date (YYYY-MM-DD)
 * @returns {Number} .dailyCounts[].count - Count for the day
 * @returns {Array<Number>} .growthRates - Daily growth rates in percentage
 * @returns {Number} .averageGrowth - Average growth rate for the period
 * 
 * @example
 * // Get customer growth trends for last 30 days
 * const trends = await calculateGrowthTrend(customers, { type: 'days', value: 30 });
 * 
 * // Get product growth trends for specific customer in last 6 months
 * const trends = await calculateGrowthTrend(devices, 
 *     { type: 'months', value: 6 }, 
 *     { customer: customerId }
 * );
 */
const calculateGrowthTrend = async (model, timeRange = { type: 'days', value: 7 }, query = {}) => {
    const endDate = moment().endOf('day');
    let startDate;

    switch (timeRange.type) {
        case 'months':
            startDate = moment().subtract(timeRange.value, 'months').startOf('day');
            break;
        case 'years':
            startDate = moment().subtract(timeRange.value, 'years').startOf('day');
            break;
        default:
            startDate = moment().subtract(timeRange.value, 'days').startOf('day');
    }

    const pipeline = [
        {
            $match: {
                ...query,
                createdAt: {
                    $gte: startDate.toDate(),
                    $lte: endDate.toDate()
                }
            }
        },
        {
            $facet: {
                dailyStats: [
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                            },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id": 1 } }
                ],
                total: [
                    { $count: "value" }
                ]
            }
        }
    ];

    const [result] = await model.aggregate(pipeline);
    const { dailyStats, total } = result;
    
    // Fill in missing dates with zero counts
    const dailyCounts = [];
    const current = moment(startDate);
    
    while (current.isSameOrBefore(endDate, 'day')) {
        const dateStr = current.format('YYYY-MM-DD');
        const existingData = dailyStats.find(d => d._id === dateStr);
        
        dailyCounts.push({
            date: dateStr,
            count: existingData ? existingData.count : 0
        });
        
        current.add(1, 'days');
    }

    // Calculate growth rates
    const growthRates = dailyCounts.map((day, index) => {
        if (index === 0) return 0;
        const previousCount = dailyCounts[index - 1].count;
        const currentCount = day.count;
        const growthRate = previousCount === 0 ? 0 : 
            ((currentCount - previousCount) / previousCount) * 100;
        return parseFloat(growthRate.toFixed(2));
    });

    const daysDiff = dailyCounts.length - 1;
    
    return {
        timeRange: {
            start: startDate.format('YYYY-MM-DD'),
            end: endDate.format('YYYY-MM-DD'),
            type: timeRange.type,
            value: timeRange.value
        },
        total: total[0]?.value || 0,
        dailyCounts,
        growthRates,
        averageGrowth: daysDiff > 0 ? 
            parseFloat((growthRates.reduce((a, b) => a + b, 0) / daysDiff).toFixed(2)) : 0
    };
};

module.exports = {
    dashboard_data,
    filtered_tickets,
    filtered_announcements,
    getGrowthTrends,
};




