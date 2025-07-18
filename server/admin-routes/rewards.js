const express = require("express");
const rewardsController = require("../admin-controllers/rewardsController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();


router.get('/', verifyToken.authenticateToken, verifyToken.adminVerify, rewardsController.viewAllRewards);





module.exports = router;



