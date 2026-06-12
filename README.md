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

---

## 🎯 Next Steps (Phase 2: Core Modules Development)
The team is now ready to begin parallel development on the core modules:

- **Member 1 (Samarth)**: Authentication + Staff Management (`feature/auth-staff`)
- **Member 2 (Madhusudhan)**: Book Management + Search & Catalog (`feature/books-search`)
- **Member 3 (Samrudhi)**: Member Management + Reservation System (`feature/members-reservations`)
- **Member 4 (Spoorthy)**: Borrowing & Returns + Fine Management (`feature/borrowing-fines`)
- **Member 5 / Lead (Rajendra)**: Integration + Data Engineering + Cloud + DevOps + Reporting (`feature/integration-ai-cloud`)

---

## 🛠️ Tech Stack Overview

- **Frontend**: React.js, Material-UI, React Router v6, Axios
- **Backend**: Node.js, Express.js, JWT, MongoDB
- **AI Service**: Python, Flask, scikit-learn
- **ETL Pipeline**: Python, Pandas
- **Cloud & DevOps**: AWS (EC2, S3, Lambda), Docker Compose, GitHub Actions

*For a detailed list of approved libraries and constraints, please carefully read `TECH_STACK.md` before installing any packages.*

---

## 🏃‍♂️ How to Get Started

1. **Clone the Repository**: Pull the latest code to your local machine.
2. **Review the Requirements**: Read `PRD.md` to fully understand the system requirements and your specific module.
3. **Branch Out**: Checkout to your designated feature branch (do not push directly to `main` or `dev`).
4. **Test-Driven Approach**: Read your module's specific test document in the `tests/` folder to understand the exact acceptance criteria before you start coding.
5. **Begin Coding**: Start development in your respective folders (`client/` or `server/`).
6. **Update Progress**: Once a feature is complete and passes the test cases, update this README with your completed tasks and raise a PR to the `dev` branch.
