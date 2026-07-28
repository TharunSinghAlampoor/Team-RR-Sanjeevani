const mysql = require('mysql2');

async function test(host, password) {
  return new Promise((resolve) => {
    const connection = mysql.createConnection({
      host: host,
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
  console.log('Testing host: localhost, password: "" (blank)...');
  let res = await test('localhost', '');
  console.log(res.success ? '🎉 SUCCESS!' : `❌ Failed: ${res.code} (${res.message})`);

  console.log('Testing host: localhost, password: "Tharun@123"...');
  res = await test('localhost', 'Tharun@123');
  console.log(res.success ? '🎉 SUCCESS!' : `❌ Failed: ${res.code} (${res.message})`);
}

run();
