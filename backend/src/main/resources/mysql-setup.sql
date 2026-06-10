-- ============================================================
--  SmartHR Portal — MySQL Setup Script
--  Run this ONCE before starting the Spring Boot application
--  MySQL version: 8.0+
-- ============================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS hrportal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 2. Create a dedicated user (safer than using root)
--    Change 'hrpassword' to your own secure password
CREATE USER IF NOT EXISTS 'hruser'@'localhost' IDENTIFIED BY 'hrpassword';

-- 3. Grant permissions
GRANT ALL PRIVILEGES ON hrportal.* TO 'hruser'@'localhost';
FLUSH PRIVILEGES;

-- 4. Use the database
USE hrportal;

-- ============================================================
-- NOTE: Spring Boot with ddl-auto=update will automatically
-- create all tables (users, jobs, applicants, interviews, etc.)
-- when the application starts for the first time.
-- You do NOT need to create tables manually.
-- ============================================================

-- Verify setup
SELECT 'Database hrportal created successfully!' AS status;
SHOW DATABASES LIKE 'hrportal';
