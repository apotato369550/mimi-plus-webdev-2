const express = require("express");
const router = express.Router();
const rewardsController = require("../controllers/rewardsController");


router.get("/", rewardsController.getAllRewards);

module.exports = router;


