const db = require("./dbconn");

const { promisify } = require("util");

const queryAsync = promisify(db.query).bind(db);

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

module.exports = {
  queryAsync,
  disableForeignKeyChecks,
  enableForeignKeyChecks,
};
