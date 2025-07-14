const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const adminController = require("../controllers/adminController");

/******************************************************************
 *                       Admin Routes
 ******************************************************************/

router.get("/", verifyToken.authenticateToken, verifyToken.adminVerify, adminController.adminDashboard);
router.get("/transactions", verifyToken.authenticateToken, verifyToken.adminVerify, adminController.getDashboardTransactions);
router.get("/pending-redemptions", verifyToken.authenticateToken, verifyToken.adminVerify, adminController.getPendingRedemptions);
router.get("/top-customers", verifyToken.authenticateToken, verifyToken.adminVerify, adminController.getTopCustomers);

router.post("/process-pending", verifyToken.authenticateToken, verifyToken.adminVerify,adminController.processPendingRedemptions);
router.post("/process-purchase", verifyToken.authenticateToken, verifyToken.adminVerify, adminController.processPurchase);
router.post("/add-reward", verifyToken.authenticateToken, verifyToken.adminVerify, adminController.addReward);
router.delete("/delete-reward/:rewardId", verifyToken.authenticateToken, verifyToken.adminVerify, adminController.deleteReward);

router.get("/customers", verifyToken.authenticateToken, verifyToken.adminVerify, adminController.viewAllCustomers);
router.delete("/customers/:id", verifyToken.authenticateToken, verifyToken.adminVerify, adminController.deleteCustomer);
router.get("/rewards", verifyToken.authenticateToken, verifyToken.adminVerify, adminController.viewAllRewards);
router.post("/user/:customerID/addPoints", verifyToken.authenticateToken,verifyToken.adminVerify, adminController.addPoints);

router.get("/user/:customerID", verifyToken.authenticateToken, verifyToken.adminVerify, adminController.viewCustomerPage);

module.exports = router;
