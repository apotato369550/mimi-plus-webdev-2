const express = require("express");
const rewardsController = require("../controllers/rewardsController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", verifyToken.authenticateToken, rewardsController.viewRewards);
router.post("/redeem", verifyToken.authenticateToken,rewardsController.redeemReward);

module.exports = router;
