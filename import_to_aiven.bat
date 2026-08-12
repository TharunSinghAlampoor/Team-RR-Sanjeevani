@echo off
echo ============================================================
echo Importing sanjeevani_backup.sql to Aiven Cloud MySQL Database
echo ============================================================
echo.
set /p AIVEN_PASS="Enter your Aiven MySQL Password: "
echo.
echo Connecting and importing to Aiven Cloud MySQL (mysql-1813e296-sanjeevani-mysql.g.aivencloud.com:21552)...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h mysql-1813e296-sanjeevani-mysql.g.aivencloud.com -P 21552 -u avnadmin -p%AIVEN_PASS% --ssl-mode=REQUIRED defaultdb < sanjeevani_backup.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS: All local MySQL database data successfully imported to Aiven Cloud MySQL!
) else (
    echo.
    echo ❌ Import failed. Please check your Aiven password and try again.
)
pause
