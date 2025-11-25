const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seedUsers() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lms',
    });

    console.log('Connected to database');
    
    // Default password for all users (change in production!)
    const defaultPassword = 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const users = [
      {
        email: 'admin@lms.local',
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
      },
      {
        email: 'instructor@lms.local',
        password_hash: passwordHash,
        first_name: 'Instructor',
        last_name: 'User',
        role: 'instructor',
      },
      {
        email: 'student@lms.local',
        password_hash: passwordHash,
        first_name: 'Student',
        last_name: 'User',
        role: 'student',
      },
    ];

    console.log('Creating users...');
    
    for (const user of users) {
      try {
        // Check if user already exists
        const [existing] = await connection.query(
          'SELECT id FROM users WHERE email = ?',
          [user.email]
        );

        if (existing.length > 0) {
          console.log(`⚠ User ${user.email} already exists, skipping...`);
          continue;
        }

        // Insert user
        const [result] = await connection.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role)
           VALUES (?, ?, ?, ?, ?)`,
          [user.email, user.password_hash, user.first_name, user.last_name, user.role]
        );

        const userId = result.insertId || (await connection.query('SELECT id FROM users WHERE email = ?', [user.email]))[0][0].id;

        // Create user profile
        await connection.query(
          'INSERT INTO user_profiles (user_id) VALUES (?)',
          [userId]
        );

        console.log(`✓ Created ${user.role}: ${user.email}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠ User ${user.email} already exists, skipping...`);
        } else {
          console.error(`✗ Error creating ${user.email}:`, err.message);
        }
      }
    }

    console.log('\n=== Login Credentials ===');
    console.log('Default password for all users: password123\n');
    users.forEach(user => {
      console.log(`${user.role.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: password123\n`);
    });
    console.log('⚠️  IMPORTANT: Change these passwords in production!');

  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedUsers().catch(console.error);


