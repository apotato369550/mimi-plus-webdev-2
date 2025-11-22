# Mimi+ Setup Guide

Quick start guide for getting the Mimi+ application running on your local machine.

## Prerequisites to Install

1. **Node.js** - [Download from nodejs.org](https://nodejs.org/) (LTS version recommended)
2. **MySQL Database** - Choose one option:
   - **XAMPP** (Recommended for beginners) - [Download here](https://www.apachefriends.org/)
   - Standalone MySQL - [Download here](https://dev.mysql.com/downloads/mysql/)
   - Docker MySQL - `docker run --name mimi-mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0`

## Step-by-Step Setup

### 1. Install MySQL (Using XAMPP)

1. Download and install XAMPP
2. Open XAMPP Control Panel
3. Click "Start" next to MySQL
4. Click "Admin" next to MySQL to open phpMyAdmin
5. Click "New" in the left sidebar
6. Enter database name: `mimi_plus`
7. Click "Create"

### 2. Import Database Schema

**Option A: Using phpMyAdmin (XAMPP)**
1. In phpMyAdmin, select the `mimi_plus` database
2. Click the "Import" tab
3. Click "Choose File" and navigate to `server/db_exports/01_create_tables.sql`
4. Click "Go"
5. Repeat for `server/db_exports/02_seed_data.sql` (this adds test users and sample data)

**Option B: Using Command Line**
```bash
mysql -u root -p mimi_plus < server/db_exports/01_create_tables.sql
mysql -u root -p mimi_plus < server/db_exports/02_seed_data.sql
```

### 3. Configure Backend Environment

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create `.env` file from example:
   ```bash
   cp .env-example .env
   ```

3. Edit `server/.env` with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=              # Leave blank if using XAMPP default
   DB_DATABASE=mimi_plus
   DB_PORT=3306
   JWT_SECRET=my_super_secret_jwt_key_change_this_in_production
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

   **Note about EMAIL_USER and EMAIL_PASS:**
   - For Gmail, you need an [App Password](https://support.google.com/accounts/answer/185833)
   - These are used for sending verification emails
   - You can skip email setup initially and set these later

### 4. Install and Run Backend

```bash
# Make sure you're in the server directory
cd server

# Install dependencies
npm install

# Start the server
npm start
```

You should see:
```
Server is running on port 5002
Database connected successfully
Foreign key checks disabled
```

### 5. Install and Run Frontend

Open a **new terminal** window:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 6. Access the Application

Open your browser and go to: **http://localhost:5173**

## Test Accounts

After importing the seed data, you can login with:

### Admin Account
- **Email:** admin@mimiplus.com
- **Password:** admin123
- **Access:** Full system access, dashboard, user management

### Staff Account
- **Email:** staff@mimiplus.com
- **Password:** staff123
- **Access:** Process purchases, approve redemptions

### Customer Accounts
- **Email:** john@example.com or jane@example.com
- **Password:** customer123
- **Access:** View points, redeem rewards, transaction history

## Troubleshooting

### Database Connection Failed
- ✅ Check that MySQL is running (XAMPP Control Panel shows "Running")
- ✅ Verify database credentials in `server/.env`
- ✅ Ensure database `mimi_plus` exists in phpMyAdmin

### Port Already in Use
- **Backend (5002):** Change `PORT=5002` in `server/.env` to another port like `5003`
- **Frontend (5173):** Vite will automatically try the next available port (5174, etc.)

### Cannot Login
- ✅ Ensure you ran `02_seed_data.sql` to create test users
- ✅ Check browser console for error messages
- ✅ Verify server is running and connected to database

### Email Verification Not Working
- For development: You can manually verify users in phpMyAdmin
  - Go to `users` table
  - Find your user
  - Set `isVerified` to `1`
  - Set `verificationToken` to `NULL`

### Module Not Found Errors
- Run `npm install` in both `server` and `client` directories
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Next Steps

1. **Explore the Application:**
   - Login as admin to see the dashboard
   - Login as customer to browse rewards
   - Login as staff to process transactions

2. **Understand the Workflow:**
   - Customer signs up → Admin/Staff can see them
   - Staff processes purchase → Customer earns points
   - Customer redeems reward → Creates pending redemption
   - Staff approves → Reward is completed

3. **Read the Documentation:**
   - `CLAUDE.md` - Full architecture and development guide
   - `server/db_exports/README.md` - Database schema details
   - `README.md` - Project overview

## Development Workflow

### Making Changes to Backend
1. Edit files in `server/` directory
2. Server auto-restarts (thanks to nodemon)
3. Test API endpoints using browser or Postman

### Making Changes to Frontend
1. Edit files in `client/src/` directory
2. Vite hot-reloads automatically
3. See changes instantly in browser

### Database Changes
1. Modify SQL files in `server/db_exports/`
2. Re-import or manually update via phpMyAdmin
3. Update controllers/models as needed

## Common Commands Quick Reference

```bash
# Start backend
cd server && npm start

# Start frontend
cd client && npm run dev

# Build frontend for production
cd client && npm run build

# Run linter
cd client && npm run lint

# View database
# Open http://localhost/phpmyadmin in browser (if using XAMPP)
```

## Getting Help

- Check error messages in terminal
- Look at browser console (F12) for frontend errors
- Review `CLAUDE.md` for architecture details
- Check `server/db_exports/README.md` for database help

Happy coding! 🚀
