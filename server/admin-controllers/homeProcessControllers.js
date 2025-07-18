const db = require("../database/dbconn");
const { queryAsync } = require("../database/utils");


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
}
