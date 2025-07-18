const db = require("../database/dbconn");
const { queryAsync } = require("../database/utils");




exports.getCustomerByHash = async (req, res) => {
  try {
    const { qrHash } = req.params;

    // Find customer by QR hash
    const customer = await queryAsync(
      "SELECT userID, name, totalEarnedLifetime FROM users WHERE qrcode = ?",
      [qrHash]
    );

    if (customer.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      customer: customer[0]
    });
  } catch (error) {
    console.error("Error finding customer:", error);
    res.status(500).json({ message: "Error finding customer" });
  }
};

exports.addCustomerPoints = async (req, res) => {
  try {
    const { customerID } = req.params;
    const { paymentAmount } = req.body;

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    // Calculate points (1 point per 50 pesos)
    const pointsToAdd = Math.floor(paymentAmount / 50);

    // Update customer points
    await queryAsync(
      "UPDATE users SET totalEarnedLifetime = totalEarnedLifetime + ?, pointsBalance = pointsBalance + ? WHERE userID = ?",
      [pointsToAdd, pointsToAdd, customerID]
    );

    // Record the transaction
    await queryAsync(
      "INSERT INTO transactions (userID, type, description, paymentAmount, pointsChange, date) VALUES (?, 'Purchase', CONCAT('Payment: ₱', ?), ?, ?, NOW())",
      [customerID, paymentAmount, paymentAmount, pointsToAdd]
    );

    res.status(200).json({
      message: "Points added successfully",
      pointsAdded: pointsToAdd
    });
  } catch (error) {
    console.error("Error adding points:", error);
    res.status(500).json({ message: "Error adding points" });
  }
}; 
