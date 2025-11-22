-- Mimi+ Database Schema
-- Run this file first to create all necessary tables

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `userID` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
  `dateJoined` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `pointsBalance` INT DEFAULT 0,
  `totalEarnedLifetime` INT DEFAULT 0,
  `totalRedeemedLifetime` INT DEFAULT 0,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `isVerified` TINYINT(1) DEFAULT 0,
  `verificationToken` VARCHAR(255) DEFAULT NULL,
  `resetToken` VARCHAR(255) DEFAULT NULL,
  `resetExpires` DATETIME DEFAULT NULL,
  `qrcode` VARCHAR(255) UNIQUE DEFAULT NULL,
  INDEX idx_email (`email`),
  INDEX idx_role (`role`),
  INDEX idx_status (`status`),
  INDEX idx_qrcode (`qrcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Rewards Table
-- ============================================
CREATE TABLE IF NOT EXISTS `rewards` (
  `rewardID` INT AUTO_INCREMENT PRIMARY KEY,
  `rewardName` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `pointsRequired` INT NOT NULL,
  `brand` VARCHAR(255),
  `category` VARCHAR(100),
  `dateCreated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `isActive` ENUM('active', 'inactive') DEFAULT 'active',
  INDEX idx_isActive (`isActive`),
  INDEX idx_category (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Redemption Table
-- ============================================
CREATE TABLE IF NOT EXISTS `redemption` (
  `redeemID` INT AUTO_INCREMENT PRIMARY KEY,
  `userID` INT NOT NULL,
  `rewardID` INT NOT NULL,
  `dateRedeemed` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `pointsUsed` INT NOT NULL,
  `redeemStatus` ENUM('pending', 'completed', 'denied') DEFAULT 'pending',
  FOREIGN KEY (`userID`) REFERENCES `users`(`userID`) ON DELETE CASCADE,
  FOREIGN KEY (`rewardID`) REFERENCES `rewards`(`rewardID`) ON DELETE CASCADE,
  INDEX idx_userID (`userID`),
  INDEX idx_rewardID (`rewardID`),
  INDEX idx_status (`redeemStatus`),
  INDEX idx_dateRedeemed (`dateRedeemed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Transactions Table
-- ============================================
CREATE TABLE IF NOT EXISTS `transactions` (
  `transactionID` INT AUTO_INCREMENT PRIMARY KEY,
  `userID` INT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'Purchase',
  `description` TEXT,
  `paymentAmount` DECIMAL(10, 2) DEFAULT 0.00,
  `pointsChange` INT NOT NULL,
  `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userID`) REFERENCES `users`(`userID`) ON DELETE CASCADE,
  INDEX idx_userID (`userID`),
  INDEX idx_date (`date`),
  INDEX idx_type (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
