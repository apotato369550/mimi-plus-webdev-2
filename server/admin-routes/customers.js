const express = require("express");
const customerController = require("../admin-controllers/customerController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();



router.get('/', verifyToken.authenticateToken, verifyToken.adminVerify, customerController.viewAllCustomers);
router.delete('/customer/:id', verifyToken.authenticateToken, verifyToken.adminVerify, customerController.deleteCustomer);

module.exports = router;
