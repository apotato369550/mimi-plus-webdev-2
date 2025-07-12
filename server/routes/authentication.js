const express = require("express");
const authController = require('../controllers/authController');

const router = express.Router();



/******************************************************************
 *                       Authentication Routes                            
 ******************************************************************/



router.post('/', authController.login)
router.post('/register', authController.register)
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
module.exports = router;



