// This script helps identify PostgreSQL-specific syntax in model files
// Run: node scripts/convert-to-mysql.js

const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../src/models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.ts'));

console.log('Files to update for MySQL:');
files.forEach(file => {
  const content = fs.readFileSync(path.join(modelsDir, file), 'utf8');
  const hasPostgresSyntax = 
    content.includes('$1') || 
    content.includes('result.rows') || 
    content.includes('RETURNING');
  
  if (hasPostgresSyntax) {
    console.log(`- ${file} (needs MySQL conversion)`);
  }
});


