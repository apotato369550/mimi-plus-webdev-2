const express = require("express");
const mysql = require("mysql");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");

/*******************************************************************
 *                     All predefined routes                                 *
 *******************************************************************/

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Admin Routes
app.use("/api/admin", require("./admin-routes/home"));
app.use("/api/admin/customers", require("./admin-routes/customers"));
app.use("/api/admin/rewards", require("./admin-routes/rewards"));
app.use("/api/admin/transactions", require("./admin-routes/transactions"));

//Staff Routes
app.use("/api/staff", require("./staff-routes/staff"));


//Customer Routes
app.use("/api/home", require("./routes/home"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/rewards", require("./routes/rewards"));
app.use("/api/auth", require("./routes/authentication"));
app.use("/api/account", require("./routes/account"));

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
