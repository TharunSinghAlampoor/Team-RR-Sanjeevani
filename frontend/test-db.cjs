const mysql = require('mysql2');

const passwordsToTest = [
  'Tharun@123',
  '',
  'root',
  'admin',
  'password',
  '123456',
  '12345678',
  'mysql'
];

async function testConnection(password) {
  return new Promise((resolve) => {
    const connection = mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: password
    });

    connection.connect((err) => {
      if (err) {
        resolve({ success: false, code: err.code, message: err.message });
      } else {
        connection.end();
        resolve({ success: true });
      }
    });
  });
}

async function run() {
  console.log('Starting MySQL root password discovery...');
  for (const pwd of passwordsToTest) {
    console.log(`Testing password: "${pwd}"...`);
    const result = await testConnection(pwd);
    if (result.success) {
      console.log(`\n🎉 SUCCESS! Connected successfully with password: "${pwd}"`);
      return;
    } else {
      console.log(`❌ Failed: ${result.code} (${result.message})`);
    }
  }
  console.log('\nCould not connect with any of the tested passwords.');
}

run();
