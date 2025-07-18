const db = require("../database/dbconn");

const { queryAsync } = require("../database/utils");

exports.adminDashboard = async (req, res) => {
  try {
    console.log("Fetching admin dashboard data...");

    const userResult = await queryAsync(
      "SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'customer'",
    );
    const totalUsers = userResult[0].totalUsers;
    console.log("Total users:", totalUsers);

    const activeMembersResult = await queryAsync(
      "SELECT COUNT(*) AS activeMembers FROM users WHERE pointsBalance > 0",
    );
    const activeMembers = activeMembersResult[0].activeMembers;
    console.log("Active members:", activeMembers);

    const pointsRedeemedResult = await queryAsync(
      "SELECT SUM(pointsUsed) AS totalPointsRedeemed FROM redemption WHERE redeemStatus = 'completed'",
    );
    const pointsRedeemed = pointsRedeemedResult[0].totalPointsRedeemed || 0;
    console.log("Points redeemed:", pointsRedeemed);

    const pendingResult = await queryAsync(
      "SELECT COUNT(*) AS totalPendingRedemptions FROM redemption WHERE redeemStatus = 'pending'",
    );
    const totalPending = pendingResult[0].totalPendingRedemptions;
    console.log("Total pending:", totalPending);

    // This month calculations
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    console.log("This month start:", thisMonthStart);

    thisMonthStart.setHours(0, 0, 0, 0);
    const thisMonthActiveResult = await queryAsync(
      "SELECT COUNT(DISTINCT userID) AS thisMonthActive FROM redemption WHERE dateRedeemed >= ?",
      [thisMonthStart],
    );
    const thisMonthActive = thisMonthActiveResult[0].thisMonthActive;
    console.log("This month active:", thisMonthActive);

    const thisMonthRedeemedResult = await queryAsync(
      "SELECT SUM(pointsUsed) AS thisMonthRedeemed FROM redemption WHERE redeemStatus = 'completed' AND dateRedeemed >= ?",
      [thisMonthStart],
    );
    const thisMonthRedeemed = thisMonthRedeemedResult[0].thisMonthRedeemed || 0;
    console.log("This month redeemed:", thisMonthRedeemed);

    const thisMonthPendingResult = await queryAsync(
      "SELECT COUNT(*) AS thisMonthPending FROM redemption WHERE redeemStatus = 'pending' AND dateRedeemed >= ?",
      [thisMonthStart],
    );
    const thisMonthPending = thisMonthPendingResult[0].thisMonthPending;
    console.log("This month pending:", thisMonthPending);

    // Engagement metrics
    const totalPointsEarnedResult = await queryAsync(
      "SELECT SUM(totalEarnedLifetime) AS totalPointsEarned FROM users",
    );
    const totalPointsEarned = totalPointsEarnedResult[0].totalPointsEarned || 0;
    console.log("Total points earned:", totalPointsEarned);

    const engagementRate =
      totalPointsEarned > 0
        ? Math.round((pointsRedeemed / totalPointsEarned) * 100)
        : 0;
    console.log("Engagement rate:", engagementRate);

    const dashboardData = {
      // Basic metrics
      totalUsers,
      activeMembers,
      pointsRedeemed: Math.round(pointsRedeemed),
      totalPending,

      // This month metrics
      thisMonthActive,
      thisMonthRedeemed: Math.round(thisMonthRedeemed),
      thisMonthPending,

      // Engagement data
      totalPointsEarned: Math.round(totalPointsEarned),
      engagementRate,
    };

    console.log("Final dashboard data:", dashboardData);

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error in adminDashboard:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



exports.getDashboardTransactions = async (req, res) => {
  try {
    const type = req.query.type || "all";
    const totalLimit = req.query.limit || 10;

    let query = `
      (
        SELECT 
          t.transactionID as id,
          DATE_FORMAT(t.date, '%m/%d/%Y') as date,
          t.date as sortDate,
          c.name,
          'Purchase' as type,
          'Purchase' as description,
          t.pointsChange as points,
          t.paymentAmount as payment
        FROM transactions t
        JOIN users c ON t.userID = c.userID
        WHERE t.paymentAmount > 0
        ORDER BY t.date DESC
        LIMIT ${totalLimit}
      )
      
      UNION ALL
      
      (
        SELECT 
          r.redeemID as id,
          DATE_FORMAT(r.dateRedeemed, '%m/%d/%Y') as date,
          r.dateRedeemed as sortDate,
          c.name,
          'Redeem' as type,
          CONCAT('Redeemed: ', rew.rewardName) as description,
          -r.pointsUsed as points,
          0 as payment
        FROM redemption r
        JOIN users c ON r.userID = c.userID
        JOIN rewards rew ON r.rewardID = rew.rewardID
        WHERE r.redeemStatus != 'denied'
        ORDER BY r.dateRedeemed DESC
        LIMIT ${totalLimit}
      )
      ORDER BY sortDate DESC
      LIMIT ${totalLimit}
    `;

    let params = [];

    // Add type filter
    if (type !== "all") {
      if (type === "purchase") {
        // Filter to only show completed redemptions and transactions
        query = query.replace(
          "WHERE r.redeemStatus != 'denied'",
          "WHERE r.redeemStatus = 'completed'",
        );
      } else if (type === "redeem") {
        // Filter to only show pending redemptions
        query = query.replace(
          "WHERE r.redeemStatus != 'denied'",
          "WHERE r.redeemStatus = 'pending'",
        );
        // Remove transactions part for redeem filter
        query = query.replace(/\(\s*SELECT.*?LIMIT \${totalLimit}\s*\)\s*UNION ALL\s*/s, "");
      }
    }

    const transactions = await queryAsync(query, params);

    res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error("Error fetching dashboard transactions:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getTopCustomers = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.name,
        c.pointsBalance as points,
        COUNT(t.transactionID) as purchases,
        c.role
      FROM users c
      LEFT JOIN transactions t ON c.userID = t.userID
      WHERE c.role = 'customer'
      GROUP BY c.userID, c.name, c.pointsBalance, c.role
      ORDER BY c.pointsBalance DESC
      LIMIT 5
    `;

    const users = await queryAsync(query);

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching top customers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



