const express = require("express");
const mysql = require("mysql");


const db = mysql.createConnection({

  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE


});

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
    const query = 'SELECT * FROM rewards';

    const rewards = await queryAsync(query);

    res.status(200).json({

      message: "Rewards retrieved successfully",
      data: rewards
    });

  }catch (error) {


    res.status(500).json({ message: "Error retrieving rewards", error: error.message})

  }
};
