@echo off

rem start server
"C:\Program Files\PostgreSQL\15\bin\pg_ctl" start -D "C:\Program Files\PostgreSQL\15\data"

set PGPASSWORD=password
rem Connect to the PostgreSQL server and create the "Users" database if it doesn't exist
echo Creating promptr database...
"C:\Program Files\PostgreSQL\15\bin\psql" -U postgres -c "CREATE DATABASE promptr;"

rem Connect to the Users database and check if the users table exists
echo Creating users table...
"C:\Program Files\PostgreSQL\15\bin\psql" -U postgres -d promptr -c "CREATE TABLE users (id serial primary key, name varchar(50));"
echo Adding email and password columns to users table...
"C:\Program Files\PostgreSQL\15\bin\psql" -U postgres -d promptr -c "ALTER TABLE users ADD COLUMN email varchar(100);"
"C:\Program Files\PostgreSQL\15\bin\psql" -U postgres -d promptr -c "ALTER TABLE users ADD COLUMN password varchar(50);"
echo Making some extra room for the salted and hashed passwords...
"C:\Program Files\PostgreSQL\15\bin\psql" -U postgres -d promptr -c "ALTER TABLE users ALTER COLUMN password TYPE varchar(128);"

echo Done.

:x
timeout 10
echo server is running
goto x