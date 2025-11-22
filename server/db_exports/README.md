# Database Setup Instructions

This folder contains SQL files to set up the Mimi+ database.

## Files

1. **01_create_tables.sql** - Creates all required tables (users, rewards, redemption, transactions)
2. **02_seed_data.sql** - Populates database with sample data (optional but recommended for testing)

## Setup Steps

### Option 1: Using phpMyAdmin (XAMPP Users)

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin in your browser: `http://localhost/phpmyadmin`
3. Click "New" to create a new database
4. Enter database name (e.g., `mimi_plus`) and click "Create"
5. Select your new database from the left sidebar
6. Click the "Import" tab at the top
7. Click "Choose File" and select `01_create_tables.sql`
8. Click "Go" at the bottom to execute
9. Repeat steps 6-8 for `02_seed_data.sql` (optional)

### Option 2: Using MySQL Command Line

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE mimi_plus;
USE mimi_plus;

# Import tables
SOURCE /path/to/server/db_exports/01_create_tables.sql;

# Import sample data (optional)
SOURCE /path/to/server/db_exports/02_seed_data.sql;
```

### Option 3: Using Command Line Shortcut

```bash
# From the server/db_exports directory
mysql -u root -p mimi_plus < 01_create_tables.sql
mysql -u root -p mimi_plus < 02_seed_data.sql
```

## Sample User Credentials

After running the seed data, you can login with these accounts:

**Admin Account:**
- Email: admin@mimiplus.com
- Password: admin123

**Staff Account:**
- Email: staff@mimiplus.com
- Password: staff123

**Customer Accounts:**
- Email: john@example.com
- Password: customer123

- Email: jane@example.com
- Password: customer123

⚠️ **IMPORTANT:** These are test accounts with default passwords. Change the admin password after first login in a production environment!

## Database Schema Overview

### Tables

1. **users** - Stores all user accounts (customers, staff, admin)
   - Tracks points balance, lifetime earnings, verification status
   - Includes QR codes for customer identification

2. **rewards** - Catalog of available rewards
   - Points required, categories, brands
   - Active/inactive status for management

3. **redemption** - Records of reward redemptions
   - Links users to rewards they've redeemed
   - Status tracking (pending, completed, denied)

4. **transactions** - Purchase history
   - Records payments and point changes
   - Used for transaction history and reporting

## Troubleshooting

- **Foreign key errors**: The application disables foreign key checks on connection. If you encounter issues, ensure tables are created in the order specified.
- **Import errors**: Make sure your MySQL user has sufficient privileges (CREATE, INSERT, etc.)
- **Character encoding**: All tables use utf8mb4 charset for emoji and international character support
