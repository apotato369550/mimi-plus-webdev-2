const express = require("express");
const mysql = require("mysql");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const staffRoutes = require("./routes/staff");

/*******************************************************************
 *                     All predefined routes                                 *
 *******************************************************************/

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/admin", require("./routes/admin"));
app.use("/api/home", require("./routes/home"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/rewards", require("./routes/rewards"));
app.use("/api/staff", staffRoutes);
app.use("/api/auth", require("./routes/authentication"));

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
