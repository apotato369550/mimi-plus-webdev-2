const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Protected routes - require staff authentication
router.get("/users", authenticateToken, staffController.getAllUsers);
router.get("/users/:userId", authenticateToken, staffController.getUserById);
router.get("/pending", authenticateToken, staffController.getPendingTransactions);
router.post("/purchase", authenticateToken, staffController.processPurchase);

// Redemption routes
router.get("/redemptions/:userId", authenticateToken, staffController.getUserRedemptions);
router.post("/redemptions/process", authenticateToken, staffController.processRedemptions);

// Transaction routes
router.get("/transactions/:userId", authenticateToken, staffController.getTransactions);

// Existing routes
router.get("/customer/:qrHash", authenticateToken, staffController.getCustomerByHash);
router.post("/customer/:customerID/points", authenticateToken, staffController.addCustomerPoints);

module.exports = router; 