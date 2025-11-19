# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mimi+ is a full-stack loyalty points and rewards management system with role-based access control. The application consists of a React frontend (client) and Node.js/Express backend (server) with MySQL database.

## Development Commands

### Backend (Server)
```bash
cd server
npm install              # Install dependencies
npm start                # Start server with nodemon (auto-reload on changes)
```
Server runs on port 5002 (configurable via PORT in .env)

### Frontend (Client)
```bash
cd client
npm install              # Install dependencies
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run preview          # Preview production build
```
Client runs on port 5173 with API proxy to backend at localhost:5002

## Architecture

### Backend Structure

The server follows a modular MVC-style architecture with route/controller separation:

**Routes are organized by user role:**
- `admin-routes/` + `admin-controllers/` - Admin management endpoints
  - home.js - Admin dashboard metrics
  - customers.js - Customer management
  - rewards.js - Reward catalog management
  - transactions.js - Transaction oversight
  - staff-management.js - Staff user management

- `customer-routes/` + `customer-controllers/` - Customer-facing endpoints
  - home.js - Customer dashboard/points display
  - authentication.js - Login, signup, email verification, password reset
  - account.js - Profile management
  - rewards.js - Browse and redeem rewards
  - transactions.js - Transaction history

- `staff-routes/` + `staff-controllers/` - Staff POS endpoints
  - staff.js - Process purchases, redemptions, QR code scanning

**Key backend patterns:**
- Authentication: JWT-based with Bearer tokens (authMiddleware.js)
- Role verification: `authenticateToken` → `adminVerify` or `authenticateStaff` middleware chain
- Database: MySQL with connection pooling (database/dbconn.js)
- Database utilities: Promise-based query wrappers in database/utils.js
- Email: nodemailer for verification and password reset flows

### Frontend Structure

React SPA with React Router and Tailwind CSS:

**Pages organized by user role:**
- Customer pages: home-page.jsx, rewards-page.jsx, transaction-page.jsx, account-page.jsx
- Admin pages: admin-dashboard.jsx, admin-rewards.jsx, admin-customers.jsx, admin-transactions.jsx
- Staff pages: staff-page.jsx
- Auth pages: login-page.jsx, signup-page.jsx, verification.jsx, reset-password.jsx

**Key frontend patterns:**
- Routing: All routes defined in App.jsx
- API calls: axios with localStorage-stored JWT in Authorization header
- State management: Local component state (no global state library)
- Styling: Tailwind CSS with custom components in components/
- API proxy: Vite proxies `/api/*` to backend server (vite.config.js)

### Authentication Flow

1. Login/signup via `/api/auth` endpoints
2. JWT token stored in localStorage on client
3. Client includes token in Authorization header: `Bearer <token>`
4. Server validates token in authMiddleware.js
5. Role-based access enforced via adminVerify/authenticateStaff middleware
6. Token contains: userId, role (admin/staff/customer), email

### Database Configuration

Uses MySQL with connection pooling. Configure via server/.env:
```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_database_name
DB_PORT=3306
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

**Note:** Foreign key checks are disabled globally on connection (dbconn.js:18)

## Common Workflows

### Adding a New API Endpoint

1. Create controller function in appropriate `*-controllers/` directory
2. Add route in corresponding `*-routes/` file
3. Apply authentication middleware if needed: `authenticateToken`, then `adminVerify` or `authenticateStaff`
4. Import route in server.js under appropriate role section

### Adding a New Page

1. Create page component in client/src/pages/
2. Add route in client/src/App.jsx
3. Create any needed components in client/src/components/
4. Make API calls using axios with token from localStorage

### Working with Database

- Use `queryAsync` from database/utils.js for promise-based queries
- Connection pooling handles concurrent requests
- Foreign key checks are disabled - be cautious with deletions

## Tech Stack

**Backend:**
- Node.js + Express
- MySQL (mysql package, not mysql2)
- JWT authentication (jsonwebtoken)
- bcryptjs for password hashing
- nodemailer for emails
- qrcode for QR generation

**Frontend:**
- React 19 + React Router 7
- Vite build tool
- Tailwind CSS 4 with CVA (class-variance-authority)
- axios for HTTP
- lucide-react + react-icons
- recharts for data visualization

## Key Security Considerations

- JWT secret must be set in server/.env
- Passwords hashed with bcryptjs before storage
- Role-based middleware prevents unauthorized access
- CORS enabled for cross-origin requests
- Foreign key checks disabled - deletions may need manual cleanup
