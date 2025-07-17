const db = require("../database/dbconn");

const { queryAsync } = require("../database/utils");

/******************************************************************
 *                       Admin Dashboard
 ******************************************************************/

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
    thisMonthStart.setHours(0, 0, 0, 0);
    console.log("This month start:", thisMonthStart);

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

/******************************************************************
 *                       Dashboard Transactions
 ******************************************************************/

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

/******************************************************************
 *                       Top Customers
 ******************************************************************/

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

/******************************************************************
 *                       Process Pending Redemptions
 ******************************************************************/

exports.processPendingRedemptions = async (req, res) => {
  try {
    const { action, redemptionIds } = req.body;

    if (!action || !redemptionIds || !Array.isArray(redemptionIds)) {
      return res.status(400).json({
        message:
          "Invalid request. Action and redemptionIds array are required.",
      });
    }

    // Get specific pending redemptions
    const pendingRedemptions = await queryAsync(
      "SELECT r.redeemID, r.userID, r.pointsUsed FROM redemption r WHERE r.redeemStatus = 'pending' AND r.redeemID IN (?)",
      [redemptionIds],
    );

    if (pendingRedemptions.length === 0) {
      return res.status(200).json({
        message: "No pending redemptions found with the provided IDs",
        processedCount: 0,
      });
    }

    // Process each pending redemption
    let processedCount = 0;
    let failedCount = 0;

    for (const redemption of pendingRedemptions) {
      try {
        if (action === "approve") {
          // Check if customer has enough points
          const customerResult = await queryAsync(
            "SELECT pointsBalance FROM users WHERE userID = ?",
            [redemption.userID],
          );

          if (customerResult.length === 0) {
            console.error(`Customer ${redemption.userID} not found`);
            failedCount++;
            continue;
          }

          const currentBalance = customerResult[0].pointsBalance;

          if (currentBalance < redemption.pointsUsed) {
            console.error(
              `Customer ${redemption.userID} has insufficient points`,
            );
            failedCount++;
            continue;
          }

          // Get reward details for transaction description
          const rewardResult = await queryAsync(
            "SELECT rew.rewardName, rew.brand FROM redemption r JOIN rewards rew ON r.rewardID = rew.rewardID WHERE r.redeemID = ?",
            [redemption.redeemID],
          );

          // Update redemption status to completed
          await queryAsync(
            "UPDATE redemption SET redeemStatus = 'completed' WHERE redeemID = ?",
            [redemption.redeemID],
          );

          // Deduct points from customer balance
          await queryAsync(
            "UPDATE users SET pointsBalance = pointsBalance - ? WHERE userID = ?",
            [redemption.pointsUsed, redemption.userID],
          );

          // Create transaction record for the redemption
          const rewardName = rewardResult[0]?.rewardName || "Unknown Reward";
          const brand = rewardResult[0]?.brand || "";
          const description = `${rewardName}${brand ? ` - ${brand}` : ""}`;

          await queryAsync(
            "INSERT INTO transactions(userID, paymentAmount, pointsChange, date) VALUES(?, ?, ?, NOW())",
            [redemption.userID, 0, redemption.pointsUsed],
          );
        } else if (action === "deny") {
          // Update redemption status to denied
          await queryAsync(
            "UPDATE redemption SET redeemStatus = 'denied' WHERE redeemID = ?",
            [redemption.redeemID],
          );
        }

        processedCount++;
      } catch (error) {
        console.error(
          `Error processing redemption ${redemption.redeemID}:`,
          error,
        );
        failedCount++;
      }
    }

    const actionText = action === "approve" ? "approved" : "denied";
    res.status(200).json({
      message: `${actionText} ${processedCount} redemptions successfully${failedCount > 0 ? `, ${failedCount} failed` : ""}`,
      processedCount,
      failedCount,
      totalProcessed: processedCount + failedCount,
    });
  } catch (error) {
    console.error("Error processing pending redemptions:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/******************************************************************
 *                       Process Purchase
 ******************************************************************/

exports.processPurchase = async (req, res) => {
  try {
    const { userId, costOfPurchase } = req.body;

    console.log("Processing purchase:", { userId, costOfPurchase });

    if (!userId || !costOfPurchase) {
      return res.status(400).json({
        message: "User ID and cost of purchase are required.",
      });
    }

    // Find customer by ID
    const customerResult = await queryAsync(
      "SELECT userID, name, pointsBalance FROM users WHERE userID = ?",
      [userId],
    );

    if (customerResult.length === 0) {
      return res.status(404).json({
        message: "Customer not found. Please check the user ID.",
      });
    }

    const customerID = customerResult[0].userID;
    const currentPoints = customerResult[0].pointsBalance;
    const pointsToAdd = Math.abs(Math.floor(costOfPurchase / 50));

    console.log("Customer found:", { customerID, currentPoints, pointsToAdd });

    // Add points to customer
    await queryAsync(
      "UPDATE users SET totalEarnedLifetime = totalEarnedLifetime + ?, pointsBalance = pointsBalance + ? WHERE userID = ?",
      [pointsToAdd, pointsToAdd, customerID],
    );

    // Create transaction record
    await queryAsync(
      "INSERT INTO transactions(userID, paymentAmount, pointsChange, date) VALUES(?, ?, ABS(?), NOW())",
      [customerID, costOfPurchase, pointsToAdd],
    );

    console.log("Purchase processed successfully:", {
      customerName: customerResult[0].name,
      costOfPurchase,
      pointsAdded: pointsToAdd,
    });

    res.status(200).json({
      message: "Purchase processed successfully",
      customerName: customerResult[0].name,
      costOfPurchase,
      pointsAdded: pointsToAdd,
      newBalance: currentPoints + pointsToAdd,
    });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/******************************************************************
 *                       Add New Reward
 ******************************************************************/

exports.addReward = async (req, res) => {
  try {
    const { name, description, pointsRequired, brand, category } = req.body;

    console.log("Adding reward:", {
      name,
      description,
      pointsRequired,
      brand,
      category,
    });

    if (!name || !description || !pointsRequired || !brand || !category) {
      return res.status(400).json({
        message:
          "All fields are required: name, description, pointsRequired, brand, category.",
      });
    }

    // Insert new reward
    const result = await queryAsync(
      "INSERT INTO rewards (rewardName, description, pointsRequired, brand, category, dateCreated, isActive) VALUES (?, ?, ?, ?, ?, NOW(), 'active')",
      [name, description, pointsRequired, brand, category],
    );

    console.log("Reward added successfully:", {
      rewardID: result.insertId,
      name,
    });

    res.status(201).json({
      message: "Reward added successfully",
      rewardID: result.insertId,
      name,
      description,
      pointsRequired,
      brand,
      category,
    });
  } catch (error) {
    console.error("Error adding reward:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/******************************************************************
 *                       Delete Reward
 ******************************************************************/

exports.deleteReward = async (req, res) => {
  try {
    const rewardId = req.params.rewardId;

    console.log("Deleting reward:", rewardId);

    if (!rewardId) {
      return res.status(400).json({
        message: "Reward ID is required.",
      });
    }

    // Check if reward exists
    const rewardResult = await queryAsync(
      "SELECT rewardID, rewardName FROM rewards WHERE rewardID = ?",
      [rewardId],
    );

    if (rewardResult.length === 0) {
      return res.status(404).json({
        message: "Reward not found.",
      });
    }

    // Soft delete: set isActive to 'inactive'
    const updateResult = await queryAsync(
      "UPDATE rewards SET isActive = 'inactive' WHERE rewardID = ?",
      [rewardId],
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        message: "Reward not found or could not be deleted.",
      });
    }

    console.log("Reward soft deleted (isActive set to inactive):", {
      rewardID: rewardId,
      rewardName: rewardResult[0].rewardName,
    });

    res.status(200).json({
      message: "Reward deleted successfully",
      rewardID: rewardId,
      rewardName: rewardResult[0].rewardName,
    });
  } catch (error) {
    console.error("Error deleting reward:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/******************************************************************
 *                       View All Customers
 ******************************************************************/

exports.viewAllCustomers = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    
    let sql = `
      SELECT userID, name, email, dateJoined, status, pointsBalance, role
      FROM users 
      WHERE role = 'customer'
    `;

    if (!showInactive) {
      sql += " AND status = 'active'";
    }

    sql += " ORDER BY userID DESC";

    const users = await queryAsync(sql);

    res.status(200).json({
      message: "All users retrieved",
      users: users,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  const customerID = req.params.id;

  if (!customerID) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  try {
    // Check if customer exists
    const customerResult = await queryAsync(
      "SELECT userID, name FROM users WHERE userID = ? AND role = 'customer'",
      [customerID],
    );

    if (customerResult.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Soft delete: update status to inactive
    const result = await queryAsync(
      "UPDATE users SET status = 'inactive' WHERE userID = ? AND role = 'customer'",
      [customerID],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Customer not found or could not be deactivated" });
    }

    console.log("Customer deactivated successfully:", {
      customerID,
      customerName: customerResult[0].name,
    });

    res.status(200).json({
      message: `Customer ${customerResult[0].name} deactivated successfully.`,
      customerID: customerID,
      customerName: customerResult[0].name,
    });
  } catch (error) {
    console.error("Error deactivating customer:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.reactivateCustomer = async (req, res) => {
  const customerID = req.params.id;

  if (!customerID) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  try {
    // Check if customer exists
    const customerResult = await queryAsync(
      "SELECT userID, name FROM users WHERE userID = ? AND role = 'customer'",
      [customerID],
    );

    if (customerResult.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Reactivate customer
    const result = await queryAsync(
      "UPDATE users SET status = 'active' WHERE userID = ? AND role = 'customer'",
      [customerID],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Customer not found or could not be reactivated" });
    }

    console.log("Customer reactivated successfully:", {
      customerID,
      customerName: customerResult[0].name,
    });

    res.status(200).json({
      message: `Customer ${customerResult[0].name} reactivated successfully.`,
      customerID: customerID,
      customerName: customerResult[0].name,
    });
  } catch (error) {
    console.error("Error reactivating customer:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/******************************************************************
 *                       View All Rewards
 ******************************************************************/

exports.viewAllRewards = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";

    let sql =
      "SELECT rewardID, rewardName, pointsRequired, category, isActive, brand, description FROM rewards";

    if (!showInactive) {
      sql += " WHERE isActive = 'active'";
    }

    sql += " ORDER BY rewardID DESC";

    const rewards = await queryAsync(sql);

    res.status(200).json({
      message: "All rewards",
      rewards: rewards,
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/******************************************************************
 *                     Add Points to the Customer
 ******************************************************************/

exports.addPoints = async (req, res) => {
  const customerID = req.params.customerID;

  const { paymentAmount } = req.body;

  if (!paymentAmount) {
    return res.status(400).json({ message: "Payment amount is required" });
  }

  const pointsToAdd = Math.abs(Math.floor(paymentAmount / 50));

  try {
    await queryAsync(
      "UPDATE users SET  totalEarnedLifetime = totalEarnedLifetime + ?, pointsBalance = pointsBalance + ? WHERE userID = ?",
      [pointsToAdd, pointsToAdd, customerID],
    );

    await queryAsync(
      "INSERT INTO transactions(userID, paymentAmount, pointsChange, date) VALUES(?, ?, ABS(?), NOW())",
      [customerID, paymentAmount, pointsToAdd],
    );

    res.status(200).json({ message: "Points Added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/******************************************************************
 *                       After scanning the QR Code
 ******************************************************************/

exports.viewCustomerPage = async (req, res) => {
  const customerID = req.params.customerID;

  console.log("customerid: ", customerID);
  try {
    const customer = await queryAsync(
      "SELECT userID, name, totalEarnedLifetime FROM users WHERE userID = ?",
      [customerID],
    );

    if (customer.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const pending = await queryAsync(
      "SELECT * FROM redemption WHERE userID = ? AND redeemStatus = 'pending'",
      [customerID],
    );

    res.status(200).json({
      customer: customer[0],
      pendingRedemptions: pending,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/******************************************************************
 *                       Get Pending Redemptions
 ******************************************************************/

exports.getPendingRedemptions = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.redeemID,
        r.dateRedeemed,
        u.name as customerName,
        rew.rewardName,
        r.pointsUsed,
        r.redeemStatus
      FROM redemption r
      JOIN users u ON r.userID = u.userID
      JOIN rewards rew ON r.rewardID = rew.rewardID
      WHERE r.redeemStatus = 'pending'
      ORDER BY r.dateRedeemed DESC
    `;

    const pendingRedemptions = await queryAsync(query);

    res.status(200).json({
      pendingRedemptions,
      total: pendingRedemptions.length,
    });
  } catch (error) {
    console.error("Error fetching pending redemptions:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/******************************************************************
 *                       Reactivate Reward
 ******************************************************************/

exports.reactivateReward = async (req, res) => {
  try {
    const rewardId = req.params.rewardId;

    console.log("Reactivating reward:", rewardId);

    if (!rewardId) {
      return res.status(400).json({
        message: "Reward ID is required.",
      });
    }

    // Check if reward exists
    const rewardResult = await queryAsync(
      "SELECT rewardID, rewardName FROM rewards WHERE rewardID = ?",
      [rewardId],
    );

    if (rewardResult.length === 0) {
      return res.status(404).json({
        message: "Reward not found.",
      });
    }

    // Set isActive to 'active'
    const updateResult = await queryAsync(
      "UPDATE rewards SET isActive = 'active' WHERE rewardID = ?",
      [rewardId],
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        message: "Reward not found or could not be reactivated.",
      });
    }

    console.log("Reward reactivated:", {
      rewardID: rewardId,
      rewardName: rewardResult[0].rewardName,
    });

    res.status(200).json({
      message: "Reward reactivated successfully",
      rewardID: rewardId,
      rewardName: rewardResult[0].rewardName,
    });
  } catch (error) {
    console.error("Error reactivating reward:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
