const mysql = require("mysql");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: ", err);
  } else {
    console.log("Database connected successfully");
    // Disable foreign key checks
    db.query("SET FOREIGN_KEY_CHECKS = 0", (err) => {
      if (err) {
        console.error("Failed to disable foreign key checks:", err);
      } else {
        console.log("Foreign key checks disabled");
      }
    });
  }
});

module.exports = db;
