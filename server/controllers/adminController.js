const db = require("../database/dbconn");

const { queryAsync } = require("../database/utils");

/******************************************************************
 *                       Admin Dashboard
 ******************************************************************/

exports.adminDashboard = async (req, res) => {
  try {
    console.log("Fetching admin dashboard data...");

    const customerResult = await queryAsync(
      "SELECT COUNT(*) AS totalCustomers FROM customers",
    );
    const totalCustomers = customerResult[0].totalCustomers;
    console.log("Total customers:", totalCustomers);

    const activeMembersResult = await queryAsync(
      "SELECT COUNT(*) AS activeMembers FROM customers WHERE pointsBalance > 0",
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
      "SELECT COUNT(DISTINCT customerID) AS thisMonthActive FROM redemption WHERE dateRedeemed >= ?",
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
      "SELECT SUM(totalEarnedLifetime) AS totalPointsEarned FROM customers",
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
      totalCustomers,
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
    const limit = req.query.limit;

    let query = `
      SELECT 
        t.transactionID as id,
        DATE_FORMAT(t.date, '%m/%d/%Y') as date,
        t.date as sortDate,
        c.name,
        'Purchase' as type,
        CONCAT('Payment - ₱', t.paymentAmount) as description,
        ABS(t.pointsChange) as points
      FROM transactions t
      JOIN customers c ON t.customerID = c.customerID
      WHERE t.paymentAmount > 0
      
      UNION ALL
      
      SELECT 
        r.redeemID as id,
        DATE_FORMAT(r.dateRedeemed, '%m/%d/%Y') as date,
        r.dateRedeemed as sortDate,
        c.name,
        'Redeem' as type,
        CONCAT('Redeemed: ', rew.rewardName) as description,
        -r.pointsUsed as points
      FROM redemption r
      JOIN customers c ON r.customerID = c.customerID
      JOIN rewards rew ON r.rewardID = rew.rewardID
      WHERE r.redeemStatus != 'denied'
      ORDER BY sortDate DESC
    `;

    // Add limit only if specified
    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

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
        query = query.replace(/SELECT.*FROM transactions.*UNION ALL/, "");
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
        COUNT(t.transactionID) as purchases
      FROM customers c
      LEFT JOIN transactions t ON c.customerID = t.customerID
      GROUP BY c.customerID, c.name, c.pointsBalance
      ORDER BY c.pointsBalance DESC
      LIMIT 5
    `;

    const customers = await queryAsync(query);

    res.status(200).json({ customers });
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
      "SELECT r.redeemID, r.customerID, r.pointsUsed FROM redemption r WHERE r.redeemStatus = 'pending' AND r.redeemID IN (?)",
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
            "SELECT pointsBalance FROM customers WHERE customerID = ?",
            [redemption.customerID],
          );

          if (customerResult.length === 0) {
            console.error(`Customer ${redemption.customerID} not found`);
            failedCount++;
            continue;
          }

          const currentBalance = customerResult[0].pointsBalance;

          if (currentBalance < redemption.pointsUsed) {
            console.error(
              `Customer ${redemption.customerID} has insufficient points`,
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
            "UPDATE customers SET pointsBalance = pointsBalance - ? WHERE customerID = ?",
            [redemption.pointsUsed, redemption.customerID],
          );

          // Create transaction record for the redemption
          const rewardName = rewardResult[0]?.rewardName || "Unknown Reward";
          const brand = rewardResult[0]?.brand || "";
          const description = `${rewardName}${brand ? ` - ${brand}` : ""}`;

          await queryAsync(
            "INSERT INTO transactions(customerID, paymentAmount, pointsChange, date) VALUES(?, ?, ?, NOW())",
            [redemption.customerID, 0, -redemption.pointsUsed],
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
    const { customerName, costOfPurchase } = req.body;

    console.log("Processing purchase:", { customerName, costOfPurchase });

    if (!customerName || !costOfPurchase) {
      return res.status(400).json({
        message: "Customer name and cost of purchase are required.",
      });
    }

    // Find customer by name
    const customerResult = await queryAsync(
      "SELECT customerID, name, pointsBalance FROM customers WHERE name = ?",
      [customerName],
    );

    if (customerResult.length === 0) {
      return res.status(404).json({
        message: "Customer not found. Please check the customer name.",
      });
    }

    const customerID = customerResult[0].customerID;
    const currentPoints = customerResult[0].pointsBalance;
    const pointsToAdd = Math.floor(costOfPurchase / 50);

    console.log("Customer found:", { customerID, currentPoints, pointsToAdd });

    // Add points to customer
    await queryAsync(
      "UPDATE customers SET totalEarnedLifetime = totalEarnedLifetime + ?, pointsBalance = pointsBalance + ? WHERE customerID = ?",
      [pointsToAdd, pointsToAdd, customerID],
    );

    // Create transaction record
    await queryAsync(
      "INSERT INTO transactions(customerID, paymentAmount, pointsChange, date) VALUES(?, ?, ?, NOW())",
      [customerID, costOfPurchase, pointsToAdd],
    );

    console.log("Purchase processed successfully:", {
      customerName,
      costOfPurchase,
      pointsAdded: pointsToAdd,
    });

    res.status(200).json({
      message: "Purchase processed successfully",
      customerName,
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

    // Disable foreign key checks and delete
    await queryAsync("SET FOREIGN_KEY_CHECKS = 0");
    const deleteResult = await queryAsync(
      "DELETE FROM rewards WHERE rewardID = ?",
      [rewardId],
    );
    await queryAsync("SET FOREIGN_KEY_CHECKS = 1");

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        message: "Reward not found or could not be deleted.",
      });
    }

    console.log("Reward deleted successfully:", {
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
    const sql =
      "SELECT customerID, name, email, dateJoined, pointsBalance FROM customers";
    const customers = await queryAsync(sql);

    res.status(200).json({
      message: "All customers retrieved",
      customers: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
//Delete Customer
exports.deleteCustomer = async (req, res) => {
  const customerID = req.params.id;

  if (!customerID) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  try {
    // Check if customer exists
    const customerResult = await queryAsync(
      "SELECT customerID, name FROM customers WHERE customerID = ?",
      [customerID],
    );

    if (customerResult.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Disable foreign key checks and delete
    await queryAsync("SET FOREIGN_KEY_CHECKS = 0");
    const result = await queryAsync(
      "DELETE FROM customers WHERE customerID = ?",
      [customerID],
    );
    await queryAsync("SET FOREIGN_KEY_CHECKS = 1");

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Customer not found or could not be deleted" });
    }

    console.log("Customer deleted successfully:", {
      customerID,
      customerName: customerResult[0].name,
    });

    res.status(200).json({
      message: `Customer ${customerResult[0].name} deleted successfully.`,
      customerID: customerID,
      customerName: customerResult[0].name,
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
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

  const pointsToAdd = Math.floor(paymentAmount / 50);

  try {
    await queryAsync(
      "UPDATE customers SET  totalEarnedLifetime = totalEarnedLifetime + ?, pointsBalance = pointsBalance + ? WHERE customerID = ?",
      [pointsToAdd, pointsToAdd, customerID],
    );

    await queryAsync(
      "INSERT INTO transactions(customerID, paymentAmount, pointsChange, date) VALUES(?, ?, ?, NOW())",
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
      "SELECT customerID, name, totalEarnedLifetime FROM customers WHERE customerID = ?",
      [customerID],
    );

    if (customer.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const pending = await queryAsync(
      "SELECT * FROM redemption WHERE customerID = ? AND redeemStatus = 'pending'",
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
        r.redeemID as id,
        DATE_FORMAT(r.dateRedeemed, '%m/%d/%Y') as date,
        c.name,
        'Redeem' as type,
        CONCAT(rew.rewardName, ' - ', rew.brand) as description,
        r.pointsUsed as points,
        r.redeemStatus as status
      FROM redemption r
      JOIN customers c ON r.customerID = c.customerID
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
