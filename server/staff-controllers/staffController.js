const db = require("../database/dbconn");
const { queryAsync } = require("../database/utils");



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
