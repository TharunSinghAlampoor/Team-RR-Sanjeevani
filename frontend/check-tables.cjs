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
  
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('❌ Failed to show tables:', err.message);
    } else {
      console.log('Tables in database:', results);
    }
    connection.end();
  });
});
