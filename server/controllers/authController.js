const mysql = require("mysql");
const express = require("express");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({

  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME


});



exports.register = (req, res) => {


  const { name, email, password } = req.body;


  if (!name || !email || !password) {

    return res.status(400).json({ message: "All fields are required"});

  }

  db.query("SELECT * FROM customers WHERE email = ? ", [email], (err, results) => {

    if(err) {
      console.error("Database query error:", err);

    }

    if (results.length > 0){

      return res.status(409).json({message: "Email already exists"});

    }

    const hashedPassword = bcrypt.hash(password, 11);


    db.query("INSERT INTO customers (name, email, password) VALUES ( ?, ?, ?)", [name, email, password] ,(err, results) => {

      if (err) {
        console.error("Database insertion error:", err);
        return res.status(500).json({ message: "Database error"});
      } else {

        return res.status(201).json({ message: "User registered successfully"});

      }
    })
  })
}

exports.login = (req, res) => {

 const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({message: "All fields are required"});
  }

   db.query("SELECT *FROM customers WHERE email = ?", [email], (err, results) => {
    
    if(err) {
      console.error("Database qeury error:", err);
      return res.status(500).json({ message: "Database error"});
    }
    if(results.length > 0) {

      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        
        if (err) {
          console.error("Password comparison error:", err);
          return res.status(500).json({ message: "Error comparing passwords"});
        }
      })
    }
   }) 
}



