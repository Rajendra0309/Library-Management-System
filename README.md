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

### Module 1: Authentication & Staff (Samarth)
- [x] Finalized the core User and Staff database schemas in Prisma.
- [ ] API endpoints for Login, Register, and Role-Based Access Control.

### Module 2: Books & Search (Madhusudhan)
- [x] Analyzed requirements for the Book Catalog and finalized the DB model.
- [ ] API endpoints for Book CRUD, Catalog Search, and Inventory tracking.

### Module 3: Members & Reservations (Samrudhi)
- [x] Defined logic for membership ID generation and reservation queue workflows.
- [ ] API endpoints for Member management and Book Reservations.

### Module 4: Borrowing & Fines (Spoorthy)
- [x] Initialized the GitHub repository and base project folder structure.
- [ ] API endpoints for Issuing/Returning books and calculating Overdue Fines.

### Module 5 (Integration & AI) Progress (Rajendra)
- [x] **Phase 1: AI Recommendation Backend & API**
  - Created Python Flask service with `scikit-learn` content-based filtering logic.
  - Successfully connected AI service to PostgreSQL database.
  - Implemented Node.js API endpoints (`/api/ai/recommend`) to proxy requests securely.
  - Passed TC-03 and TC-04 endpoint tests.
- [ ] Phase 2: Data Engineering (ETL Pipeline)
- [ ] Phase 3: Frontend Dashboard Integration
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
