const express = require("express");
const staffController = require("../admin-controllers/staffManagementController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();



router.get('/', verifyToken.authenticateToken, verifyToken.adminVerify, staffController.viewAllStaff);
router.delete('/staff/:id', verifyToken.authenticateToken, verifyToken.adminVerify, staffController.deleteStaff);

module.exports = router;
