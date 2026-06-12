# 📚 Library Management System (LMS)
## CBA Internship Capstone Project | Team of 5

---

## 📌 Table of Contents

1. Project Overview
2. Team & Module Distribution
3. System Architecture
4. Tech Stack
5. Database Design
6. Module Details
7. API Structure
8. AI Feature
9. Data Engineering & ETL
10. Cloud & Deployment
11. DevOps & Git Workflow
12. Security
13. User Roles & Access Control
14. Notifications
15. Edge Cases & Handling
16. Project Planning & Methodology
17. Daily Progress Tracking
18. Definition of Done
19. How to Run Locally

---

## 1. PROJECT OVERVIEW

### What Are We Building?
A full-stack **Library Management System** web application that digitalizes all library operations including book management, member management, borrowing, returns, fine calculation, reservations, search, staff management, e-book management, AI-based recommendations, and analytics reporting.

### Why Are We Building It?
Traditional libraries rely on manual paperwork which leads to:
- Lost book records
- No real-time availability tracking
- Manual fine calculations with errors
- No analytics for library growth
- Poor member experience

Our system solves all of these problems digitally.

### Who Will Use It?

```
┌─────────────────────────────────────────┐
│              LMS USERS                  │
├─────────────┬──────────────┬────────────┤
│    ADMIN    │  LIBRARIAN   │   MEMBER   │
│             │              │            │
│ Full access │ Manage books │ Borrow     │
│ Reports     │ Issue/Return │ Reserve    │
│ Staff mgmt  │ Members      │ Pay fines  │
│ System cfg  │ Fines        │ Read ebook │
└─────────────┴──────────────┴────────────┘
```

### Project Goals
- 100% book catalog digitization
- Real-time book availability tracking
- Automated fine calculation
- AI-powered book recommendations
- Cloud-hosted with AWS free tier
- Analytics dashboard for library insights

---

## 2. TEAM & MODULE DISTRIBUTION

| Member | Role | Modules Owned |
|--------|------|---------------|
| Member 1 | Samarth(M1) | Authentication + Staff Management |
| Member 2 | Madhusudhan(M2)| Book Management + Search & Catalog |
| Member 3 | Samrudhi(M3) | Member Management + Reservation System |
| Member 4 | Spoorthy(M4)| Borrowing & Returns + Fine Management |
| Member 5 | Rajendra(M5) | Integration + AI + Data Engineering + Cloud + DevOps + Reporting |

### Lead Responsibilities
- Frontend to Backend API integration
- AWS deployment and configuration
- GitHub branch reviews and merges
- AI recommendation service connection
- ETL pipeline and reports dashboard
- Daily standup coordination
- Final demo and documentation

---

## 3. SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                    React.js Frontend                            │
│         (Pages, Components, Context, Axios)                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP Requests
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                │
│                  Node.js + Express.js                           │
│         (Routes, Controllers, Middleware)                       │
└──────────┬──────────────┬──────────────┬────────────────────────┘
           │              │              │
           ▼              ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MongoDB    │  │  Python AI   │  │   AWS S3     │
│  (Primary    │  │  Flask API   │  │  (Files &    │
│   Database)  │  │  (Recommend) │  │   Images)    │
└──────────────┘  └──────────────┘  └──────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│              ETL PIPELINE (Python)               │
│         Extract → Transform → Load               │
│         MongoDB → Analytics Reports              │
└──────────────────────────────────────────────────┘
```

### Deployment Architecture (AWS)

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET                               │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS CLOUD (FREE TIER)                        │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │  S3 Bucket  │    │  EC2 / EBS  │    │   MongoDB Atlas     │ │
│  │  (Frontend  │    │  (Backend   │    │   (Free Cluster)    │ │
│  │   Static)   │    │   Node.js)  │    │                     │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   Lambda    │    │ CloudWatch  │    │    S3 Bucket        │ │
│  │  (Fine Auto │    │ (Monitoring │    │  (Book Images +     │ │
│  │   Trigger)  │    │  + Alerts)  │    │   E-book PDFs)      │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow Diagram

```
User Action on React UI
        │
        ▼
Axios HTTP Request (with JWT token in header)
        │
        ▼
Express.js Route Handler
        │
        ▼
Auth Middleware (verify JWT, check role)
        │
        ├── If unauthorized → 401 Response
        │
        ▼
Controller Logic
        │
        ├── MongoDB Query / Update
        ├── S3 Upload (if file)
        ├── NodeMailer (if notification)
        └── AI Flask API call (if recommendation)
        │
        ▼
JSON Response to Frontend
        │
        ▼
React State Update → UI Re-render
```

---

## 4. TECH STACK

### Complete Technology Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      FULL TECH STACK                            │
├─────────────────────────────────────────────────────────────────┤
│  FRONTEND                                                       │
│  ├── React.js 18+          (UI Framework)                       │
│  ├── JavaScript (ES6+)     (Language)                           │
│  ├── Material-UI (MUI)     (Component Library)                  │
│  ├── React Router v6       (Navigation)                         │
│  ├── Axios                 (API calls)                          │
│  ├── Context API           (State management)                   │
│  ├── Chart.js / Recharts   (Analytics charts)                   │
│  └── React-Barcode         (Barcode display)                    │
├─────────────────────────────────────────────────────────────────┤
│  BACKEND                                                        │
│  ├── Node.js               (Runtime)                            │
│  ├── Express.js            (Web Framework)                      │
│  ├── JWT                   (Authentication)                     │
│  ├── bcrypt                (Password hashing)                   │
│  ├── Multer                (File upload handling)               │
│  ├── AWS SDK               (S3 integration)                     │
│  ├── NodeMailer            (Email notifications)                │
│  └── node-cron             (Scheduled fine calculation)         │
├─────────────────────────────────────────────────────────────────┤
│  DATABASE                                                       │
│  └── MongoDB + MongoDB Atlas (Cloud hosted, free tier)          │
├─────────────────────────────────────────────────────────────────┤
│  AI SERVICE                                                     │
│  ├── Python 3.10+          (Language)                           │
│  ├── Flask                 (REST API)                           │
│  ├── scikit-learn          (ML model)                           │
│  └── Pandas                (Data processing)                    │
├─────────────────────────────────────────────────────────────────┤
│  DATA ENGINEERING                                               │
│  ├── Python + Pandas       (ETL pipeline)                       │
│  └── PyMongo               (MongoDB connection in Python)       │
├─────────────────────────────────────────────────────────────────┤
│  CLOUD (AWS FREE TIER)                                          │
│  ├── EC2 t2.micro          (Backend hosting)                    │
│  ├── S3                    (Static frontend + file storage)     │
│  ├── Lambda                (Serverless fine trigger)            │
│  ├── CloudWatch            (Monitoring + alerts)                │
│  └── IAM                   (Access management)                  │
├─────────────────────────────────────────────────────────────────┤
│  DEVOPS                                                         │
│  ├── Git + GitHub          (Version control)                    │
│  ├── GitHub Actions        (CI/CD pipeline)                     │
│  ├── Docker + Docker Compose (Containerization)                 │
│  ├── Nginx                 (Reverse proxy on EC2)               │
│  └── PM2                   (Node.js process manager)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. DATABASE DESIGN

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│    USER      │         │      BORROW       │         │    BOOK      │
│──────────────│         │──────────────────│         │──────────────│
│ _id          │◄────────│ memberId         │────────►│ _id          │
│ name         │         │ bookId           │         │ title        │
│ email        │         │ issueDate        │         │ author       │
│ password     │         │ dueDate          │         │ isbn         │
│ role         │         │ returnDate       │         │ genre        │
│ phone        │         │ status           │         │ totalCopies  │
│ membershipId │         │ renewalCount     │         │ availCopies  │
│ status       │         └──────────────────┘         │ coverImage   │
│ createdAt    │                  │                   │ ebookUrl     │
└──────────────┘                  │                   │ language     │
       │                          ▼                   │ publisher    │
       │                  ┌──────────────┐            │ publishYear  │
       │                  │    FINE      │            │ description  │
       │                  │──────────────│            │ createdAt    │
       │                  │ _id          │            └──────────────┘
       │                  │ memberId     │                   │
       │                  │ borrowId     │                   │
       │                  │ amount       │            ┌──────────────┐
       │                  │ daysOverdue  │            │ RESERVATION  │
       │                  │ status       │            │──────────────│
       │                  │ paidAt       │            │ _id          │
       │                  └──────────────┘            │ memberId     │
       │                                              │ bookId       │
       │                  ┌──────────────┐            │ reservedAt   │
       └─────────────────►│    STAFF     │            │ expiresAt    │
                          │──────────────│            │ status       │
                          │ _id          │            └──────────────┘
                          │ name         │
                          │ email        │
                          │ password     │
                          │ role         │
                          │ department   │
                          │ employeeId   │
                          └──────────────┘
```

### MongoDB Collections Summary

```
Collections:
├── users          → All users (admin, librarian, member)
├── books          → Book catalog
├── borrows        → All borrowing transactions
├── fines          → Fine records linked to borrows
├── reservations   → Book reservation queue
└── staff          → Library staff records
```

### Data Models Detail

**User Collection**
```
Field           Type        Description
─────────────────────────────────────────────
_id             ObjectId    Auto generated
name            String      Full name
email           String      Unique, required
password        String      Bcrypt hashed
role            String      admin/librarian/member
phone           String      Contact number
membershipId    String      Unique member ID (auto generated)
status          String      active/suspended/expired
profileImage    String      S3 URL
createdAt       Date        Auto timestamp
updatedAt       Date        Auto timestamp
```

**Book Collection**
```
Field           Type        Description
─────────────────────────────────────────────
_id             ObjectId    Auto generated
title           String      Book title
author          String      Author name
isbn            String      Unique ISBN number
genre           [String]    Array of genres
totalCopies     Number      Total copies in library
availableCopies Number      Currently available
coverImage      String      S3 URL
ebookUrl        String      S3 URL (PDF)
isEbook         Boolean     Has digital version
language        String      Book language
publisher       String      Publisher name
publishYear     Number      Year of publication
description     String      Short description
barcode         String      Generated barcode
createdAt       Date        Auto timestamp
```

**Borrow Collection**
```
Field           Type        Description
─────────────────────────────────────────────
_id             ObjectId    Auto generated
memberId        ObjectId    Reference to User
bookId          ObjectId    Reference to Book
issueDate       Date        Date book was issued
dueDate         Date        Return due date (14 days default)
returnDate      Date        Actual return date (null if active)
status          String      active/returned/overdue
renewalCount    Number      How many times renewed (max 2)
issuedBy        ObjectId    Staff who issued
returnedTo      ObjectId    Staff who received return
createdAt       Date        Auto timestamp
```

**Fine Collection**
```
Field           Type        Description
─────────────────────────────────────────────
_id             ObjectId    Auto generated
memberId        ObjectId    Reference to User
borrowId        ObjectId    Reference to Borrow
amount          Number      Total fine amount (Rs per day)
daysOverdue     Number      Days past due date
status          String      pending/paid/waived
paidAt          Date        Payment date
waivedBy        ObjectId    Staff who waived (if waived)
createdAt       Date        Auto timestamp
```

**Reservation Collection**
```
Field           Type        Description
─────────────────────────────────────────────
_id             ObjectId    Auto generated
memberId        ObjectId    Reference to User
bookId          ObjectId    Reference to Book
reservedAt      Date        Reservation created
expiresAt       Date        Reservation expires (3 days after available)
status          String      pending/fulfilled/cancelled/expired
notified        Boolean     Email sent when book available
createdAt       Date        Auto timestamp
```

---

## 6. MODULE DETAILS

### Module 1 — Authentication & Staff Management (Member 1)

**What it does:**
- Handles all login, registration, logout
- JWT token generation and verification
- Role-based middleware to protect routes
- Staff creation, update, delete by admin
- Staff login with separate dashboard access

**Pages to build:**
```
├── /login                  Login page
├── /register               Member self-registration
├── /admin/staff            Staff list
├── /admin/staff/add        Add new staff
└── /admin/staff/:id        Edit staff details
```

**Business Logic:**
- Password minimum 8 characters with complexity check
- JWT expires in 7 days, refresh on activity
- Member registration auto-assigns membership ID (LMS-YYYY-XXXX)
- Admin can suspend/activate member accounts
- Librarian cannot manage other staff
- Maximum 3 failed login attempts → account temporarily locked for 15 minutes

---

### Module 2 — Book Management & Search (Member 2)

**What it does:**
- Full CRUD for book catalog
- Book cover image upload to AWS S3
- E-book PDF upload to AWS S3
- Barcode generation per book
- Search by title, author, genre, ISBN
- Filter by availability, genre, language, year
- Sort by title, year, popularity

**Pages to build:**
```
├── /books                  Book catalog list
├── /books/:id              Book detail page
├── /books/add              Add new book form
├── /books/:id/edit         Edit book form
└── /search                 Advanced search page
```

**Business Logic:**
- ISBN must be unique, validate format (ISBN-10 / ISBN-13)
- When book is added, barcode auto-generated from ISBN
- availableCopies cannot exceed totalCopies
- Deleting a book only allowed if no active borrows
- Search should work with partial text, case insensitive
- E-book access only allowed to active members

---

### Module 3 — Member Management & Reservations (Member 3)

**What it does:**
- Member registration and profile management
- Member borrowing history view
- Book reservation system
- Email notification when reserved book becomes available
- Reservation queue management

**Pages to build:**
```
├── /members                Member list (librarian/admin view)
├── /members/:id            Member profile
├── /members/:id/history    Borrowing history
├── /profile                Own profile (member view)
├── /reservations           My reservations
└── /reservations/:bookId   Reserve a book
```

**Business Logic:**
- Member can have maximum 5 active borrows at a time
- Member with pending fines above Rs 100 cannot borrow new books
- Reservation expires after 3 days once book becomes available
- Email sent to member when reserved book is available
- If reservation expires, next person in queue gets notified
- Member can cancel reservation anytime
- Suspended member cannot borrow or reserve

---

### Module 4 — Borrowing & Returns + Fine Management (Member 4)

**What it does:**
- Book issue process (librarian scans barcode or searches)
- Book return process
- Renewal of borrowed book
- Automatic fine calculation for overdue books
- Fine payment tracking
- Fine waiver by admin

**Pages to build:**
```
├── /borrow/issue           Issue book form
├── /borrow/return          Return book form
├── /borrow/active          All active borrows list
├── /fines                  All fines list
├── /fines/:memberId        Member fine details
└── /fines/pay/:id          Mark fine as paid
```

**Business Logic:**
```
Fine Calculation:
- Standard loan period: 14 days
- Fine rate: Rs 2 per day per book after due date
- Fine is calculated daily (Lambda trigger at midnight)
- Renewal extends due date by 7 days
- Maximum 2 renewals per borrow
- Renewal not allowed if book is reserved by another member
- Renewal not allowed if already overdue
- Fine is auto-created when book is returned overdue
- Fine can be waived by admin with reason
- Member cannot have more than Rs 500 in unpaid fines
```

---

### Module 5 — Integration + AI + Data Engineering + Cloud (Lead)

**What it does:**
- Connects all frontend modules to respective backend APIs
- AI-based book recommendation system
- ETL pipeline for analytics
- Reports and dashboard
- AWS cloud deployment
- DevOps pipeline setup

**Pages to build:**
```
├── /dashboard              Admin/Librarian analytics dashboard
├── /reports                Detailed reports page
└── /recommendations        AI recommendations on member profile
```

**AI Recommendation Logic:**
- Analyzes member's borrowing history
- Finds genres and authors member prefers
- Returns top 5 book recommendations
- Falls back to most popular books if no history

**Reports to generate:**
- Total books borrowed per month
- Most popular books
- Most active members
- Fine collection summary
- Genre-wise distribution
- New members per month

---

## 7. API STRUCTURE

### Complete API Reference

```
BASE URL: http://localhost:5000/api
```

#### Authentication Routes
```
POST   /api/auth/register          Register new member
POST   /api/auth/login             Login user
GET    /api/auth/me                Get current user profile
POST   /api/auth/logout            Logout
PUT    /api/auth/change-password   Change password
```

#### Book Routes
```
GET    /api/books                  Get all books (with pagination)
GET    /api/books/:id              Get single book
POST   /api/books                  Add new book (librarian/admin)
PUT    /api/books/:id              Update book (librarian/admin)
DELETE /api/books/:id              Delete book (admin only)
GET    /api/books/search           Search books (?q=keyword&genre=&available=)
POST   /api/books/:id/upload-cover Upload cover image to S3
POST   /api/books/:id/upload-ebook Upload ebook PDF to S3
```

#### Member Routes
```
GET    /api/members                Get all members (librarian/admin)
GET    /api/members/:id            Get member details
POST   /api/members                Create member (admin/librarian)
PUT    /api/members/:id            Update member
DELETE /api/members/:id            Delete member (admin only)
PUT    /api/members/:id/status     Suspend or activate member
GET    /api/members/:id/history    Get borrowing history
```

#### Borrow Routes
```
POST   /api/borrow/issue           Issue book to member
POST   /api/borrow/return/:id      Return a borrowed book
PUT    /api/borrow/renew/:id       Renew a borrowed book
GET    /api/borrow/active          Get all active borrows
GET    /api/borrow/overdue         Get all overdue borrows
GET    /api/borrow/history/:memberId  Member borrow history
```

#### Fine Routes
```
GET    /api/fines                  Get all fines
GET    /api/fines/:memberId        Get fines for a member
PUT    /api/fines/pay/:id          Mark fine as paid
PUT    /api/fines/waive/:id        Waive fine (admin only)
GET    /api/fines/summary          Fine collection summary
```

#### Reservation Routes
```
POST   /api/reservations           Create reservation
GET    /api/reservations/:memberId Get member reservations
DELETE /api/reservations/:id       Cancel reservation
GET    /api/reservations/book/:bookId  Reservation queue for a book
```

#### Staff Routes
```
GET    /api/staff                  Get all staff
POST   /api/staff                  Add staff (admin only)
PUT    /api/staff/:id              Update staff
DELETE /api/staff/:id              Delete staff (admin only)
```

#### Report Routes
```
GET    /api/reports/dashboard      Dashboard summary stats
GET    /api/reports/popular-books  Most borrowed books
GET    /api/reports/borrowing-trends  Monthly borrowing trends
GET    /api/reports/fine-summary   Fine collection report
GET    /api/reports/member-activity  Active members report
GET    /api/reports/genre-stats    Genre distribution
```

#### AI Routes
```
POST   /api/ai/recommend           Get book recommendations for member
```

---

## 8. AI FEATURE - BOOK RECOMMENDATION

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│               AI RECOMMENDATION FLOW                        │
│                                                             │
│  Member opens profile / dashboard                           │
│              │                                              │
│              ▼                                              │
│  Node.js calls Flask AI API                                 │
│  POST /ai/recommend { memberId }                            │
│              │                                              │
│              ▼                                              │
│  Flask fetches member borrow history from MongoDB           │
│              │                                              │
│              ▼                                              │
│  Extract genres and authors member reads most               │
│              │                                              │
│              ▼                                              │
│  scikit-learn content-based filtering                       │
│  (TF-IDF vectorizer on book descriptions + genres)          │
│              │                                              │
│              ▼                                              │
│  Return top 5 book recommendations (not already borrowed)   │
│              │                                              │
│              ▼                                              │
│  Node.js returns to React → shown in recommendation section │
└─────────────────────────────────────────────────────────────┘
```

### Fallback Logic
```
Has borrowing history?
├── YES → Content-based filtering → top 5 recommendations
└── NO  → Return top 5 most borrowed books in the library
```

### AI Service Structure
```
ai-service/
├── app.py              Flask app with /recommend endpoint
├── model.py            TF-IDF model setup and training
├── recommend.py        Recommendation logic
├── requirements.txt    Python dependencies
└── data_loader.py      MongoDB connection and data fetch
```

---

## 9. DATA ENGINEERING & ETL

### ETL Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                    ETL PIPELINE FLOW                         │
│                                                              │
│  EXTRACT                 TRANSFORM              LOAD         │
│  ─────────               ─────────              ────         │
│  Read from           →   Clean data         →   Store in     │
│  MongoDB                 Aggregate stats        MongoDB      │
│  Collections             Calculate trends       reports      │
│                          Format for charts      collection   │
│                                                              │
│  Collections read:       Operations:            Output:      │
│  ├── borrows             ├── Group by month     Dashboard    │
│  ├── fines               ├── Count borrows      stats ready  │
│  ├── books               ├── Sum fines          for charts   │
│  ├── users               ├── Rank popular       in React     │
│  └── reservations        └── Genre breakdown                 │
└──────────────────────────────────────────────────────────────┘
```

### ETL Pipeline Files
```
etl-pipeline/
├── extract.py          Pull raw data from MongoDB collections
├── transform.py        Aggregate and process the data
├── load.py             Write processed data to reports collection
├── scheduler.py        Runs ETL daily using schedule library
└── requirements.txt    pymongo, pandas, schedule
```

### Reports Generated by ETL
```
Report                    Source Data             Output
─────────────────────────────────────────────────────────────
Monthly borrow count      borrows collection      Line chart data
Popular books top 10      borrows grouped         Bar chart data
Fine collection total     fines paid/pending      Summary numbers
Genre distribution        books genres            Pie chart data
New members per month     users created           Line chart data
Active vs inactive        borrow status           Donut chart data
```

---

## 10. CLOUD & DEPLOYMENT

### AWS Free Tier Services Used

```
┌──────────────────────────────────────────────────────────────┐
│                  AWS FREE TIER USAGE                         │
├──────────────────┬───────────────────────────────────────────┤
│ Service          │ What We Use It For                        │
├──────────────────┼───────────────────────────────────────────┤
│ EC2 t2.micro     │ Host Node.js backend + AI Flask service   │
│ S3               │ React build static hosting + file storage │
│ Lambda           │ Daily fine calculation trigger            │
│ CloudWatch       │ Monitor EC2 + Lambda + set alerts         │
│ IAM              │ Users, roles, policies for AWS access     │
│ MongoDB Atlas    │ Free M0 cluster (512MB)                   │
└──────────────────┴───────────────────────────────────────────┘
```

### Deployment Flow

```
LOCAL DEVELOPMENT
      │
      │ Push code to GitHub
      ▼
GITHUB (feature branch → dev → main)
      │
      │ GitHub Actions CI/CD triggers
      ▼
┌─────────────────────────────────────┐
│         AWS DEPLOYMENT              │
│                                     │
│  React Build → S3 Bucket            │
│  (Static website hosting enabled)   │
│                                     │
│  Node.js App → EC2 t2.micro         │
│  (Nginx reverse proxy + PM2)        │
│                                     │
│  AI Flask → Same EC2                │
│  (Running on port 5001)             │
│                                     │
│  Lambda → Scheduled daily           │
│  (Triggers fine calculation)        │
└─────────────────────────────────────┘
```

### Nginx Configuration Purpose
```
EC2 Instance
├── Port 80/443  → Nginx (reverse proxy)
│     ├── /api  → Node.js on port 5000
│     └── /ai   → Flask on port 5001
└── PM2 keeps Node.js running always
```

### Lambda Fine Trigger

```
CloudWatch Events Rule
├── Schedule: cron(0 0 * * ? *)     Every day at midnight
├── Target: Lambda function
└── Lambda does:
    ├── Connect to MongoDB Atlas
    ├── Find all borrows where status=active AND dueDate < today
    ├── Update status to overdue
    ├── Create or update fine record (days × Rs 2)
    └── Send email to overdue members via NodeMailer
```

### S3 Bucket Structure
```
lms-storage-bucket/
├── covers/          Book cover images
│   └── {bookId}.jpg
├── ebooks/          E-book PDF files
│   └── {bookId}.pdf
└── profiles/        Member profile pictures
    └── {userId}.jpg

lms-frontend-bucket/
└── build/           React production build (static hosting)
```

---

## 11. DEVOPS & GIT WORKFLOW

### Git Branching Strategy

```
main (production)
│
└── dev (integration)
    │
    ├── feature/auth-staff          (Member 1)
    ├── feature/books-search        (Member 2)
    ├── feature/members-reservations (Member 3)
    ├── feature/borrowing-fines     (Member 4)
    └── feature/integration-ai-cloud (Member 5)
```

### Git Workflow Rules
```
1. Never push directly to main
2. Never push directly to dev
3. Always work on your feature branch
4. Raise Pull Request to dev when task is done
5. Lead reviews and merges PR to dev
6. When all features are integrated and tested → merge dev to main
7. main branch triggers GitHub Actions deployment
```

### GitHub Actions CI/CD Pipeline

```
Trigger: Push to main branch
         │
         ▼
Step 1: Checkout code
Step 2: Install dependencies (npm install)
Step 3: Run basic lint check
Step 4: Build React app (npm run build)
Step 5: Upload React build to S3 bucket
Step 6: SSH into EC2 and pull latest code
Step 7: Restart PM2 process
Step 8: Deployment complete notification
```

### Docker Setup (Local Development)

```
docker-compose.yml manages:
├── mongo container         (local MongoDB)
├── server container        (Node.js backend)
├── client container        (React frontend)
└── ai-service container    (Python Flask)

All containers on same Docker network
One command: docker-compose up → entire project runs
```

---

## 12. SECURITY

### Security Measures Implemented

```
┌──────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├──────────────────────────────────────────────────────────────┤
│  AUTHENTICATION                                              │
│  ├── JWT tokens (7 day expiry)                               │
│  ├── bcrypt password hashing (salt rounds: 12)               │
│  ├── Account lockout after 3 failed attempts                 │
│  └── Passwords never stored in plain text                    │
├──────────────────────────────────────────────────────────────┤
│  AUTHORIZATION                                               │
│  ├── Role middleware on every protected route                │
│  ├── Member cannot access admin routes                       │
│  ├── Librarian cannot access admin-only routes               │
│  └── JWT verified on every API request                       │
├──────────────────────────────────────────────────────────────┤
│  INPUT VALIDATION                                            │
│  ├── All inputs validated before DB operations               │
│  ├── ISBN format validated                                   │
│  ├── Email format validated                                  │
│  └── File type check before S3 upload (jpg/png/pdf only)     │
├──────────────────────────────────────────────────────────────┤
│  AWS SECURITY                                                │
│  ├── IAM roles with minimum required permissions             │
│  ├── S3 bucket not publicly accessible (pre-signed URLs)     │
│  ├── EC2 security group allows only 80, 443, 22              │
│  └── Environment variables never committed to GitHub         │
├──────────────────────────────────────────────────────────────┤
│  DATA SECURITY                                               │
│  ├── MongoDB Atlas has IP whitelist                          │
│  ├── All secrets in .env file (gitignored)                   │
│  └── CORS configured to allow only frontend domain           │
└──────────────────────────────────────────────────────────────┘
```

---

## 13. USER ROLES & ACCESS CONTROL

### Permissions Matrix

```
Feature                          ADMIN   LIBRARIAN   MEMBER
─────────────────────────────────────────────────────────────
View book catalog                 ✅        ✅          ✅
Search books                      ✅        ✅          ✅
Read e-books                      ✅        ✅          ✅
Add new book                      ✅        ✅          ❌
Edit book details                 ✅        ✅          ❌
Delete book                       ✅        ❌          ❌
View all members                  ✅        ✅          ❌
Add member                        ✅        ✅          ❌
Edit member                       ✅        ✅          ❌
Delete member                     ✅        ❌          ❌
Suspend member                    ✅        ❌          ❌
Issue book                        ✅        ✅          ❌
Return book                       ✅        ✅          ❌
Renew book                        ✅        ✅          ✅
Reserve book                      ✅        ✅          ✅
Cancel reservation                ✅        ✅          ✅ (own only)
View fines                        ✅        ✅          ✅ (own only)
Mark fine as paid                 ✅        ✅          ❌
Waive fine                        ✅        ❌          ❌
View reports/dashboard            ✅        ❌          ❌
Manage staff                      ✅        ❌          ❌
View AI recommendations           ✅        ✅          ✅
```

---

## 14. NOTIFICATIONS

### Email Notification Events

```
Event                              Recipient    When Triggered
────────────────────────────────────────────────────────────────
Book due in 2 days                 Member       Daily Lambda check
Book overdue                       Member       Daily Lambda check
Fine created                       Member       On overdue detection
Reserved book now available        Member       On book return
Reservation expired                Member       After 3 days no pickup
New membership created             Member       On registration
Fine paid confirmation             Member       On fine payment
Account suspended                  Member       On suspension
```

### Notification Flow
```
Lambda / node-cron runs daily
        │
        ▼
Check all active borrows
        │
        ├── dueDate = today + 2 → send "Due Soon" email
        ├── dueDate = today → send "Due Today" email
        └── dueDate < today → send "Overdue + Fine" email

When book returned
        │
        ├── Check reservation queue for this book
        ├── If reservation exists → send "Book Available" email
        └── Update reservation status to notified
```

---

## 15. EDGE CASES & HANDLING

### Book Management
```
Edge Case                           Handling
──────────────────────────────────────────────────────────────────
Delete book with active borrows     Block deletion, show error message
ISBN already exists                 Validate before save, return conflict error
Cover image upload fails            Book saved without image, retry option
Available copies goes negative      Hard block at 0, never allow below 0
Duplicate book entry                ISBN uniqueness check at DB level
E-book PDF too large                File size limit 50MB, reject if exceeded
```

### Borrowing & Returns
```
Edge Case                           Handling
──────────────────────────────────────────────────────────────────
Member borrows same book twice      Check active borrows before issue
Book not available but try to issue Show out-of-stock message
Return wrong book (wrong ID)        Barcode mismatch error shown
Renewal when reserved by others     Block renewal, notify reservation exists
Renewal when overdue                Block renewal, must return and pay fine
More than 5 active borrows          Block, show current borrow count
Return after very long time         Calculate fine for all days, cap at Rs 500
```

### Fine Management
```
Edge Case                           Handling
──────────────────────────────────────────────────────────────────
Fine already exists but runs again  Check before creating, update if exists
Member has multiple fines           Sum total, block borrow if above Rs 100
Fine paid but book not returned     Payment recorded, borrow still active
Admin waives fine without reason    Reason field mandatory for waiver
Fine calculation on holidays        Same rate applies, no holiday exceptions
```

### Reservations
```
Edge Case                           Handling
──────────────────────────────────────────────────────────────────
Reserve book that is available      Redirect to borrow directly
Reserve same book twice             Block duplicate reservation per member
Book deleted while reserved         Cancel all reservations, notify members
All reservations expire             Book shows as available again normally
Queue order                         First-come-first-served by reservedAt date
```

### Authentication
```
Edge Case                           Handling
──────────────────────────────────────────────────────────────────
Expired JWT token                   Return 401, frontend redirects to login
Login with wrong password 3 times   Lock account 15 minutes
Duplicate email registration        Return conflict error, suggest login
Member tries admin route            Return 403 Forbidden
Token missing in request            Return 401 Unauthorized
Password too weak                   Validate: min 8 chars, 1 number, 1 special
```

### File Uploads
```
Edge Case                           Handling
──────────────────────────────────────────────────────────────────
Wrong file type uploaded            Accept only jpg/png for images, pdf for ebooks
S3 upload fails                     Retry once, show error if still fails
Very large file                     Images max 5MB, PDFs max 50MB
Same file uploaded twice            Overwrite with new file, keep S3 key same
```

---

## 16. PROJECT PLANNING & METHODOLOGY

### Approach
We follow **Agile Scrum** methodology adapted for our team size and timeline.

### Planning Breakdown

```
Phase 1: Setup & Foundation
├── GitHub repository setup
├── Project folder structure
├── MongoDB Atlas cluster creation
├── Environment configuration
├── Docker Compose for local dev
└── Base API server running

Phase 2: Core Modules Development (Parallel)
├── Member 1: Auth + Staff (working independently)
├── Member 2: Books + Search (working independently)
├── Member 3: Members + Reservations (working independently)
└── Member 4: Borrowing + Fines (working independently)

Phase 3: Integration (Lead)
├── Connect all frontend pages to APIs
├── Test all API endpoints with Postman
├── Fix integration issues
├── AI service integration
└── ETL pipeline and reports

Phase 4: Cloud Deployment
├── EC2 setup and backend deploy
├── S3 setup for frontend and files
├── Lambda fine trigger setup
├── CloudWatch monitoring
└── Domain/IP testing

Phase 5: Testing & Polish
├── All modules integration tested
├── Edge cases verified
├── UI responsive check
├── Final bug fixes
└── Demo preparation
```

### Communication Plan
```
Daily Standup (10 minutes):
├── What did I complete yesterday?
├── What will I do today?
└── Any blockers?

GitHub PR Reviews:
├── Raise PR when feature is done
├── Lead reviews within same day
└── Merge to dev after review

Issue Tracking:
└── GitHub Issues for bugs and tasks
```


---

## 18. DEFINITION OF DONE

### A task is considered DONE only when:

```
For Backend Task:
├── API endpoint working correctly
├── Tested on Postman (all methods)
├── Error handling added (try/catch)
├── Input validation added
├── Code pushed to feature branch
└── PR raised on GitHub

For Frontend Task:
├── Page/component renders correctly
├── Connected to backend API
├── Loading states shown
├── Error messages shown to user
├── Responsive on mobile and desktop
├── No console errors
└── Code pushed to feature branch

For Integration:
├── Frontend and backend connected end to end
├── All roles tested
├── Edge cases handled
└── Lead reviewed and merged

For Deployment:
├── App accessible via public URL
├── All features working on cloud
├── CloudWatch monitoring active
└── Tested by all team members
```

---

## 19. PROJECT FOLDER STRUCTURE

```
library-management-system/
│
├── client/                              # React.js Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── BookCard.jsx
│   │   │   ├── MemberCard.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Books/
│   │   │   │   ├── BookList.jsx
│   │   │   │   ├── BookDetail.jsx
│   │   │   │   ├── AddBook.jsx
│   │   │   │   └── EditBook.jsx
│   │   │   ├── Members/
│   │   │   │   ├── MemberList.jsx
│   │   │   │   ├── MemberProfile.jsx
│   │   │   │   └── MemberHistory.jsx
│   │   │   ├── Borrowing/
│   │   │   │   ├── IssueBook.jsx
│   │   │   │   ├── ReturnBook.jsx
│   │   │   │   └── ActiveBorrows.jsx
│   │   │   ├── Fines/
│   │   │   │   ├── FineList.jsx
│   │   │   │   └── FineDetail.jsx
│   │   │   ├── Reservations/
│   │   │   │   ├── ReservationList.jsx
│   │   │   │   └── ReserveBook.jsx
│   │   │   ├── Staff/
│   │   │   │   ├── StaffList.jsx
│   │   │   │   └── AddStaff.jsx
│   │   │   ├── Reports/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── ReportDetails.jsx
│   │   │   └── NotFound.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env
│   └── package.json
│
├── server/                              # Node.js + Express Backend
│   ├── config/
│   │   ├── db.js
│   │   └── s3.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── Member.js
│   │   ├── Borrow.js
│   │   ├── Fine.js
│   │   ├── Reservation.js
│   │   └── Staff.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── book.routes.js
│   │   ├── member.routes.js
│   │   ├── borrow.routes.js
│   │   ├── fine.routes.js
│   │   ├── reservation.routes.js
│   │   ├── staff.routes.js
│   │   ├── report.routes.js
│   │   └── ai.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── book.controller.js
│   │   ├── member.controller.js
│   │   ├── borrow.controller.js
│   │   ├── fine.controller.js
│   │   ├── reservation.controller.js
│   │   ├── staff.controller.js
│   │   ├── report.controller.js
│   │   └── ai.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── upload.middleware.js
│   ├── utils/
│   │   ├── mailer.js
│   │   ├── fineCalculator.js
│   │   └── membershipId.js
│   ├── jobs/
│   │   └── fineJob.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── ai-service/                          # Python AI Recommendation
│   ├── app.py
│   ├── model.py
│   ├── recommend.py
│   ├── data_loader.py
│   └── requirements.txt
│
├── etl-pipeline/                        # Python Data Engineering
│   ├── extract.py
│   ├── transform.py
│   ├── load.py
│   ├── scheduler.py
│   └── requirements.txt
│
├── .github/
│   └── workflows/
│       └── deploy.yml                   # GitHub Actions CI/CD
│
├── docker-compose.yml                   # Local development setup
├── .gitignore
└── README.md
```

---

## 20. ENVIRONMENT VARIABLES

### Server (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lms
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=lms-storage-bucket
AWS_REGION=ap-south-1

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

AI_SERVICE_URL=http://localhost:5001
FINE_RATE_PER_DAY=2
MAX_BORROW_LIMIT=5
LOAN_PERIOD_DAYS=14
RENEWAL_EXTENSION_DAYS=7
MAX_RENEWALS=2
RESERVATION_EXPIRY_DAYS=3
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 21. HOW TO RUN LOCALLY

### Option A: Docker (Recommended)
```
1. Install Docker Desktop
2. Clone repository
3. Copy .env files
4. Run: docker-compose up
5. Frontend: http://localhost:3000
6. Backend: http://localhost:5000
7. AI Service: http://localhost:5001
```

### Option B: Manual
```
1. Start MongoDB locally or use MongoDB Atlas URI

2. Backend:
   cd server
   npm install
   npm run dev

3. Frontend:
   cd client
   npm install
   npm start

4. AI Service:
   cd ai-service
   pip install -r requirements.txt
   python app.py
```