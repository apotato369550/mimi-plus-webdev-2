const mysql = require("mysql");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../database/dbconn.js");


exports.register = async (req, res) => {


  const { name, email, password } = req.body;


  if (!name || !email || !password) {

    return res.status(400).json({ message: "All fields are required"});

  }

  db.query("SELECT * FROM customers WHERE email = ? ", [email], async (err, results) => {

    if(err) {
      console.error("Database query error:", err);

    }

    if (results.length > 0){

      return res.status(409).json({message: "Email already exists"});

    }
    

    try {
    
      const hashedPassword = await bcrypt.hash(password, 10);
      db.query("INSERT INTO customers (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], (err, results) => {

        if (err) {
          console.error("Insert error:", err);
          return res.status(500).json({ message: "Database error"});

        }

        res.status(201).json({ message: "User registered successfully"});
      })
    } catch (hashError) {
      console.error("Hashing error:", hashError);
      return res.status(500).json({ message: "Error hashing password"});
    }

    
    });

}





exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  // Find user by email
  db.query('SELECT * FROM customers WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    console.log("user:", user);
        const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const payload = {
      customerID: user.customerID,
      email: user.email,
      name: user.name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });



      res.status(200).json({
      message: 'Login successful!',
      customerID: user.customerID,
      token: token
      });
  });
};
