const { sharedAnnouncements } = require("../models/Announcements");
const mongoose = require("mongoose");

const list = async (req, res) => {
  try {
    // Get top 50 users/customers with most referrals
    const leaderboard = await sharedAnnouncements.aggregate([
      //  Group and count metrics by user
      {
        $group: {
          _id: {
            customerId: "$customer",
            userId: "$user",
          },
          totalShares: { $sum: 1 },
          totalClicks: { $sum: "$clickCount" },
          totalLeads: { $sum: "$leadConvertCount" },
        },
      },

      //  Get customer details if available
      {
        $lookup: {
          from: "customers",
          localField: "_id.customerId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },

      //  Get user details if no customer found
      {
        $lookup: {
          from: "users",
          localField: "_id.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },

      //  Format the output data
      {
        $project: {
          _id: 0,
          // Get name from either customer or user
          name: {
            $cond: {
              if: { $gt: [{ $size: "$customerDetails" }, 0] },
              then: {
                $concat: [
                  { $arrayElemAt: ["$customerDetails.firstname", 0] },
                  " ",
                  { $arrayElemAt: ["$customerDetails.lastname", 0] },
                ],
              },
              else: {
                $concat: [
                  { $arrayElemAt: ["$userDetails.firstname", 0] },
                  " ",
                  { $arrayElemAt: ["$userDetails.lastname", 0] },
                ],
              },
            },
          },
          // Get profile photo from either customer or user
          photoUrl: {
            $cond: {
              if: { $gt: [{ $size: "$customerDetails" }, 0] },
              then: { $arrayElemAt: ["$customerDetails.photo_url", 0] },
              else: { $arrayElemAt: ["$userDetails.photo_url", 0] },
            },
          },
          // Include metrics
          shares: "$totalShares",
          clicks: "$totalClicks",
          leads: "$totalLeads",
          // Calculate conversion rate (leads/clicks * 100)
          conversionRate: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      "$totalLeads",
                      {
                        $cond: [
                          { $eq: ["$totalClicks", 0] },
                          1,
                          "$totalClicks",
                        ],
                      },
                    ],
                  },
                  100,
                ],
              },
              2, // Round to 2 decimal places
            ],
          },
        },
      },

      // Sort by performance (leads → clicks → shares)
      {
        $sort: {
          leads: -1, // Most leads first
          clicks: -1, // Then by most clicks
          shares: -1, // Then by most shares
        },
      },

      // Limit to top 50
      { $limit: 50 },
    ]);

    // Return formatted response
    return res.status(200).json({
      status: true,
      total: leaderboard.length,
      data: leaderboard.map((item, index) => ({
        rank: index + 1,
        name: item.name, // User/Customer name
        photoUrl: item.photoUrl, // Profile photo
        metrics: {
          shares: item.shares,
          clicks: item.clicks,
          leads: item.leads,
          conversionRate: item.conversionRate,
        },
      })),
    });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to retrieve leaderboard",
    });
  }
};

module.exports = { list };
