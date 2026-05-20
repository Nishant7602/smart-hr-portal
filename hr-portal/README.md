# 🏢 Smart HR & Recruitment Portal

An AI-powered HR recruitment platform built with **Spring Boot** (backend) and **React** (frontend), integrated with **Claude AI** (Anthropic) for intelligent resume screening, candidate ranking, JD generation, and interview question generation.

---

## 🚀 Features

### Core CRUD
- **Job Postings** — Create, update, archive, and search job listings
- **Applicants** — Apply with resume upload, track pipeline status
- **Interviews** — Schedule, manage, submit feedback across rounds

### AI Features (Claude API)
- 🤖 **Resume Screening** — Auto-extracts text from PDF, scores fit 0–100, highlights strengths & gaps
- 🏆 **Candidate Ranking** — Ranks all applicants for a job with reasoning
- 📝 **JD Generation** — Generates inclusive job descriptions from role inputs
- ❓ **Interview Questions** — Tailored question sets per candidate & interview type

### Auth & Roles
- JWT authentication
- Roles: `HR_ADMIN`, `RECRUITER`, `CANDIDATE`
- Role-based access control on all endpoints

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.2, Spring Security, Spring Data JPA |
| AI | Claude API (claude-sonnet-4-20250514) |
| Database | H2 (dev) / PostgreSQL (prod) |
| Auth | JWT (jjwt) |
| PDF | Apache PDFBox |
| File Storage | Local filesystem / AWS S3 |
| Frontend | React 18, React Router v6 |
| Styling | Custom CSS design system |
| API Docs | SpringDoc OpenAPI / Swagger UI |

---

## ⚡ Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+
- A Claude API key from [console.anthropic.com](https://console.anthropic.com)

### 1. Backend Setup

```bash
cd backend

# Set your Claude API key
export CLAUDE_API_KEY=your-claude-api-key-here

# Run with H2 (no DB setup needed)
mvn spring-boot:run
```

Backend starts at: **http://localhost:8080**
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console

### Demo Users (auto-seeded)
| Role | Email | Password |
|---|---|---|
| HR Admin | admin@hrportal.com | admin123 |
| Recruiter | recruiter@hrportal.com | recruiter123 |

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend starts at: **http://localhost:3000**

---

## 🐳 Docker (Full Stack)

```bash
# At project root
export CLAUDE_API_KEY=your-claude-api-key-here

docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- PostgreSQL: localhost:5432

---

## 🔑 Configuration

Edit `backend/src/main/resources/application.yml`:

```yaml
claude:
  api:
    key: ${CLAUDE_API_KEY:your-key-here}   # Required for AI features
    model: claude-sonnet-4-20250514

# Switch to PostgreSQL for production:
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/hrportal
    username: hruser
    password: hrpassword
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

---

## 📁 Project Structure

```
smart-hr-portal/
├── backend/
│   ├── src/main/java/com/hrportal/
│   │   ├── HrPortalApplication.java         # Entry point
│   │   ├── config/
│   │   │   ├── SecurityConfig.java          # Spring Security + CORS
│   │   │   └── DataSeeder.java              # Demo data on startup
│   │   ├── controller/
│   │   │   ├── AuthController.java          # /api/auth/*
│   │   │   ├── JobController.java           # /api/jobs/*
│   │   │   └── ApplicantController.java     # /api/applicants/* + /api/interviews/*
│   │   ├── service/
│   │   │   ├── ClaudeAIService.java         # All Claude API calls
│   │   │   ├── JobService.java
│   │   │   ├── ApplicantService.java        # PDF extraction + AI screening
│   │   │   ├── InterviewService.java
│   │   │   └── AuthService.java
│   │   ├── model/                           # JPA Entities
│   │   ├── repository/                      # Spring Data repositories
│   │   ├── dto/DTOs.java                    # All request/response DTOs
│   │   ├── security/                        # JWT filter + UserDetailsService
│   │   └── exception/                       # Global error handler
│   └── src/main/resources/application.yml
│
├── frontend/
│   └── src/
│       ├── App.js                           # Routes
│       ├── index.css                        # Design system CSS
│       ├── services/api.js                  # All Axios API calls
│       ├── store/AuthContext.js             # Global auth state
│       ├── components/
│       │   ├── layout/Layout.js             # Sidebar + shell
│       │   └── common/Common.js             # Reusable UI components
│       └── pages/
│           ├── LoginPage.js / RegisterPage.js
│           ├── DashboardPage.js
│           ├── JobsPage.js / JobDetailPage.js / CreateJobPage.js / EditJobPage.js
│           ├── ApplicantsPage.js / ApplicantDetailPage.js
│           ├── InterviewsPage.js
│           ├── AIToolsPage.js               # JD Generator + AI Guide
│           └── ApplyPage.js                 # Public candidate apply page
│
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, get JWT |
| POST | `/api/auth/register` | Register new HR user |

### Jobs
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/jobs` | Public | List/search jobs |
| GET | `/api/jobs/{id}` | Public | Get job details |
| POST | `/api/jobs` | Recruiter | Create job |
| PUT | `/api/jobs/{id}` | Recruiter | Update job |
| DELETE | `/api/jobs/{id}` | Admin | Close job |
| POST | `/api/jobs/generate-jd` | Recruiter | **AI: Generate JD** |

### Applicants
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/applicants/job/{jobId}` | Public | Submit application + resume |
| GET | `/api/applicants/job/{jobId}` | Recruiter | All applicants for job |
| GET | `/api/applicants/{id}` | Recruiter | Applicant detail |
| PATCH | `/api/applicants/{id}/status` | Recruiter | Update status |
| POST | `/api/applicants/{id}/screen` | Recruiter | **AI: Screen resume** |
| GET | `/api/applicants/job/{jobId}/ranked` | Recruiter | **AI: Rank candidates** |

### Interviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/interviews` | Recruiter | Schedule interview |
| GET | `/api/interviews/upcoming` | Recruiter | Next 7 days |
| PUT | `/api/interviews/{id}` | Recruiter | Update interview |
| POST | `/api/interviews/{id}/feedback` | Recruiter | Submit feedback |
| POST | `/api/interviews/{id}/cancel` | Recruiter | Cancel |
| GET | `/api/interviews/{id}/questions` | Recruiter | **AI: Generate questions** |

---

## 🌐 Public Candidate Apply Page

Each job has a shareable application URL:
```
http://localhost:3000/apply/{jobId}
```

Candidates can apply, upload PDF resume, and write a cover letter — no login required. Their resume is automatically screened by Claude AI on submission.

---

## 🤖 How AI Works

1. **Resume Screening**: PDFBox extracts text → sent to Claude with job description → Claude returns JSON with score, summary, strengths, gaps → stored in DB, applicant status auto-updated
2. **Candidate Ranking**: All applicants for a job → sent as structured list to Claude → Claude returns ranked array with reasoning
3. **JD Generation**: Role inputs → Claude prompt → full markdown job description returned
4. **Interview Questions**: Interview type + applicant summary → Claude generates 10 tailored questions

---

## 📝 License

MIT — free to use, modify, and distribute.
