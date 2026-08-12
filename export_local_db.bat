@echo off
echo ============================================================
echo Exporting Local MySQL Database 'E-Commerce' to sanjeevani_backup.sql
echo ============================================================
echo.
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -pTharun@123 e-commerce > sanjeevani_backup.sql
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS: Local database exported successfully to sanjeevani_backup.sql!
) else (
    echo.
    echo ⚠️ MySQLdump default path not found, trying PATH mysqldump...
    mysqldump -u root -pTharun@123 e-commerce > sanjeevani_backup.sql
)
pause
