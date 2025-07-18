const express = require("express");
const authController = require('../controllers/authController');
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();



/******************************************************************
 *                       Authentication Routes                            
 ******************************************************************/

router.post('/login', authController.login)
router.post('/register', authController.register)
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get("/qrcode", authMiddleware.authenticateToken, authController.getQRCode);

module.exports = router;
