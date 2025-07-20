const express = require("express");
const homeController = require("../customer-controllers/homeController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

/******************************************************************
 *                       Home Page Routes
 ******************************************************************/

router.get("/", verifyToken.authenticateToken, homeController.viewHome);
router.post("/redeem", verifyToken.authenticateToken, homeController.quickRedeem);

module.exports = router;
