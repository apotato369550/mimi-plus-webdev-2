-- Mimi+ Sample Data
-- Run this file after creating tables to populate with initial data

-- ============================================
-- Default Admin User
-- ============================================
-- Password: admin123
-- ⚠️ You should change this password after first login!
INSERT INTO `users` (`name`, `email`, `password`, `role`, `isVerified`, `pointsBalance`, `totalEarnedLifetime`, `status`) VALUES
('Admin User', 'admin@mimiplus.com', '$2b$10$lya/npQxm6La7nrkjfzNh.jJEcxWHAGseZMxQHllZWRgkH5LkGB36', 'admin', 1, 0, 0, 'active');

-- ============================================
-- Sample Staff User
-- ============================================
-- Password: staff123
INSERT INTO `users` (`name`, `email`, `password`, `role`, `isVerified`, `pointsBalance`, `totalEarnedLifetime`, `status`) VALUES
('Staff User', 'staff@mimiplus.com', '$2b$10$W2tJbJbJpnIiLx1VKnUY1eLbH3.vpErdDy4.MFgNjSo.XERGqKPMG', 'staff', 1, 0, 0, 'active');

-- ============================================
-- Sample Customer Users
-- ============================================
-- Password: customer123 (for all customer accounts)
INSERT INTO `users` (`name`, `email`, `password`, `role`, `isVerified`, `pointsBalance`, `totalEarnedLifetime`, `qrcode`, `status`) VALUES
('John Doe', 'john@example.com', '$2b$10$x4FxSYKs9zAZpq3149klX.ZCDogfKDDJf6bwXOVbzNsKSfPeLjcNW', 'customer', 1, 100, 500, 'QR123456', 'active'),
('Jane Smith', 'jane@example.com', '$2b$10$x4FxSYKs9zAZpq3149klX.ZCDogfKDDJf6bwXOVbzNsKSfPeLjcNW', 'customer', 1, 250, 1000, 'QR789012', 'active');

-- ============================================
-- Sample Rewards
-- ============================================
INSERT INTO `rewards` (`rewardName`, `description`, `pointsRequired`, `brand`, `category`, `isActive`) VALUES
('Free Coffee', 'Get a free regular coffee', 50, 'Mimi Cafe', 'Beverages', 'active'),
('10% Discount Voucher', '10% off on your next purchase', 100, 'Mimi Plus', 'Vouchers', 'active'),
('Free Pastry', 'Choose any pastry from our selection', 75, 'Mimi Cafe', 'Food', 'active'),
('Free Smoothie', 'Any regular smoothie of your choice', 120, 'Mimi Cafe', 'Beverages', 'active'),
('20% Discount Voucher', '20% off on your next purchase', 200, 'Mimi Plus', 'Vouchers', 'active'),
('Free Sandwich', 'Any sandwich from our menu', 150, 'Mimi Cafe', 'Food', 'active');

-- ============================================
-- Sample Transactions
-- ============================================
INSERT INTO `transactions` (`userID`, `type`, `description`, `paymentAmount`, `pointsChange`, `date`) VALUES
(3, 'Purchase', 'Payment: ₱500', 500.00, 50, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 'Purchase', 'Payment: ₱1000', 1000.00, 100, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 'Purchase', 'Payment: ₱2500', 2500.00, 250, DATE_SUB(NOW(), INTERVAL 7 DAY));

-- ============================================
-- Sample Redemptions
-- ============================================
INSERT INTO `redemption` (`userID`, `rewardID`, `dateRedeemed`, `pointsUsed`, `redeemStatus`) VALUES
(3, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), 50, 'completed'),
(4, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), 100, 'pending');
