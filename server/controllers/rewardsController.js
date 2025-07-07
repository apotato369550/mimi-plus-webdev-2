const express = require("express");
const mysql = require("mysql");


const db = require("../database/dbconn.js");


const queryAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};


exports.viewRewards = async (req, res) => {
  
  try {
    
    const customerID = req.user.customerID;
    const { category } = req.query;

    //console.log("customer:", req.user);

    const userPoints = await queryAsync('SELECT pointsBalance FROM customers WHERE customerID = ?', [customerID]);

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
    
    const rewards = await queryAsync(rewardsQuery, params); 


    res.status(200).json({

      message: category ? `Rewards for category: ${category}` : 'All rewards',
      points: points,
      rewards: rewards
    });

  }catch (error) {


    res.status(500).json({ message: "Error retrieving rewards", error: error.message})

  }
};
