const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'Tharun@123',
  database: 'E-Commerce'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    return;
  }

  console.log('🎉 Successfully connected to database!');
  
  connection.query('DESCRIBE users', (err, results) => {
    if (err) {
      console.error('❌ Failed to describe table:', err.message);
    } else {
      console.log('Columns in users table:');
      console.table(results);
    }
    connection.end();
  });
});
