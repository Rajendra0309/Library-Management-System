# LibraVault (Library Management System)
## Modern Enterprise Library Infrastructure

LibraVault is a premium, full-stack enterprise SaaS application designed to revolutionize institutional library operations. Built with a stunning modern UI, the platform unifies book inventory management, member portals, role-based workflows, automated fine calculation, content-based AI recommendations, and scheduled ETL analytics pipelines into a single, cohesive workspace.

---

## Table of Contents
1. [Project Delivery Status](#1-project-delivery-status)
2. [Technical Architecture](#2-technical-architecture)
3. [Local Development Setup](#3-local-development-setup)
4. [Deployment Details](#4-deployment-details)

---

## 1. Project Delivery Status

The project has reached 100% completion across all planned development phases.

| Phase | Module Description | Primary Developer | Status |
|---|---|---|---|
| Phase 1 | Foundation & Folder Structure | Team | Completed |
| Module 1 | Authentication & Staff Management | Samarth | Completed |
| Module 2 | Book Management & Search | Madhusudhan | Completed |
| Module 3 | Member Profiles & Reservations | Samrudhi | Completed |
| Module 4 | Borrowing Workflows & Fines | Spoorthy | Completed |
| Module 5 | Integration, AI, ETL & DevOps | Rajendra | Completed |

---

## 2. Technical Architecture & System Design

The application is built using a modern microservices approach, decoupling the frontend, core backend, AI capabilities, and background data processing.

### System Architecture Diagram
![System Architecture](docs/system_architecture.png)

### Core Technologies
- **Frontend:** React.js, Vite, TailwindCSS, Chart.js, Recharts, Lucide-React
- **Backend (Core API):** Node.js, Express.js, PostgreSQL (Prisma ORM)
- **AI Recommendation Service:** Python, Flask, Scikit-learn (TF-IDF Vectorization)
- **ETL Data Pipeline:** Python, Pandas, SQLAlchemy
- **Security:** OTP Verification, JWT Authentication, bcrypt password hashing, helmet HTTP headers
- **Cloud Infrastructure:** AWS ECS Fargate, AWS Lambda, AWS EventBridge, AWS S3, AWS CloudFront

---

## 3. Local Development Setup

### 3.1. Database Initialization
Ensure PostgreSQL is installed and running locally. Create an empty database named `library_db`.

### 3.2. Core API Backend Setup
1. Navigate to the `server/` directory.
2. Create a `.env` file containing:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/library_db?schema=public"
   PORT=5000
   JWT_SECRET="your_secure_development_secret"
   ```
3. Execute `npm install` to install dependencies.
4. Execute `npx prisma db push` to synchronize the database schema.
5. Execute `npx prisma generate` to build the Prisma Client.
6. Execute `npm run dev` to start the Node.js API.

### 3.3. Frontend Setup
1. Navigate to the `client/` directory.
2. Execute `npm install`.
3. Execute `npm run dev` to start the Vite development server.

---

## 4. Deployment Details

The system is configured for automated CI/CD deployment via GitHub Actions to an AWS Enterprise Architecture. All static assets and media uploads are routed through Amazon S3 and CloudFront. 

For comprehensive deployment instructions, AWS configuration steps, and serverless Lambda scheduling, please refer to the `docs/AWS_DEPLOYMENT_GUIDE.md` file.
