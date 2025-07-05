const express = require("express");
const mysql = require("mysql");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");




app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Database Connection

const db = mysql.createConnection({

  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME


});



app.use('/rewards', require('./routes/rewards'));
app.use('/', require('./routes/authentication'));
const PORT = process.env.DB_PORT;

app.listen(PORT, () => {

  console.log('Server is running on port 5002');
})
