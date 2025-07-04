const express = require("express");
const rewardsController = require('../controllers/rewardsController');

const router = express.Router();

router.get('/rewards', rewardsController.viewRewards);
module.exports = router;


