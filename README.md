# Mimi+ Application

A full-stack application with React frontend and Node.js backend for managing Mimi+ points and rewards.

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js backend API

## Setup and Running

### Backend (Server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```
   PORT=5002
   JWT_SECRET=your_jwt_secret_here
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_database_name
   ```

4. Start the server:
   ```bash
   npm start
   ```

The server will run on port 5002.

### Frontend (Client)

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The client will run on port 5173 and proxy API calls to the backend.

## API Endpoints

### Home Page
- `GET /api/home` - Get home page data (points, rewards)
- `POST /api/home/redeem` - Redeem a reward

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration

## Testing the Connection

1. Start both the backend and frontend servers
2. Navigate to the home page in your browser
3. Check the browser's developer tools Network tab to see API calls
4. Check the server console for logs showing successful connections

## Features

- User authentication with JWT tokens
- Points balance tracking
- Quick rewards redemption
- Transaction history (coming soon)
- Admin panel for managing rewards

## Troubleshooting

- Ensure both servers are running on the correct ports
- Check that the database connection is properly configured
- Verify that JWT tokens are being stored in localStorage
- Check browser console and server logs for error messages 