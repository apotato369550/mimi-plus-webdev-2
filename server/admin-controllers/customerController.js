const db = require("../database/dbconn");
const { queryAsync } = require("../database/utils");



exports.viewAllCustomers = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    
    let sql = `
      SELECT userID, name, email, dateJoined, status, pointsBalance, role
      FROM users 
      WHERE role = 'customer'
    `;

    if (!showInactive) {
      sql += " AND status = 'active'";
    }

    sql += " ORDER BY userID DESC";

    const users = await queryAsync(sql);

    res.status(200).json({
      message: "All users retrieved",
      users: users,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  const customerID = req.params.id;

  if (!customerID) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  try {
    // Check if customer exists
    const customerResult = await queryAsync(
      "SELECT userID, name FROM users WHERE userID = ? AND role = 'customer'",
      [customerID],
    );

    if (customerResult.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Soft delete: update status to inactive
    const result = await queryAsync(
      "UPDATE users SET status = 'inactive' WHERE userID = ? AND role = 'customer'",
      [customerID],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Customer not found or could not be deactivated" });
    }

    console.log("Customer deactivated successfully:", {
      customerID,
      customerName: customerResult[0].name,
    });

    res.status(200).json({
      message: `Customer ${customerResult[0].name} deactivated successfully.`,
      customerID: customerID,
      customerName: customerResult[0].name,
    });
  } catch (error) {
    console.error("Error deactivating customer:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

