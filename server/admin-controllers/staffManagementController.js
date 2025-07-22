const db = require("../database/dbconn");
const { queryAsync } = require("../database/utils");
const bcrypt = require('bcrypt');



exports.viewAllStaff = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    
    let sql = `
      SELECT userID, name, email, dateJoined, status, role
      FROM users 
      WHERE role = 'staff'
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
    console.error("Error fetching staff:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  const userID = req.params.id;

  if (!userID) {
    return res.status(400).json({ message: "Staff ID is required" });
  }

  try {
    // Check if customer exists
    const staffResult = await queryAsync(
      "SELECT userID, name FROM users WHERE userID = ? AND role = 'staff'",
      [userID],
    );

    if (staffResult.length === 0) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Soft delete: update status to inactive
    const result = await queryAsync(
      "UPDATE users SET status = 'inactive' WHERE userID = ? AND role = 'staff'",
      [userID],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Staff not found or could not be deactivated" });
    }

    console.log("Staff deactivated successfully:", {
      userID,
      staffName: staffResult[0].name,
    });

    res.status(200).json({
      message: `Staff ${staffResult[0].name} deactivated successfully.`,
      userID: userID,
      staffName: staffResult[0].name,
    });
  } catch (error) {
    console.error("Error deactivating staff:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.addStaff = async(req, res) => {

  const {name, email, password, role} = req.body;

  if(!name || !email || !password || role){

    return res.status(400).json({ message: "All fields are required"});

  }

  try{

    const existingStaff = await queryAsync("SELECT * FROM users WHERE email = ?", [email]);
    

    if(existingStaff.length > 0){

      return res.status(400).json({message: 'Email already exists'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertStaff = `INSERT INTO users (name, email, password, role)
                         VALUES (?, ?, ?, ?)`;

    const result = await queryAsync(insertStaff, [name, email, hashedPassword, 'staff']);

    res.status(201).json({
      message: "Staff member added successfully",
      userID: result.insertId 

    })
  } catch(error){

    console.error("Error adding staff", error);
    res.status(500).json({ message: "Server error", error: error.message});
  }

}
