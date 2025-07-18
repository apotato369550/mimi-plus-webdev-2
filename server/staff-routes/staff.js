const express = require("express");
const staffController = require("../staff-controllers/staffController");
const redemptionController = require("../staff-controllers/redemptionController");
const transactionController = require('../staff-controllers/transactionController.js');
const existingRoutes = require('../staff-controllers/existingRoutes');
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();


// Protected routes - require staff authentication
router.get("/users", verifyToken.authenticateToken, verifyToken.authenticateStaff, staffController.getAllUsers);
router.get("/users/:userId", verifyToken.authenticateToken,verifyToken.authenticateStaff, staffController.getUserById);
router.get("/pending", verifyToken.authenticateToken,verifyToken.authenticateStaff, staffController.getPendingTransactions);
router.post("/purchase", verifyToken.authenticateToken,verifyToken.authenticateStaff, staffController.processPurchase);

// Redemption routes
router.get("/redemptions/:userId", verifyToken.authenticateToken,verifyToken.authenticateStaff, redemptionController.getUserRedemptions);
router.post("/redemptions/process", verifyToken.authenticateToken,verifyToken.authenticateStaff, redemptionController.processRedemptions);

// Transaction routes
router.get("/transactions/:userId", verifyToken.authenticateToken,verifyToken.authenticateStaff, transactionController.getTransactions);

// Existing routes
router.get("/customer/:qrHash", verifyToken.authenticateToken,verifyToken.authenticateStaff, existingRoutes.getCustomerByHash);
router.post("/customer/:customerID/points", verifyToken.authenticateToken,verifyToken.authenticateStaff, existingRoutes.addCustomerPoints);

module.exports = router; 

