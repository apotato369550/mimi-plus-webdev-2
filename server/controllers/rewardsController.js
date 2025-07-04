const express = require("express");
const mysql = require("mysql");


const db = mysql.createConnection({

  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME


});


exports.viewRewards= async(req, res) => {
  
 try {
    const data = await db.query("SELECT * FROM rewards");
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to fetch data'});
  }
};
