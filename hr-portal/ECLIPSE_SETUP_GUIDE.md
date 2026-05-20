# 🏢 SmartHR Portal — Complete Project Guide
## Full Code + Step-by-Step Eclipse Setup

---

## 📋 TABLE OF CONTENTS
1. Prerequisites & Tools
2. Eclipse IDE Setup
3. Import Backend (Spring Boot) into Eclipse
4. Configure the Project in Eclipse
5. Run Backend from Eclipse
6. Frontend (React) Setup
7. Test All AI Features
8. Project File Structure
9. All API Endpoints
10. Troubleshooting

---

## STEP 1 — PREREQUISITES & TOOLS TO INSTALL

### A. Java JDK 17
- Download: https://adoptium.net/temurin/releases/?version=17
- Install and set JAVA_HOME environment variable
- Verify: open Command Prompt → type: java -version

### B. Eclipse IDE for Enterprise Java
- Download: https://www.eclipse.org/downloads/packages/
- Choose: "Eclipse IDE for Enterprise Java and Web Developers"
- Version: 2023-12 or later

### C. Maven (bundled with Eclipse, but also install standalone)
- Download: https://maven.apache.org/download.cgi
- Add to PATH
- Verify: mvn -version

### D. Node.js 18+
- Download: https://nodejs.org (LTS version)
- Verify: node -v and npm -v

### E. Claude API Key
- Go to: https://console.anthropic.com
- Sign up → API Keys → Create Key
- Copy the key (starts with sk-ant-...)

### F. Git (optional but recommended)
- Download: https://git-scm.com

---

## STEP 2 — ECLIPSE IDE FIRST-TIME SETUP

### 2.1 Install Lombok Plugin (REQUIRED)
Lombok is used throughout the project for @Getter, @Setter, @Builder etc.

Method 1 — Eclipse Marketplace (Easiest):
1. Open Eclipse
2. Go to: Help → Eclipse Marketplace
3. Search: "Lombok"
4. Click Install on "Lombok" by Project Lombok
5. Accept license → Finish → Restart Eclipse

Method 2 — Manual:
1. Download lombok.jar from https://projectlombok.org/download
2. Double-click lombok.jar to run installer
3. Installer auto-detects Eclipse → click Install
4. Restart Eclipse

### 2.2 Install Spring Tools 4 (STS Plugin)
1. Go to: Help → Eclipse Marketplace
2. Search: "Spring Tools"
3. Install "Spring Tools 4 (aka Spring Tool Suite 4)"
4. Restart Eclipse

### 2.3 Set Java 17 in Eclipse
1. Go to: Window → Preferences
2. Navigate: Java → Installed JREs
3. Click Add → Standard VM
4. Browse to your JDK 17 installation folder
   - Windows: C:\Program Files\Eclipse Adoptium\jdk-17.x.x
   - macOS: /Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
5. Click Finish → check the JDK 17 checkbox → Apply and Close

### 2.4 Set Maven in Eclipse
1. Go to: Window → Preferences
2. Navigate: Maven → Installations
3. Click Add → browse to your Maven installation
4. Apply and Close

---

## STEP 3 — IMPORT BACKEND INTO ECLIPSE

### 3.1 Extract the Project
1. Download and extract smart-hr-portal.zip
2. You will see: hr-portal/ folder with backend/ and frontend/ inside

### 3.2 Import as Maven Project
1. Open Eclipse
2. Go to: File → Import
3. Expand Maven → select "Existing Maven Projects"
4. Click Next
5. Click Browse → navigate to: hr-portal/backend/
6. Eclipse will detect pom.xml automatically
7. Check the checkbox next to /pom.xml
8. Click Finish

Eclipse will now:
- Download all Maven dependencies (first time: 2-5 minutes)
- Build the project automatically
- Show the project in Package Explorer

### 3.3 Wait for Maven Build
- Watch the bottom-right progress bar
- Wait until "Updating Maven Project" finishes
- If you see errors, go to: Project → Clean → Clean All Projects

---

## STEP 4 — CONFIGURE PROJECT IN ECLIPSE

### 4.1 Set Claude API Key

Method A — Edit application.yml directly:
1. In Package Explorer, expand:
   smart-hr-portal → src/main/resources → application.yml
2. Double-click application.yml to open
3. Find this line:
   key: ${CLAUDE_API_KEY:your-claude-api-key-here}
4. Replace with your actual key:
   key: sk-ant-your-actual-key-here
5. Save: Ctrl+S

Method B — Set as Environment Variable in Eclipse Run Config:
(Covered in Step 5.2 below — recommended approach)

### 4.2 Verify Project Structure in Eclipse
After import, Package Explorer should show:

smart-hr-portal
├── src/main/java
│   └── com.hrportal
│       ├── HrPortalApplication.java
│       ├── config/
│       │   ├── DataSeeder.java
│       │   └── SecurityConfig.java
│       ├── controller/
│       │   ├── AIController.java
│       │   ├── ApplicantController.java
│       │   ├── AuthController.java
│       │   └── JobController.java
│       ├── dto/
│       │   └── DTOs.java
│       ├── exception/
│       │   ├── GlobalExceptionHandler.java
│       │   └── ResourceNotFoundException.java
│       ├── model/
│       │   ├── Applicant.java
│       │   ├── Interview.java
│       │   ├── Job.java
│       │   └── User.java
│       ├── repository/
│       │   ├── ApplicantRepository.java
│       │   ├── InterviewRepository.java
│       │   ├── JobRepository.java
│       │   └── UserRepository.java
│       ├── security/
│       │   ├── JwtAuthFilter.java
│       │   └── JwtUtil.java
│       └── service/
│           ├── ApplicantService.java
│           ├── AuthService.java
│           ├── ClaudeAIService.java
│           ├── InterviewService.java
│           └── JobService.java
├── src/main/resources
│   └── application.yml
├── src/test/java
└── pom.xml

### 4.3 Fix Any Red Errors
If you see red X errors on files:

Fix 1 — Update Maven Project:
1. Right-click project name
2. Maven → Update Project
3. Check "Force Update of Snapshots/Releases"
4. Click OK

Fix 2 — Clean and Build:
1. Project → Clean
2. Select "Clean all projects"
3. Click Clean

Fix 3 — Check Lombok:
1. If @Getter/@Setter are showing errors, Lombok is not installed
2. Reinstall Lombok (see Step 2.1)

---

## STEP 5 — RUN BACKEND FROM ECLIPSE

### 5.1 Run as Spring Boot App (Simple)
1. In Package Explorer, expand: src/main/java → com.hrportal
2. Right-click: HrPortalApplication.java
3. Select: Run As → Spring Boot App
   (If you don't see this option, use: Run As → Java Application)
4. Watch Console tab at bottom
5. Wait for: "Started HrPortalApplication"

### 5.2 Run with Environment Variables (Recommended)
1. Right-click: HrPortalApplication.java
2. Select: Run As → Run Configurations
3. Select: Spring Boot App (or Java Application)
4. Click the "Environment" tab
5. Click "New" and add:
   - Name: CLAUDE_API_KEY
     Value: sk-ant-your-key-here
6. Click Apply → Run

### 5.3 Verify Backend is Running
Open browser → go to: http://localhost:8080/swagger-ui.html
You should see the Swagger API documentation page with all endpoints.

Also check H2 database console:
- URL: http://localhost:8080/h2-console
- JDBC URL: jdbc:h2:mem:hrportal
- Username: sa
- Password: (leave blank)
- Click Connect

You should see tables: JOBS, APPLICANTS, INTERVIEWS, USERS

### 5.4 Eclipse Console Output (Success Looks Like This)
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

INFO - Starting HrPortalApplication
INFO - Demo data seeded: 2 users, 4 jobs, 5 applicants
INFO - Login: admin@hrportal.com / admin123
INFO - Started HrPortalApplication in 4.2 seconds

---

## STEP 6 — FRONTEND (REACT) SETUP

The React frontend runs separately from Eclipse.
Use Command Prompt / Terminal for this part.

### 6.1 Open Terminal
- Windows: Press Win+R → type cmd → Enter
- macOS: Applications → Terminal

### 6.2 Navigate to Frontend
cd path-to-your-project/hr-portal/frontend

Example on Windows:
cd C:\Users\YourName\Desktop\hr-portal\frontend

Example on macOS/Linux:
cd ~/Desktop/hr-portal/frontend

### 6.3 Install Dependencies (First Time Only)
npm install

Wait 1-3 minutes for packages to download.

### 6.4 Start the React App
npm start

Browser opens automatically at: http://localhost:3000

### 6.5 Login
Use these demo credentials:

HR Admin:  admin@hrportal.com    / admin123
Recruiter: recruiter@hrportal.com / recruiter123

---

## STEP 7 — TEST ALL AI FEATURES

### Feature 1: AI Resume Screening
1. Login as admin
2. Go to any job → copy the Apply Link
3. Open link in new tab (no login needed)
4. Fill form + upload a PDF resume → Submit
5. Go back to HR portal → Applicants
6. Find applicant → click "AI Screen Resume"
7. See: AI Score (0-100), Strengths, Gaps, Summary

### Feature 2: AI Candidate Ranking
1. Go to Jobs → click any open job
2. Click "AI Rank Candidates" button
3. See candidates ranked 🥇🥈🥉 with AI reasoning

### Feature 3: AI Job Description Generator
1. Go to AI Tools tab
2. Click "JD Generator"
3. Fill: Title, Department, Requirements
4. Click "Generate Job Description"
5. Claude AI writes a full, inclusive JD

### Feature 4: AI Offer Letter
1. AI Tools → "Offer Letter" tab
2. Fill: Candidate name, Role, Salary, Start date
3. Click Generate → get a professional offer letter

### Feature 5: AI Rejection Email
1. AI Tools → "Rejection Email" tab
2. Fill candidate name, job, select reason
3. Click Generate → compassionate rejection email

### Feature 6: Skill Gap Analysis
1. AI Tools → "Skill Gap" tab
2. Paste job requirements + candidate resume
3. Click Analyze → see matched skills, gaps, training plan

### Feature 7: Salary Benchmarking
1. AI Tools → "Salary Benchmark" tab
2. Enter job title, location, experience level
3. Click Generate → INR salary ranges, competing companies, negotiation tips

### Feature 8: Executive Hiring Report
1. AI Tools → "Hiring Report" tab
2. Select a job from dropdown
3. Click Generate → executive summary for hiring manager

### Feature 9: HR Chatbot
1. AI Tools → "HR Chatbot" tab
2. Ask anything: "How do I write a good JD?"
3. HRBot responds using Claude AI
4. Use quick question buttons on the left

### Feature 10: AI Interview Questions
1. Go to Interviews page
2. Find a scheduled interview → click "🤖 Questions"
3. Claude generates 10 tailored questions for that candidate

---

## STEP 8 — ECLIPSE TIPS & SHORTCUTS

### Useful Eclipse Shortcuts
Ctrl+Shift+O    → Auto-import missing imports
Ctrl+Shift+F    → Format code
Ctrl+1          → Quick fix (fix errors)
Ctrl+Space      → Auto-complete
F3              → Go to definition
Ctrl+Alt+H      → Open call hierarchy
Ctrl+Shift+T    → Open type (search any class)
Ctrl+F11        → Run last configuration
Ctrl+Shift+B    → Toggle breakpoint (for debugging)
F5              → Step into (debug)
F6              → Step over (debug)
F8              → Resume (debug)

### Debug Mode
1. Right-click HrPortalApplication.java
2. Debug As → Spring Boot App
3. Set breakpoints by clicking left gutter of any line
4. When breakpoint hits, use Debug perspective

### Console Filters
In Console tab, you can filter logs:
- Click the triangle ▼ next to console
- Add filter to hide noisy Hibernate SQL logs

### Auto-restart on Save (Spring DevTools)
The pom.xml includes spring-boot-devtools.
When you save a Java file, the app restarts automatically.
Watch console for "Restarting..." message.

---

## STEP 9 — PROJECT FILE DESCRIPTIONS

### Backend Files

pom.xml
  Maven configuration with all dependencies:
  Spring Boot, Spring Security, Spring Data JPA,
  JWT (jjwt), Apache PDFBox, AWS S3 SDK,
  PostgreSQL, H2, Lombok, SpringDoc OpenAPI

application.yml
  All configuration: database, Claude API key,
  JWT secret, file upload settings, mail config

HrPortalApplication.java
  Main entry point. @SpringBootApplication + @EnableAsync

--- Models (JPA Entities) ---

Job.java
  Fields: id, title, department, location, employmentType,
  description, requirements, benefits, salaryRange,
  openings, status (DRAFT/OPEN/CLOSED/ON_HOLD),
  closingDate, createdAt, updatedAt, createdBy, applicants

Applicant.java
  Fields: id, firstName, lastName, email, phone,
  linkedinUrl, portfolioUrl, resumeFileName, resumeUrl,
  coverLetter, aiScreeningSummary, aiStrengths, aiGaps,
  aiScore (0-100), extractedResumeText, status, job, interviews

Interview.java
  Fields: id, applicant, scheduledAt, durationMinutes,
  type (PHONE/VIDEO/IN_PERSON/TECHNICAL/HR/PANEL),
  status (SCHEDULED/COMPLETED/CANCELLED etc.),
  interviewerName, interviewerEmail, meetingLink,
  round, notes, feedback, rating, recommendation

User.java
  Fields: id, email, password, firstName, lastName,
  roles (HR_ADMIN / RECRUITER / CANDIDATE), enabled

--- Repositories ---

JobRepository.java
  searchJobs() - keyword + status + department filter
  findAllDepartments() - distinct department list
  countByStatus() - stats for dashboard

ApplicantRepository.java
  findByJobIdOrderByAiScoreDesc() - ranked list
  findRankedApplicants() - AI-scored candidates
  countByStatus() - pipeline stats

InterviewRepository.java
  findByScheduledAtBetween() - upcoming interviews
  countUpcoming() - dashboard stat

--- Services ---

ClaudeAIService.java
  THE CORE AI SERVICE. Makes all Claude API calls.
  Methods:
  - screenResume()          → 0-100 score + strengths/gaps
  - rankCandidates()        → ordered list with reasoning
  - generateJobDescription() → full JD from inputs
  - generateInterviewQuestions() → 10 tailored questions
  - generateOfferLetter()   → professional offer letter
  - generateRejectionEmail() → compassionate rejection
  - chatWithHRBot()         → conversational HR assistant
  - analyzeSkillGap()       → matched/missing skills
  - generateSalaryBenchmark() → INR ranges + tips
  - generateHiringReport()  → executive summary

ApplicantService.java
  createApplicant() - saves to DB + triggers async AI screening
  screenApplicant() - calls Claude + updates DB + auto-status
  getRankedCandidates() - calls Claude ranking
  saveFile() - stores PDF to local filesystem
  extractTextFromPdf() - uses Apache PDFBox

JobService.java
  Full CRUD + searchJobs with filters
  generateJobDescription() - delegates to ClaudeAIService

InterviewService.java
  scheduleInterview() - creates interview + updates applicant status
  submitFeedback() - saves feedback + auto-updates applicant status
  generateInterviewQuestions() - delegates to ClaudeAIService

AuthService.java
  login() - authenticates + returns JWT
  register() - creates user with role

--- Security ---

SecurityConfig.java
  JWT stateless auth, CORS for localhost:3000,
  Role-based access: HR_ADMIN, RECRUITER, CANDIDATE
  Public: GET /api/jobs, POST /api/applicants, /api/auth/**

JwtUtil.java
  generateToken(), validateToken(), getEmailFromToken()
  Uses HS256 algorithm with configurable secret

JwtAuthFilter.java
  OncePerRequestFilter - extracts JWT from Authorization header
  Loads UserDetails and sets SecurityContext

--- Controllers ---

AuthController.java     → POST /api/auth/login, /api/auth/register
JobController.java      → CRUD /api/jobs/** + GET /api/jobs/departments
ApplicantController.java → CRUD /api/applicants/** + AI screen/rank
AIController.java       → All 6 new AI endpoints at /api/ai/**

--- Config ---

SecurityConfig.java     → Spring Security + CORS + JWT filter chain
DataSeeder.java         → Runs on startup, seeds 2 users + 4 jobs + 5 applicants

--- Exception Handling ---

GlobalExceptionHandler.java
  Handles: ResourceNotFoundException (404), BadCredentials (401),
  AccessDenied (403), MethodArgumentNotValid (400), RuntimeException

### Frontend Files

src/index.html          → HTML shell with loading splash screen
src/index.js            → React root mount point
src/App.js              → All routes (public + private + layout)
src/index.css           → Complete design system (CSS variables, components)

src/services/api.js     → All Axios HTTP calls (authAPI, jobsAPI, applicantsAPI, interviewsAPI, aiAPI)
src/store/AuthContext.js → Global auth state (login, logout, user, roles)

src/components/layout/Layout.js → Sidebar navigation + top bar shell
src/components/common/Common.js → Shared UI: Modal, Badge, StatusBadge, Spinner, Pagination, EmptyState

src/pages/
  LoginPage.js          → Login + Register forms with demo credential buttons
  DashboardPage.js      → Stats grid + recent jobs + upcoming interviews + quick actions
  JobsPage.js           → Paginated job cards with search/filter
  JobDetailPage.js      → Job info + applicant table + AI ranked candidates tab
  CreateJobPage.js      → New job form
  EditJobPage.js        → Edit existing job form
  ApplicantsPage.js     → All applicants table with status filter
  ApplicantDetailPage.js → Profile + AI analysis + interview history + schedule modal
  InterviewsPage.js     → Interview list + feedback modal + AI questions modal
  AIToolsPage.js        → 7 AI tools: JD Generator, Offer Letter, Rejection Email,
                           Skill Gap, Salary Benchmark, Hiring Report, HR Chatbot
  ApplyPage.js          → Public candidate apply form with PDF upload (no login needed)

---

## STEP 10 — ALL API ENDPOINTS REFERENCE

### Auth Endpoints (Public)
POST   /api/auth/login          Body: {email, password}
POST   /api/auth/register       Body: {firstName, lastName, email, password, role}

### Job Endpoints
GET    /api/jobs                Public. Params: keyword, status, department, page, size
GET    /api/jobs/{id}           Public. Get job details
POST   /api/jobs                Auth: RECRUITER. Create job
PUT    /api/jobs/{id}           Auth: RECRUITER. Update job
DELETE /api/jobs/{id}           Auth: HR_ADMIN. Close job
GET    /api/jobs/departments    Public. Get all department names
POST   /api/jobs/generate-jd    Auth: RECRUITER. Body: {title, department, location, requirements, culture}

### Applicant Endpoints
POST   /api/applicants/job/{id}         Public. Multipart: data (JSON) + resume (PDF)
GET    /api/applicants/job/{id}         Auth: RECRUITER. List applicants for a job
GET    /api/applicants/{id}             Auth: RECRUITER. Get applicant detail
PATCH  /api/applicants/{id}/status      Auth: RECRUITER. Param: status=SHORTLISTED
POST   /api/applicants/{id}/screen      Auth: RECRUITER. Trigger AI screening
GET    /api/applicants/job/{id}/ranked  Auth: RECRUITER. AI ranked candidates
DELETE /api/applicants/{id}             Auth: HR_ADMIN. Delete applicant

### Interview Endpoints
POST   /api/interviews                  Auth: RECRUITER. Schedule interview
GET    /api/interviews/{id}             Auth: RECRUITER. Get interview
GET    /api/interviews/job/{jobId}      Auth: RECRUITER. All interviews for job
GET    /api/interviews/applicant/{id}   Auth: RECRUITER. All interviews for applicant
GET    /api/interviews/upcoming         Auth: RECRUITER. Next 7 days
PUT    /api/interviews/{id}             Auth: RECRUITER. Update interview
POST   /api/interviews/{id}/feedback    Auth: RECRUITER. Submit feedback
POST   /api/interviews/{id}/cancel      Auth: RECRUITER. Cancel
GET    /api/interviews/{id}/questions   Auth: RECRUITER. AI interview questions

### AI Endpoints (New)
POST   /api/ai/offer-letter             Auth: RECRUITER. Body: {candidateName, jobTitle, salary, startDate, companyName}
POST   /api/ai/rejection-email          Auth: RECRUITER. Body: {candidateName, jobTitle, reason, encourageReapply}
POST   /api/ai/chat                     Auth: RECRUITER. Body: {message, context}
POST   /api/ai/skill-gap                Auth: RECRUITER. Body: {jobRequirements, candidateResumeText}
GET    /api/ai/skill-gap/applicant/{id} Auth: RECRUITER. Skill gap using stored resume
POST   /api/ai/salary-benchmark         Auth: RECRUITER. Body: {jobTitle, location, experience, skills}
GET    /api/ai/hiring-report/{jobId}    Auth: RECRUITER. Executive report for a job

---

## STEP 11 — TROUBLESHOOTING IN ECLIPSE

### Problem: "Cannot resolve symbol" errors
Solution:
1. Right-click project → Maven → Update Project
2. Check Force Update → OK
3. Project → Clean → Clean All

### Problem: Lombok annotations not working (@Getter, @Data etc.)
Solution:
1. Help → Eclipse Marketplace → search Lombok → Install
2. If already installed: run lombok.jar manually
3. Restart Eclipse completely

### Problem: Port 8080 already in use
Solution in Eclipse:
1. Window → Preferences → Spring → Spring Boot
2. Or change port in application.yml:
   server:
     port: 8090

### Problem: H2 console shows no tables
Solution: Make sure ddl-auto is "create-drop" or "update" in application.yml

### Problem: AI features return "AI service temporarily unavailable"
Solutions:
1. Check CLAUDE_API_KEY is set correctly
2. Check internet connection (Claude API needs internet)
3. Verify key at: https://console.anthropic.com
4. Check Eclipse console for the actual error

### Problem: React shows "Cannot connect to backend"
Solutions:
1. Make sure Spring Boot is running on port 8080
2. Check CORS — backend allows localhost:3000
3. Check browser console for the exact error

### Problem: PDF upload fails
Solutions:
1. Make sure uploads/ folder exists (auto-created on first upload)
2. Check file size < 10MB
3. Only PDF files are supported for text extraction

---

## QUICK REFERENCE CARD

Start Backend (Eclipse):
  Right-click HrPortalApplication.java → Run As → Spring Boot App

Start Frontend (Terminal):
  cd hr-portal/frontend && npm start

Demo Login:
  admin@hrportal.com / admin123

Swagger API Docs:
  http://localhost:8080/swagger-ui.html

H2 Database:
  http://localhost:8080/h2-console
  JDBC URL: jdbc:h2:mem:hrportal

Public Apply Page:
  http://localhost:3000/apply/{jobId}

AI Features Location:
  All AI tools → http://localhost:3000/ai-tools

---

End of Guide. Happy Coding! 🚀
