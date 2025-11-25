const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms',
  });

  const [users] = await connection.query(
    'SELECT id, email, first_name, last_name, role, is_active FROM users ORDER BY role, email'
  );

  console.log('\n=== Users in Database ===\n');
  users.forEach(u => {
    console.log(`${u.role.toUpperCase().padEnd(10)} | ${u.email.padEnd(25)} | ${u.first_name} ${u.last_name} | Active: ${u.is_active ? 'Yes' : 'No'}`);
  });
  console.log(`\nTotal users: ${users.length}\n`);

  await connection.end();
}

verifyUsers().catch(console.error);


