const mysql = require('mysql2');

async function run() {
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

    console.log('🎉 Connected to database successfully. Starting migration...');

    // Run the migration steps sequentially
    connection.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
      if (err) return handleError(err, connection);

      // 1. Copy data from old columns to new columns (where they are null or empty)
      console.log('Copying data from old columns to new columns...');
      connection.query(`
        UPDATE users SET 
          mobile = CASE WHEN mobile IS NULL OR mobile = '' THEN mobile_number ELSE mobile END,
          created_time = CASE WHEN created_time IS NULL THEN created_date ELSE created_time END,
          updated_time = CASE WHEN updated_time IS NULL THEN updated_date ELSE updated_time END
      `, (err) => {
        if (err) return handleError(err, connection);

        console.log('🎉 Data copied successfully.');

        // 2. Drop old columns
        console.log('Dropping old columns (mobile_number, created_date, updated_date)...');
        connection.query(`
          ALTER TABLE users 
            DROP COLUMN mobile_number,
            DROP COLUMN created_date,
            DROP COLUMN updated_date
        `, (err) => {
          if (err) {
            console.log('⚠️ Note during drop columns (they might be dropped already):', err.message);
          } else {
            console.log('🎉 Old columns dropped successfully.');
          }

          // 3. Make sure new columns are NOT NULL
          console.log('Enforcing NOT NULL constraints on new columns...');
          connection.query(`
            ALTER TABLE users 
              MODIFY COLUMN created_time DATETIME(6) NOT NULL,
              MODIFY COLUMN mobile VARCHAR(20) NOT NULL
          `, (err) => {
            if (err) return handleError(err, connection);

            console.log('🎉 NOT NULL constraints enforced successfully.');

            // 4. Re-enable foreign key checks
            connection.query('SET FOREIGN_KEY_CHECKS = 1', (err) => {
              if (err) return handleError(err, connection);

              console.log('🎉 Migration completed successfully!');
              
              // Show final structure
              connection.query('DESCRIBE users', (err, results) => {
                if (!err) {
                  console.log('\nFinal columns in users table:');
                  console.table(results);
                }
                connection.end();
              });
            });
          });
        });
      });
    });
  });
}

function handleError(err, connection) {
  console.error('❌ Migration failed:', err.message);
  connection.query('SET FOREIGN_KEY_CHECKS = 1', () => {
    connection.end();
  });
}

run();
