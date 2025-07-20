const express = require("express");
const transactionController = require("../customer-controllers/transactionController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", verifyToken.authenticateToken, transactionController.viewTransactions);

module.exports = router;
