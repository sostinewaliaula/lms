const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigrations() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'lms';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);
    
    console.log('Connected to MySQL database');
    
    // Create migrations tracking table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_filename (filename)
      )
    `);
    
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && file !== 'migrate.js')
      .sort();
    
    // Get already executed migrations
    const [executedMigrations] = await connection.query(
      'SELECT filename FROM migrations'
    );
    const executedFiles = new Set(executedMigrations.map((row) => row.filename));
    
    // Filter out already executed migrations
    const pendingMigrations = files.filter(file => !executedFiles.has(file));
    
    if (pendingMigrations.length === 0) {
      console.log('No new migrations to run. All migrations are up to date.');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} new migration(s) to run...`);
    
    for (const file of pendingMigrations) {
      console.log(`Running ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      try {
        // Execute the entire SQL file at once (MySQL supports multiple statements)
        await connection.query(sql);
        
        // Record this migration as executed
        await connection.query(
          'INSERT INTO migrations (filename) VALUES (?)',
          [file]
        );
        
        console.log(`✓ ${file} completed`);
      } catch (err) {
        // If it fails, try executing statement by statement for better error reporting
        console.log('Trying statement-by-statement execution...');
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\s*$/));
        
        let success = false;
        for (const statement of statements) {
          if (statement.length > 5) { // Only execute meaningful statements
            try {
              await connection.query(statement + ';');
            } catch (stmtErr) {
              // Ignore "table already exists" errors for idempotency
              if (!stmtErr.message.includes('already exists') && 
                  !stmtErr.message.includes('Duplicate') &&
                  !stmtErr.message.includes('Duplicate key') &&
                  !stmtErr.message.includes('Duplicate column')) {
                console.error(`Error in statement: ${statement.substring(0, 100)}...`);
                console.error('Error:', stmtErr.message);
                throw stmtErr;
              }
            }
          }
        }
        
        // Record this migration as executed only if we got here without throwing
        await connection.query(
          'INSERT INTO migrations (filename) VALUES (?)',
          [file]
        );
        
        console.log(`✓ ${file} completed`);
      }
    }
    
    console.log('All pending migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations().catch(console.error);
