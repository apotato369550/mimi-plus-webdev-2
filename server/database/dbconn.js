const mysql = require("mysql");

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed: ", err);
  } else {
    console.log("Database connected successfully");
    // Disable foreign key checks
    connection.query("SET FOREIGN_KEY_CHECKS = 0", (err) => {
      if (err) {
        console.error("Failed to disable foreign key checks:", err);
      } else {
        console.log("Foreign key checks disabled");
      }
    });
    connection.release();
  }
});

module.exports = db;
