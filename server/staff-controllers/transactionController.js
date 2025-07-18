const db = require("../database/dbconn");
const { queryAsync } = require("../database/utils");



 exports.getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const type = req.query.type || "all";
    const limit = req.query.limit;

    // Base queries for each type
    const transactionQuery = `
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
    `;

    const redemptionQuery = `
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
    `;

    let query, params;

    // Build query based on type
    if (type === "purchase") {
      query = transactionQuery;
      params = [userId];
    } else if (type === "redeem") {
      query = redemptionQuery.replace(
        "redeemStatus != 'denied'", 
        "redeemStatus = 'pending'"
      );
      params = [userId];
    } else { // 'all'
      query = `${transactionQuery} UNION ALL ${redemptionQuery}`;
      params = [userId, userId];
    }

    // Add sorting
    query += " ORDER BY sortDate DESC";

    // Add limit if specified
    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    const transactions = await queryAsync(query, params);
    res.status(200).json({ transactions });
    
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
