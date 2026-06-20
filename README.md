# 📚 Library Management System (LMS)
## CBA Internship Capstone Project

Welcome to the Library Management System! This is a full-stack web application that digitizes library operations including book management, member management, borrowing, returns, fine calculation, reservations, e-books, recommendations, and analytics reporting.

---

## 🚀 Current Project Status

### What is Built So Far
We have successfully completed **Phase 1: Setup & Foundation**. The following initial setup tasks are complete:

- [x] **Project Folder Structure Setup**
  - Created standardized directories for `client/`, `server/`, `ai-service/`, `etl-pipeline/`, and `tests/`.
  - Added `.gitkeep` files to track the folder structure in Git.
- [x] **Base Documentation Created**
  - Added `PRD.md` (Product Requirements Document).
  - Added `TECH_STACK.md` (Tech stack references and approved libraries).
  - Added standardized test templates and specific module test tracking files in the `tests/` folder.
- [x] **Version Control Setup**
  - Configured a comprehensive `.gitignore` file to ensure clean commits (excluding node_modules, Python caches, build artifacts, etc.).

### ✅ Module 1 Complete: Authentication + Staff Management
**Completed by:** Member 1 (Samarth) | **Date:** 2026-06-17 | **Branch:** `feature/auth-staff`

#### Backend (server/)
- [x] **Prisma Schema Updated** — Added `loginAttempts`, `lockUntil`, `department`, `employeeId` to `User` model. Migrated via `prisma db push`.
- [x] **`server/controllers/auth.controller.js`** — `register`, `login` (with lockout), `getMe`, `changePassword`
- [x] **`server/controllers/staff.controller.js`** — Full CRUD: `getStaff`, `getStaffById`, `createStaff`, `updateStaff`, `deleteStaff`
- [x] **`server/routes/auth.routes.js`** — `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/change-password`
- [x] **`server/routes/staff.routes.js`** — All routes under `/api/staff` (admin only)
- [x] **`server/middleware/role.middleware.js`** — `adminOnly`, `librarianAndAbove`, `allRoles` aliases
- [x] **`server/server.js`** — Updated to register auth and staff routes
- [x] **`server/utils/membershipId.js`** — Auto-generates `LMS-YYYY-XXXX` (was already present, verified working)
- [x] **`server/middleware/auth.middleware.js`** — JWT `protect` + `authorize` (was already present, verified working)

#### Frontend (client/src/)
- [x] **`context/AuthContext.jsx`** — Global auth state: `login`, `register`, `logout`, `updateUser`, session verification on mount
- [x] **`components/ProtectedRoute.jsx`** — Checks JWT + role, shows 403 or redirects to `/login`
- [x] **`pages/Login.jsx`** — Wired to `AuthContext.login()` with error banner, loading state, lockout message
- [x] **`pages/Register.jsx`** — Wired to `AuthContext.register()` with live password strength meter and validation checklist
- [x] **`pages/Staff/StaffList.jsx`** — Real API data, search/filter, pagination, delete confirmation modal
- [x] **`pages/Staff/AddStaff.jsx`** — Create staff form with role/department/employeeId, password validation
- [x] **`App.jsx`** — Wrapped in `AuthProvider`, routes protected with `ProtectedRoute`, admin-only routes nested

#### Business Rules Verified ✅
- Password: min 8 chars + 1 number + 1 special character
- Duplicate email → 409 Conflict
- Account lockout after 3 failed attempts for 15 minutes
- JWT expires in 7 days
- Member cannot access `/api/staff` → 403
- Admin cannot delete own account → 400
- Membership ID auto-generated in `LMS-YYYY-XXXX` format

#### Test Results
All test cases in `tests/AUTH_TEST.md` — **PASS** ✅

### Module 2: Books & Search (Madhusudhan)
- [x] Analyzed requirements for the Book Catalog and finalized the DB model.
- [x] API endpoints for Book CRUD, Catalog Search, and Inventory tracking.

### Module 3: Members & Reservations (Samrudhi)
- [x] Defined logic for membership ID generation and reservation queue workflows.
- [ ] API endpoints for Member management and Book Reservations.

### Module 4: Borrowing & Fines (Spoorthy)
- [x] Initialized the GitHub repository and base project folder structure.
- [ ] API endpoints for Issuing/Returning books and calculating Overdue Fines.

### ✅ Module 5 (Integration & AI) Progress (Rajendra)
- [x] **Phase 1: AI Recommendation Backend & API**
  - Created Python Flask service with `scikit-learn` content-based filtering logic.
  - Successfully connected AI service to PostgreSQL database.
  - Implemented Node.js API endpoints (`/api/ai/recommend`) to proxy requests securely.
  - Passed TC-03 and TC-04 endpoint tests.
- [x] **Phase 2: Data Engineering (ETL Pipeline)**
  - Updated PostgreSQL schema with `Report` model.
  - Built Python data extraction and transformation logic using `pandas`.
  - Configured `schedule` to load daily aggregates of books, members, active/overdue borrows, and fines.
  - Implemented `/api/reports/dashboard` Express endpoint.
- [x] **Phase 3: Frontend Dashboard Integration**
  - Created `Dashboard.jsx` using `recharts` to visualize real-time data from ETL output.
  - Created `ReportDetails.jsx` for tabular data representation alongside the existing `Reports.jsx` UI.
- [ ] Phase 4: DevOps & Cloud Architecture

---

## 🎯 Next Steps (Phase 2: Core Modules Development)
The team is now ready to begin parallel development on the core modules:

- **Member 1 (Samarth)**: Authentication + Staff Management (`feature/auth-staff`)
- **Member 2 (Madhusudhan)**: Book Management + Search & Catalog (`feature/books-search`)
- **Member 3 (Samrudhi)**: Member Management + Reservation System (`feature/members-reservations`)
- **Member 4 (Spoorthy)**: Borrowing & Returns + Fine Management (`feature/borrowing-fines`)
- **Member 5 (Rajendra)**: Integration + Data Engineering + Cloud + DevOps + Reporting (`feature/integration-ai-cloud`)

---

## 🛠️ Tech Stack Overview

- **Frontend**: Vite, React.js, Material-UI, React Router v6, Axios
- **Backend**: Node.js, Express.js, Prisma ORM, PostgreSQL, JWT
- **AI Service**: Python, Flask, scikit-learn
- **ETL Pipeline**: Python, Pandas
- **Cloud & DevOps**: AWS (EC2, S3, Lambda), Docker Compose, GitHub Actions

*For a detailed list of approved libraries and constraints, please carefully read `TECH_STACK.md` before installing any packages.*

---

## 🏃‍♂️ How to Get Started

1. **Clone the Repository**: Pull the latest code to your local machine.
2. **Backend Setup**:
   - Make sure your local PostgreSQL is running.
   - Inside the `server/` folder, create a `.env` file with:
     ```env
     DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/library_db?schema=public"
     PORT=5000
     JWT_SECRET="your_secret_key"
     ```
   - Run `npm install` inside `server/`.
   - Run `npx prisma db push` to create the database tables.
   - Run `npx prisma generate` to generate the client.
   - Run `npm run dev` to start the backend.
3. **Frontend Setup**:
   - Inside the `client/` folder, run `npm install`.
   - Run `npm run dev` to start the Vite frontend on port 3000.
4. **Review the Requirements**: Read `PRD.md` to fully understand the system requirements and your specific module.
5. **Branch Out**: Checkout to your designated feature branch (do not push directly to `main` or `dev`).
6. **Test-Driven Approach**: Read your module's specific test document in the `tests/` folder.
7. **Update Progress**: Once a feature is complete, update this README and raise a PR.
