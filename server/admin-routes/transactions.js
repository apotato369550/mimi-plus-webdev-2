const express = require("express");
const transactionsController = require("../admin-controllers/transactionsController");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", verifyToken.authenticateToken, verifyToken.adminVerify, transactionsController.getAllTransactions);

module.exports = router;
