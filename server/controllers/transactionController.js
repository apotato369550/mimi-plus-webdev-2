const express = require('express');
const mysql = require('mysql');
const { queryAsync } = require("../database/utils");

const db = require('../database/dbconn.js');

exports.viewTransactions = async (req, res) => {
  try {
    const customerID = req.user.customerID;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type; // 'all', 'redeemed', 'earned'
    const offset = (page - 1) * limit;

    console.log("Fetching transactions for customerID:", customerID, "page:", page, "type:", type);

    // Get user points
    const userPoints = await queryAsync('SELECT pointsBalance FROM customers WHERE customerID = ?', [customerID]);
    const points = userPoints[0]?.pointsBalance || 0;

    // Build the query to get both purchases and redemptions
    let transactionsQuery = `
      SELECT 
        t.customerID,
        'purchase' as type,
        t.pointsChange as amount,
        CONCAT('Payment - ₱', t.paymentAmount) as description,
        t.date as date,
        'completed' as status
      FROM transactions t
      WHERE t.customerID = ?
      
      UNION ALL
      
      SELECT 
        r.customerID,
        'redeemed' as type,
        r.pointsUsed as amount,
        CONCAT(rew.rewardName, ' - ', rew.brand) as description,
        r.dateRedeemed as date,
        r.redeemStatus as status
      FROM redemption r
      JOIN rewards rew ON r.rewardID = rew.rewardID
      WHERE r.customerID = ? AND r.redeemStatus != 'denied'
    `;
    
    let transactionsParams = [customerID, customerID];

    // Add type filter if specified
    if (type && type !== 'all') {
      if (type === 'completed') {
        // Show only completed transactions and purchases
        transactionsQuery = `
          SELECT 
            t.customerID,
            'purchase' as type,
            t.pointsChange as amount,
            CONCAT('Payment - ₱', t.paymentAmount) as description,
            t.date as date,
            'completed' as status
          FROM transactions t
          WHERE t.customerID = ?
          
          UNION ALL
          
          SELECT 
            r.customerID,
            'redeemed' as type,
            r.pointsUsed as amount,
            CONCAT(rew.rewardName, ' - ', rew.brand) as description,
            r.dateRedeemed as date,
            r.redeemStatus as status
          FROM redemption r
          JOIN rewards rew ON r.rewardID = rew.rewardID
          WHERE r.customerID = ? AND r.redeemStatus = 'completed'
        `;
      } else if (type === 'pending') {
        // Show only pending redemptions
        transactionsQuery = `
          SELECT 
            r.customerID,
            'redeemed' as type,
            r.pointsUsed as amount,
            CONCAT(rew.rewardName, ' - ', rew.brand) as description,
            r.dateRedeemed as date,
            r.redeemStatus as status
          FROM redemption r
          JOIN rewards rew ON r.rewardID = rew.rewardID
          WHERE r.customerID = ? AND r.redeemStatus = 'pending'
        `;
        transactionsParams = [customerID];
      }
    }

    // Order by status (pending first) then by date DESC
    transactionsQuery += ` ORDER BY 
      CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
      date DESC 
      LIMIT ? OFFSET ?`;
    transactionsParams.push(limit, offset);

    const transactions = await queryAsync(transactionsQuery, transactionsParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM (
        SELECT t.customerID
        FROM transactions t
        WHERE t.customerID = ?
        
        UNION ALL
        
        SELECT r.customerID
        FROM redemption r
        WHERE r.customerID = ? AND r.redeemStatus != 'denied'
      ) combined
    `;
    
    let countParams = [customerID, customerID];

    if (type && type !== 'all') {
      if (type === 'completed') {
        countQuery = `
          SELECT COUNT(*) as total
          FROM (
            SELECT t.customerID
            FROM transactions t
            WHERE t.customerID = ?
            
            UNION ALL
            
            SELECT r.customerID
            FROM redemption r
            WHERE r.customerID = ? AND r.redeemStatus = 'completed'
          ) combined
        `;
      } else if (type === 'pending') {
        countQuery = `
          SELECT COUNT(*) as total
          FROM redemption r
          WHERE r.customerID = ? AND r.redeemStatus = 'pending'
        `;
        countParams = [customerID];
      }
    }

    const totalResult = await queryAsync(countQuery, countParams);
    const total = totalResult[0].total;

    console.log("Found", transactions.length, "transactions out of", total, "total");

    res.status(200).json({
      transactions: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      points: points
    });
  } catch (error) {
    console.error("Error in viewTransactions:", error);
    res.status(500).json({
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};
