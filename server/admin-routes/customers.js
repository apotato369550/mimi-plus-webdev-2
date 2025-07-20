const express = require("express");
const customerController = require("../admin-controllers/customerController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();



router.get('/', verifyToken.authenticateToken, verifyToken.adminVerify, customerController.viewAllCustomers);

router.patch('/:userID/name', verifyToken.authenticateToken, verifyToken.adminVerify, customerController.updateCustomerName);
router.patch('/:userID/email', verifyToken.authenticateToken, verifyToken.adminVerify, customerController.updateCustomerEmail);


router.delete('/customer/:id', verifyToken.authenticateToken, verifyToken.adminVerify, customerController.deleteCustomer);

module.exports = router;
