# 🏢 SmartHR Portal — MySQL Setup Guide

## Prerequisites
- Java 17+
- Maven 3.8+
- **MySQL 8.0+** (new requirement)
- Node.js 18+ (for frontend)

---

## Step 1 — Install MySQL

### Windows
1. Download MySQL Installer: https://dev.mysql.com/downloads/installer/
2. Choose "MySQL Server" + "MySQL Workbench"
3. During setup, set root password (remember it!)
4. Default port: 3306

### macOS
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Verify installation
```bash
mysql --version
# Should show: mysql  Ver 8.x.x
```

---

## Step 2 — Create Database

Open MySQL Command Line or MySQL Workbench and run:

```sql
CREATE DATABASE hrportal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

Or run the provided script:
```bash
mysql -u root -p < src/main/resources/mysql-setup.sql
```

---

## Step 3 — Configure Database Credentials

Open `src/main/resources/application.yml` and update:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/hrportal?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: root          # ← your MySQL username
    password: root          # ← your MySQL password
```

### OR use environment variables (safer):

**Windows CMD:**
```cmd
set DB_USERNAME=root
set DB_PASSWORD=yourpassword
set CLAUDE_API_KEY=AIzaSy...your-gemini-key
mvn spring-boot:run
```

**Windows PowerShell:**
```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="yourpassword"
$env:CLAUDE_API_KEY="AIzaSy...your-gemini-key"
mvn spring-boot:run
```

---

## Step 4 — Set AI API Key

Open `application.yml` and set your key:

```yaml
claude:
  api:
    key: AIzaSyYOUR_GEMINI_KEY_HERE   # Free from https://aistudio.google.com
    # OR
    key: sk-ant-YOUR_CLAUDE_KEY_HERE  # From https://console.anthropic.com
```

---

## Step 5 — Run the Backend

```bash
cd hr-portal/backend

# Delete old compiled files (important!)
rmdir /s /q target     # Windows
rm -rf target          # Mac/Linux

# Run
mvn spring-boot:run
```

### ✅ Success output:
```
Started HrPortalApplication in 6.2 seconds
Demo data seeded: 2 users, 4 jobs, 5 applicants
Login: admin@hrportal.com / admin123
Login: recruiter@hrportal.com / recruiter123
```

---

## Step 6 — Verify MySQL Tables Created

Open MySQL Workbench or run:
```sql
USE hrportal;
SHOW TABLES;
```

You should see:
```
+--------------------+
| Tables_in_hrportal |
+--------------------+
| applicants         |
| interviews         |
| jobs               |
| user_roles         |
| users              |
+--------------------+
```

---

## Step 7 — Run Frontend

```bash
cd hr-portal/frontend
npm install
npm start
```

Open http://localhost:3000

**Login credentials:**
| Role | Email | Password |
|---|---|---|
| HR Admin | admin@hrportal.com | admin123 |
| Recruiter | recruiter@hrportal.com | recruiter123 |

---

## MySQL vs H2 — What Changed

| Feature | H2 (old) | MySQL (new) |
|---|---|---|
| Data persistence | ❌ Lost on restart | ✅ Permanent |
| Production ready | ❌ No | ✅ Yes |
| Setup required | ❌ None | ✅ Install MySQL |
| Performance | Basic | High performance |
| Real database | ❌ In-memory | ✅ Real RDBMS |

---

## Troubleshooting

### "Access denied for user 'root'"
Update username/password in `application.yml` to match your MySQL credentials.

### "Communications link failure"
MySQL is not running. Start it:
- Windows: Open Services → Start "MySQL80"
- macOS: `brew services start mysql`

### "Unknown database hrportal"
Create the database:
```sql
CREATE DATABASE hrportal CHARACTER SET utf8mb4;
```

### Tables not created
Make sure `ddl-auto: update` is set in `application.yml` and restart the app.

### "The server time zone value is unrecognized"
Add `?serverTimezone=UTC` to your JDBC URL (already included in our config).
