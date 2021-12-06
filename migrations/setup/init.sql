CREATE DATABASE IF NOT EXISTS 'jwtauthdb';

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Dev123!!!';
ALTER USER 'developer'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Dev123!!!';

GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'developer'@'localhost';

FLUSH PRIVILEGES;
