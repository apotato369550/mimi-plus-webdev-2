const express = require("express");
const mysql = require("mysql");
const QRCode = require("qrcode");

const db = require("../database/dbconn.js");

const { queryAsync } = require("../database/utils");

/******************************************************************
 *                      Home Controllers                          *
 ******************************************************************/

/******************************************************************
 *                      View Home Page
 ******************************************************************/

exports.viewHome = async (req, res) => {
  try {
    const userID = req.user.userID;
    console.log("Fetching home data for userID:", userID);

    const userResult = await queryAsync(
      "SELECT pointsBalance, totalEarnedLifetime, totalRedeemedLifetime FROM users WHERE userID = ?",
      [userID],
    );

    if (userResult.length === 0) {
      console.log("User not found for ID:", userID);
      return res.status(404).json({ message: "User not found" });
    }

    const pointsAvailable = userResult[0].pointsBalance;
    const totalEarnedLifetime = userResult[0].totalEarnedLifetime;
    const totalRedeemedLifetime = userResult[0].totalRedeemedLifetime;

    // Calculate last month's metrics
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    lastMonthStart.setHours(0, 0, 0, 0);

    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0); // Last day of previous month
    lastMonthEnd.setHours(23, 59, 59, 999);

    // Get last month's earned points (from transactions or redemptions)
    const lastMonthEarnedResult = await queryAsync(
      "SELECT COALESCE(SUM(pointsUsed), 0) as lastMonthEarned FROM redemption WHERE userID = ? AND dateRedeemed BETWEEN ? AND ?",
      [userID, lastMonthStart, lastMonthEnd]
    );

    // Get last month's redeemed points
    const lastMonthRedeemedResult = await queryAsync(
      "SELECT COALESCE(SUM(pointsUsed), 0) as lastMonthRedeemed FROM redemption WHERE userID = ? AND dateRedeemed BETWEEN ? AND ? AND redeemStatus = 'completed'",
      [userID, lastMonthStart, lastMonthEnd]
    );

    // Get last month's available points (this would be the balance at the end of last month)
    // For now, we'll estimate it based on current balance and this month's activity
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const thisMonthEarnedResult = await queryAsync(
      "SELECT COALESCE(SUM(pointsUsed), 0) as thisMonthEarned FROM redemption WHERE userID = ? AND dateRedeemed >= ?",
      [userID, thisMonthStart]
    );

    const thisMonthRedeemedResult = await queryAsync(
      "SELECT COALESCE(SUM(pointsUsed), 0) as thisMonthRedeemed FROM redemption WHERE userID = ? AND dateRedeemed >= ? AND redeemStatus = 'completed'",
      [userID, thisMonthStart]
    );

    const lastMonthEarned = lastMonthEarnedResult[0].lastMonthEarned;
    const lastMonthRedeemed = lastMonthRedeemedResult[0].lastMonthRedeemed;
    const thisMonthEarned = thisMonthEarnedResult[0].thisMonthEarned;
    const thisMonthRedeemed = thisMonthRedeemedResult[0].thisMonthRedeemed;

    // Estimate last month's available points
    const lastMonthAvailable = pointsAvailable + thisMonthRedeemed - thisMonthEarned;

    const quickRewards = await queryAsync("SELECT * FROM rewards LIMIT 6");
    console.log("Found", quickRewards.length, "quick rewards");

    res.status(200).json({
      pointsAvailable,
      totalEarnedLifetime,
      totalRedeemedLifetime,
      quickRewards,
      lastMonthMetrics: {
        pointsAvailable: lastMonthAvailable,
        totalEarned: lastMonthEarned,
        totalRedeemed: lastMonthRedeemed
      }
    });
  } catch (error) {
    console.error("Error in viewHome:", error);
    res.status(500).json({
      message: "Error fetching home page data",
      error: error.message,
    });
  }
};

/******************************************************************
 *                      QuickRedeem
 ******************************************************************/

exports.quickRedeem = async (req, res) => {
  const userID = req.user.userID;
  const { rewardID } = req.body;

  console.log("Quick redeem request - userID:", userID, "rewardID:", rewardID);

  try {
    const userPoints = await queryAsync(
      "SELECT pointsBalance FROM users WHERE userID = ?",
      [userID],
    );

    if (userPoints.length === 0) {
      console.log("User not found for ID:", userID);
      return res.status(404).json({ message: "User not found" });
    }

    const points = userPoints[0].pointsBalance;
    console.log("User points balance:", points);

    const rewardRow = await queryAsync(
      'SELECT * FROM rewards WHERE rewardID = ? AND isActive = "active"',
      [rewardID],
    );

    if (rewardRow.length === 0) {
      console.log("Reward not found or inactive for ID:", rewardID);
      return res.status(404).json({ message: "Reward not found or inactive" });
    }

    const rewardCost = rewardRow[0].pointsRequired;
    console.log("Reward cost:", rewardCost);

    if (points < rewardCost) {
      console.log("Insufficient points. Required:", rewardCost, "Available:", points);
      return res
        .status(400)
        .json({ message: "Insufficient points for this reward" });
    }

    //After redeeming reward it will go to pending
    //await queryAsync('UPDATE users SET pointsBalance = pointsBalance - ? WHERE userID = ?', [rewardCost, userID]);

    await queryAsync(
      "INSERT INTO redemption (userID, rewardID, dateRedeemed, pointsUsed, redeemStatus) VALUES (?, ?, NOW(), ?, ?)",
      [userID, rewardID, rewardCost, "pending"],
    );

    console.log("Reward redeemed successfully for userID:", userID);
    res.status(200).json({ message: "Reward added to pending" });
  } catch (error) {
    console.error("Error in quickRedeem:", error);
    res
      .status(500)
      .json({ message: "Error redeeming reward ", error: error.message });
  }
};

exports.recentActivity = async (req, res) => {
  const userID = req.user.customerID;
  const { rewardID } = req.body;
};
