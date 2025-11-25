# MySQL Migration Guide

The project has been updated to use MySQL/MariaDB instead of PostgreSQL for Windows development with HeidiSQL.

## Changes Made

1. **Database Driver**: Changed from `pg` to `mysql2`
2. **Connection**: Updated `backend/src/config/database.ts` to use MySQL connection pool
3. **Schema**: Converted SQL schema from PostgreSQL to MySQL syntax
4. **Models**: Need to update all model files to use MySQL syntax

## Model File Updates Required

All model files in `backend/src/models/` need to be updated:

### Key Changes:
1. Replace `$1, $2, $3` with `?` (parameterized queries)
2. Replace `result.rows[0]` with `getFirstRow(result)` 
3. Replace `result.rows` with `getAllRows(result)`
4. Remove `RETURNING` clauses (not supported in MySQL) - use separate SELECT instead
5. Import helper: `import { getFirstRow, getAllRows } from '../utils/db';`

### Example Conversion:

**Before (PostgreSQL):**
```typescript
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
return result.rows[0] || null;
```

**After (MySQL):**
```typescript
const result = await pool.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
);
return getFirstRow(result);
```

**Before (PostgreSQL with RETURNING):**
```typescript
const result = await pool.query(
  'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
  [email, password_hash]
);
return result.rows[0];
```

**After (MySQL):**
```typescript
await pool.query(
  'INSERT INTO users (email, password_hash) VALUES (?, ?)',
  [email, password_hash]
);
const result = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
return getFirstRow(result);
```

## Database Setup

1. Create database in HeidiSQL:
   - Database name: `lms`
   - User: `root`
   - Password: `mctm3223`

2. Run migrations:
   ```bash
   cd backend
   npm run build
   npm run migrate
   ```

## Environment Variables

The `.env` file has been configured with:
- DB_HOST=localhost
- DB_PORT=3306
- DB_NAME=lms
- DB_USER=root
- DB_PASSWORD=mctm3223

## Next Steps

1. Update all model files (see pattern above)
2. Test database connection
3. Run migrations
4. Start development server


