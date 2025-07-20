const express = require("express");
const mysql = require("mysql");


const db = require("../database/dbconn.js");
const { queryAsync } = require("../database/utils");


exports.getAccountDetails = async(req, res)=>{

  try {

    const userID = req.user.userID;

    const user = await queryAsync('Select userID, name, email FROM users WHERE userID = ?', [userID]);

    if(!user.length){
      return res.status(404).json({message: 'User Not Found'});
    }

    res.status(200).json(user[0]);

  } catch (error){

    console.error('Error fetching account details');
    res.status(500).json({ message: 'Server Error', error: error.message});
  }
};

exports.updateAccountName = async(req, res) => {

  try{

  const userID = req.user.userID;
  const { newName } = req.body;

  if(!newName || typeof newName !== 'string' || newName.trim().length === 0){
      return res.status(400).json({ message: 'Valid name is required'});
  }
  
  const result = await queryAsync("UPDATE users SET name = ? WHERE userID = ?", [newName.trim(), userID]);

    if(result.affectedRows === 0){

      return res.status(404).json({message: 'User not Found'});
    }

    res.status(200).json({
      newName: newName.trim()
    })

  } catch(error){

    console.error('Error updating name', error);
    res.status(500).json({ message: 'Server error', error: error.message});

  }
};

