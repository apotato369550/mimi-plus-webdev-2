const db = require("./dbconn");
const { promisify } = require("util");

// Promisify the query method for the pool
const queryAsync = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Utility function to disable foreign key checks
const disableForeignKeyChecks = async () => {
  try {
    await queryAsync("SET FOREIGN_KEY_CHECKS = 0");
    console.log("Foreign key checks disabled");
  } catch (error) {
    console.error("Failed to disable foreign key checks:", error);
  }
};

// Utility function to enable foreign key checks
const enableForeignKeyChecks = async () => {
  try {
    await queryAsync("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Foreign key checks enabled");
  } catch (error) {
    console.error("Failed to enable foreign key checks:", error);
  }
};

// Get a connection from the pool with promise
const getConnection = () => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) reject(err);
      else resolve(connection);
    });
  });
};

module.exports = {
  queryAsync,
  disableForeignKeyChecks,
  enableForeignKeyChecks,
  getConnection
};
