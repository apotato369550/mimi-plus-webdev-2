const db = require("../database/dbconn");
const { queryAsync } = require("../database/utils");


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

    // Get specific pending redemptions with proper array handling
    const pendingRedemptions = await queryAsync(
      `SELECT r.redeemID, r.userID, r.pointsUsed 
       FROM redemption r 
       WHERE r.redeemStatus = 'pending' 
       AND r.redeemID IN (?)`,
      [redemptionIds.join(",")],
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
          const description = `${rewardName}${brand ? ` - ${brand}` : ''}`;

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
      message: `${actionText} ${processedCount} redemptions successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      processedCount,
      failedCount,
      totalProcessed: processedCount + failedCount,
    });
  } catch (error) {
    console.error("Error processing pending redemptions:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



