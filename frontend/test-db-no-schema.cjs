const mysql = require('mysql2');

async function run() {
  console.log('Testing MySQL connection without database name...');
  
  const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'Tharun@123'
  });

  connection.connect((err) => {
    if (err) {
      console.error('❌ Connection failed:', err.code, err.message);
      connection.end();
      return;
    }
    
    console.log('🎉 Successfully connected to MySQL server!');
    
    connection.query('CREATE DATABASE IF NOT EXISTS `E-Commerce`', (createErr) => {
      if (createErr) {
        console.error('❌ Failed to create database:', createErr.message);
      } else {
        console.log('🎉 Successfully created or verified database "E-Commerce"!');
      }
      connection.end();
    });
  });
}

run();
