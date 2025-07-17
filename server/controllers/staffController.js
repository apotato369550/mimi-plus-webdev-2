const express = require("express");
const mysql = require("mysql");
const db = require("../database/dbconn.js");
const { queryAsync, getConnection } = require("../database/utils");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await queryAsync(
      "SELECT userID, name, email, qrcode FROM users WHERE role = 'customer'"
    );
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user details
    const user = await queryAsync(
      "SELECT userID, name, email, dateJoined, pointsBalance FROM users WHERE userID = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user transactions
    const transactions = await queryAsync(
      `SELECT 
        t.transactionID as id, 
        t.date, 
        'Purchase' as type, 
        CONCAT('Payment: ₱', t.paymentAmount) as description, 
        t.pointsChange as points,
        t.paymentAmount as payment
      FROM transactions t 
      WHERE t.userID = ? 
      ORDER BY t.date DESC`,
      [userId]
    );

    const userData = {
      ...user[0],
      transactions
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user details" });
  }
};

exports.getPendingTransactions = async (req, res) => {
  try {
    console.log("Fetching pending transactions...");
    const pending = await queryAsync(
      "SELECT r.redemptionID as transactionID, r.userID, r.date, 'Redeem' as type, " +
      "CONCAT('Redeem reward: ', rw.name) as description, " +
      "rw.pointsCost as pointsChange, u.name as userName " +
      "FROM redemption r " +
      "JOIN users u ON r.userID = u.userID " +
      "JOIN rewards rw ON r.rewardID = rw.rewardID " +
      "WHERE r.status = 'pending' " +
      "ORDER BY r.date DESC"
    );
    console.log("Pending transactions fetched:", pending);
    res.status(200).json({ pending });
  } catch (error) {
    console.error("Error fetching pending redemptions:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    res.status(500).json({ 
      message: "Error fetching pending redemptions",
      error: error.message,
      details: error.sqlMessage
    });
  }
};

exports.processPurchase = async (req, res) => {
  let connection;
  try {
    const { userID, costOfPurchase } = req.body;
    console.log("Processing purchase with details:", { userID, costOfPurchase });

    if (!userID || !costOfPurchase || costOfPurchase <= 0) {
      console.log("Invalid purchase details:", { userID, costOfPurchase });
      return res.status(400).json({ message: "Invalid purchase details" });
    }

    // Calculate points (1 point per 50 pesos)
    const pointsToAdd = Math.abs(Math.floor(costOfPurchase / 50));
    console.log("Points calculated:", { pointsToAdd, costOfPurchase });

    // Get a connection from the pool
    console.log("Getting database connection...");
    connection = await getConnection();
    console.log("Database connection acquired");

    // Begin transaction
    console.log("Beginning transaction...");
    await new Promise((resolve, reject) => {
      connection.beginTransaction(err => {
        if (err) {
          console.error("Failed to begin transaction:", err);
          reject(err);
        } else {
          console.log("Transaction started");
          resolve();
        }
      });
    });

    // Update user points
    console.log("Updating user points...");
    const updateQuery = "UPDATE users SET totalEarnedLifetime = totalEarnedLifetime + ?, pointsBalance = pointsBalance + ? WHERE userID = ?";
    console.log("Update query:", updateQuery, [pointsToAdd, pointsToAdd, userID]);
    
    const updateResult = await new Promise((resolve, reject) => {
      connection.query(updateQuery, [pointsToAdd, pointsToAdd, userID], (err, result) => {
        if (err) {
          console.error("Failed to update user points:", err);
          reject(err);
        } else {
          console.log("Update result:", result);
          resolve(result);
        }
      });
    });

    if (updateResult.affectedRows === 0) {
      throw new Error("User not found or points not updated");
    }
    console.log("User points updated successfully");

    // Record the transaction
    console.log("Recording transaction...");
    const description = `Payment: ₱${costOfPurchase}`;
    console.log("Transaction details:", { userID, description, pointsToAdd, costOfPurchase });

    const insertQuery = "INSERT INTO transactions (userID, paymentAmount, pointsChange, date) VALUES (?, ?, ?, NOW())";
    console.log("Insert query:", insertQuery, [userID, costOfPurchase, pointsToAdd]);
    
    const insertResult = await new Promise((resolve, reject) => {
      connection.query(insertQuery, [userID, costOfPurchase, pointsToAdd], (err, result) => {
        if (err) {
          console.error("Failed to insert transaction:", err);
          reject(err);
        } else {
          console.log("Insert result:", result);
          resolve(result);
        }
      });
    });

    if (!insertResult.insertId) {
      throw new Error("Failed to insert transaction record");
    }
    console.log("Transaction recorded successfully:", insertResult);

    // Commit transaction
    console.log("Committing transaction...");
    await new Promise((resolve, reject) => {
      connection.commit(err => {
        if (err) {
          console.error("Failed to commit transaction:", err);
          reject(err);
        } else {
          console.log("Transaction committed successfully");
          resolve();
        }
      });
    });

    res.status(200).json({
      message: "Purchase processed successfully",
      transactionId: insertResult.insertId
    });

  } catch (error) {
    console.error("Error processing purchase:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    
    // Rollback if we have a connection
    if (connection) {
      try {
        console.log("Rolling back transaction...");
        await new Promise((resolve, reject) => {
          connection.rollback(err => {
            if (err) {
              console.error("Failed to rollback transaction:", err);
              reject(err);
            } else {
              console.log("Transaction rolled back successfully");
              resolve();
            }
          });
        });
      } catch (rollbackError) {
        console.error("Error rolling back transaction:", rollbackError);
      }
    }

    res.status(500).json({ 
      message: "Error processing purchase",
      error: error.message,
      details: error.sqlMessage
    });
  } finally {
    // Release connection back to the pool
    if (connection) {
      connection.release();
      console.log("Database connection released");
    }
  }
};

// Existing functions
exports.getCustomerByHash = async (req, res) => {
  try {
    const { qrHash } = req.params;

    // Find customer by QR hash
    const customer = await queryAsync(
      "SELECT userID, name, totalEarnedLifetime FROM users WHERE qrcode = ?",
      [qrHash]
    );

    if (customer.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      customer: customer[0]
    });
  } catch (error) {
    console.error("Error finding customer:", error);
    res.status(500).json({ message: "Error finding customer" });
  }
};

exports.addCustomerPoints = async (req, res) => {
  try {
    const { customerID } = req.params;
    const { paymentAmount } = req.body;

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    // Calculate points (1 point per 50 pesos)
    const pointsToAdd = Math.floor(paymentAmount / 50);

    // Update customer points
    await queryAsync(
      "UPDATE users SET totalEarnedLifetime = totalEarnedLifetime + ?, pointsBalance = pointsBalance + ? WHERE userID = ?",
      [pointsToAdd, pointsToAdd, customerID]
    );

    // Record the transaction
    await queryAsync(
      "INSERT INTO transactions (userID, type, description, paymentAmount, pointsChange, date) VALUES (?, 'Purchase', CONCAT('Payment: ₱', ?), ?, ?, NOW())",
      [customerID, paymentAmount, paymentAmount, pointsToAdd]
    );

    res.status(200).json({
      message: "Points added successfully",
      pointsAdded: pointsToAdd
    });
  } catch (error) {
    console.error("Error adding points:", error);
    res.status(500).json({ message: "Error adding points" });
  }
}; 

exports.getUserRedemptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const status = req.query.status || 'all';

    let query = `
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
      WHERE r.userID = ? AND r.redeemStatus = 'pending'
      ORDER BY r.dateRedeemed DESC
    `;

    const pendingRedemptions = await queryAsync(query, [userId]);

    res.status(200).json({
      pendingRedemptions,
      total: pendingRedemptions.length
    });
  } catch (error) {
    console.error("Error fetching pending redemptions:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.processRedemptions = async (req, res) => {
  try {
    const { action, redemptionIds } = req.body;

    if (!action || !redemptionIds || !Array.isArray(redemptionIds)) {
      return res.status(400).json({
        message: "Invalid request. Action and redemptionIds array are required.",
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

exports.getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const type = req.query.type || "all";
    const limit = req.query.limit;

    let query = `
      SELECT 
        t.transactionID as id,
        DATE_FORMAT(t.date, '%m/%d/%Y') as date,
        t.date as sortDate,
        c.name,
        'Purchase' as type,
        CONCAT('Payment: ₱', t.paymentAmount) as description,
        t.pointsChange as points
      FROM transactions t
      JOIN users c ON t.userID = c.userID
      WHERE t.paymentAmount > 0 AND t.userID = ?
      
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
      JOIN users c ON r.userID = c.userID
      JOIN rewards rew ON r.rewardID = rew.rewardID
      WHERE r.redeemStatus != 'denied' AND r.userID = ?
      ORDER BY sortDate DESC
    `;

    let params = [userId, userId];

    // Add type filter
    if (type !== "all") {
      if (type === "purchase") {
        // Filter to only show completed redemptions and transactions
        query = query.replace(
          "WHERE r.redeemStatus != 'denied' AND r.userID = ?",
          "WHERE r.redeemStatus = 'completed' AND r.userID = ?",
        );
      } else if (type === "redeem") {
        // Filter to only show pending redemptions
        query = query.replace(
          "WHERE r.redeemStatus != 'denied' AND r.userID = ?",
          "WHERE r.redeemStatus = 'pending' AND r.userID = ?",
        );
        // Remove transactions part for redeem filter
        query = query.replace(/SELECT.*FROM transactions.*UNION ALL/, "");
        params = [userId]; // Only need one parameter since we removed the transactions part
      }
    }

    // Add limit only if specified
    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    const transactions = await queryAsync(query, params);

    res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}; 