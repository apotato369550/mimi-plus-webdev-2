const express = require("express");
const mysql = require("mysql");


const db = require("../database/dbconn.js");
const { queryAsync } = require("../database/utils");


/******************************************************************
 *                       View Rewards on Customer Page                            
 ******************************************************************/


exports.viewRewards = async (req, res) => {
  
  try {
    
    const userID = req.user.userID;
    const { category } = req.query;

    console.log('Received category query:', category);
    console.log('Query parameters:', req.query);

    const userPoints = await queryAsync('SELECT pointsBalance FROM users WHERE userID = ?', [userID]);

    if (userPoints.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const points = userPoints[0];//Customers Points
    
    let rewardsQuery = 'SELECT * FROM rewards WHERE isActive = "active"';
    let params = [];
   
    if(category) {
      rewardsQuery += ' AND category = ?';
      params.push(category);
    }
    
    console.log('SQL Query:', rewardsQuery);
    console.log('Query parameters:', params);
    
    const rewards = await queryAsync(rewardsQuery, params); 

    console.log('Found rewards:', rewards.length);
    console.log('First reward category (if any):', rewards[0]?.category);

    res.status(200).json({
      message: category ? `Rewards for category: ${category}` : 'All rewards',
      points: points,
      rewards: rewards
    });

  }catch (error) {
    console.error("Error retrieving rewards:", error);
    res.status(500).json({ message: "Error retrieving rewards", error: error.message})
  }
};


/******************************************************************
 *                       Reedem Reward on Rewards Page                            
 ******************************************************************/

exports.redeemReward = async (req, res) => {
  
  const userID = req.user.userID;
  const { rewardID } = req.body;
  try {
  
    const userPoints = await queryAsync('SELECT pointsBalance FROM users WHERE userID = ?', [userID]);

    if (userPoints.length === 0) {
      return res.status(404).json({ message: 'User not found'});
    }

    const points = userPoints[0].pointsBalance;
    console.log('points:', points);

    const rewardRow = await queryAsync('SELECT * FROM rewards WHERE rewardID = ? AND isActive = "active"', [rewardID]);
    

    if(rewardRow.length === 0) {
      return res.status(404).json({ message: 'Reward not found or inactive'});
    }
    
    const rewardCost = rewardRow[0].pointsRequired;

    if (points < rewardCost) {
      return res.status(400).json({ message: 'Insufficient points for this reward'});
    }
    //After redeeming reward it will go to pending
    
    await queryAsync('INSERT INTO redemption (userID, rewardID, dateRedeemed, pointsUsed, redeemStatus) VALUES (?, ?, NOW(), ?, ?)', [userID, rewardID, rewardCost, 'pending']);
    
    res.status(200).json({ message: 'Reward added to pending'});

  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Error redeeming reward ', error: error.message});
    
  }

};
