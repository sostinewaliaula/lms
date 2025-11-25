# Windows Development Setup Guide

## Quick Start

Your project is now configured for MySQL/MariaDB development on Windows with HeidiSQL.

### Database Configuration
- **Host**: localhost
- **Port**: 3306
- **Database**: lms
- **User**: root
- **Password**: mctm3223

### Steps to Get Started

1. **Create the database in HeidiSQL:**
   - Open HeidiSQL
   - Connect to your MySQL server
   - Create a new database named `lms`
   - Or the migration script will create it automatically

2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Run database migrations:**
   ```bash
   npm run build
   npm run migrate
   ```
   This will create all the tables in your `lms` database.

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

5. **In a new terminal, start the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## What's Been Updated

✅ Database driver changed from PostgreSQL (`pg`) to MySQL (`mysql2`)
✅ Database connection configuration updated
✅ SQL schema converted to MySQL syntax
✅ Migration script updated for MySQL
✅ Environment variables configured
✅ User model updated to MySQL syntax

## Still Need to Update

⚠️ **Model Files**: Most model files still need to be converted from PostgreSQL to MySQL syntax. The pattern is:

- Replace `$1, $2` → `?`
- Replace `result.rows[0]` → `getFirstRow(result)`
- Replace `result.rows` → `getAllRows(result)`
- Remove `RETURNING` clauses and use separate SELECT queries

See `MYSQL_MIGRATION.md` for detailed conversion examples.

## Testing the Connection

You can test if the database connection works by running:
```bash
cd backend
npm run dev
```

If you see "Server is running on port 5000" without errors, the connection is working!

## Troubleshooting

**Connection Error:**
- Verify MySQL/MariaDB is running
- Check credentials in `backend/.env`
- Ensure database `lms` exists (or let migration create it)

**Migration Errors:**
- Make sure you have proper permissions
- Check if tables already exist (migration is idempotent)

**Port Already in Use:**
- Change PORT in `backend/.env` if 5000 is taken
- Update FRONTEND_URL accordingly


