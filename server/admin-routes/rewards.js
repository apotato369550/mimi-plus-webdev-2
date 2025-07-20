const express = require("express");
const rewardsController = require("../admin-controllers/rewardsController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();


router.get('/', verifyToken.authenticateToken, verifyToken.adminVerify, rewardsController.viewAllRewards);
router.patch('/:rewardID/name', verifyToken.authenticateToken, verifyToken.adminVerify, rewardsController.updateRewardName);
router.patch('/:rewardID/category', verifyToken.authenticateToken, verifyToken.adminVerify, rewardsController.updateRewardCategory);
router.patch('/:rewardID/brand', verifyToken.authenticateToken, verifyToken.adminVerify, rewardsController.updateRewardBrand);
router.patch('/:rewardID/pointsRequired', verifyToken.authenticateToken, verifyToken.adminVerify, rewardsController.updatePointsRequired);






module.exports = router;



