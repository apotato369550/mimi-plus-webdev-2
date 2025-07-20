const express = require("express");
const accountController = require('../customer-controllers/accountController');
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();


router.get("/", verifyToken.authenticateToken, accountController.getAccountDetails);
router.patch("/name", verifyToken.authenticateToken, accountController.updateAccountName);


module.exports = router





