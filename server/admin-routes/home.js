const express = require("express");
const homeController = require("../admin-controllers/homeController");
const homeProcessController = require("../admin-controllers/homeProcessControllers");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get('/', verifyToken.authenticateToken, verifyToken.adminVerify, homeController.adminDashboard);
router.get('/transactions', verifyToken.authenticateToken, verifyToken.adminVerify, homeController.getDashboardTransactions);
router.get('/top-customers', verifyToken.authenticateToken, verifyToken.adminVerify, homeController.getTopCustomers);

router.post('/process-pending', verifyToken.authenticateToken, verifyToken.adminVerify, homeProcessController.processPendingRedemptions);
router.post('/process-purchase', verifyToken.authenticateToken, verifyToken.adminVerify, homeProcessController.processPurchase);
router.post('/add-reward', verifyToken.authenticateToken, verifyToken.adminVerify, homeProcessController.addReward);

router.delete('/delete-reward/:rewardId', verifyToken.authenticateToken, verifyToken.adminVerify, homeProcessController.deleteReward);

module.exports = router;
