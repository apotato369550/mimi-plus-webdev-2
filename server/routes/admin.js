const express = require('express');
const router = express.Router()


const verifyToken = require('../middleware/authMiddleware');


const adminController = require('../controllers/adminController');

router.get('/', verifyToken.authenticateToken, verifyToken.adminVerify, adminController.adminDashboard);
router.get('/customers', verifyToken.authenticateToken, verifyToken.adminVerify, adminController.viewAllCustomers);
router.delete('/customers/:id', verifyToken.authenticateToken, verifyToken.adminVerify, adminController.deleteCustomer);
router.get('/rewards', verifyToken.authenticateToken, verifyToken.adminVerify, adminController.viewAllRewards);
router.post('/user/:customerID/addPoints', verifyToken.authenticateToken, verifyToken.adminVerify, adminController.addPoints);
router.get('/user/:customerID', verifyToken.authenticateToken, verifyToken.adminVerify, adminController.viewCustomerPage);


module.exports = router
