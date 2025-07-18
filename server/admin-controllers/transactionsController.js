const db = require("../database/dbconn");
const { queryAsync } = require("../database/utils");



exports.getAllTransactions = async(req, res) => {

try {
    const query = ` (
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
        
      )
      ORDER BY sortDate DESC`;

    const transactions = await queryAsync(query);

    res.status(200).json({
      transactions,
      total: transactions.length
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }

};

