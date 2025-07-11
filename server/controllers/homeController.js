const express = require('express');
const mysql = require('mysql');
const QRCode = require('qrcode');


const db = require("../database/dbconn.js");

const { queryAsync } = require("../database/utils");




exports.viewHome = async (req, res) => {

  try {

    const customerID = req.user.customerID;
     
  

    const userResult = await queryAsync('SELECT pointsBalance, totalEarnedLifetime, totalRedeemedLifetime FROM customers WHERE customerID = ?', [customerID]);

    
    const pointsAvailable = userResult[0].pointsBalance;
    const totalEarnedLifetime = userResult[0]. totalEarnedLifetime;
    const totalRedeemedLifetime = userResult[0].totalRedeemedLifetime


    
    
    if(userResult.length === 0){
    
      return res.status(404).json({message: 'Customer not found'});
      
    }

    const quickRewards = await queryAsync('SELECT * FROM rewards LIMIT 6');
    


    const points = userResult[0];
    

    res.status(200).json({

      pointsAvailable,
      totalEarnedLifetime,
      totalRedeemedLifetime,
      quickRewards
      
    });
  } catch(error) {


    console.log(error);
    res.status(500).json({

      message: 'Error fetching home page data',
      error: error.message
    })


  }
};

exports.quickRedeem = async (req, res) => {

  const customerID = req.user.customerID;
  const { rewardID } = req.body;

  try {
  
    const userPoints = await queryAsync('SELECT pointsBalance FROM customers WHERE customerID = ?', [customerID]);

    if (userPoints.length === 0) {
      return res.status(404).json({ message: 'User not found'});
    }

    const points = userPoints[0].pointsBalance;
    //console.log('points:', points);

    const rewardRow = await queryAsync('SELECT * FROM rewards WHERE rewardID = ? AND isActive = "active"', [rewardID]);
    

    if(rewardRow.length === 0) {
      return res.status(404).json({ message: 'Reward not found or inactive'});
    }
    
    const rewardCost = rewardRow[0].pointsRequired;

    if (points < rewardCost) {
      return res.status(400).json({ message: 'Insufficient points for this reward'});
    }
    //After redeeming reward it will go to pending
    //await queryAsync('UPDATE customers SET pointsBalance = pointsBalance - ? WHERE customerID = ?', [rewardCost, customerID]);

    await queryAsync('INSERT INTO redemption (customerID, rewardID, dateRedeemed, pointsUsed, redeemStatus) VALUES (?, ?, NOW(), ?, ?)', [customerID, rewardID, rewardCost, 'pending']);
    
    res.status(200).json({ message: 'Reward added to pending'});

  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Error redeeming reward ', error: error.message});
    
  }

}

