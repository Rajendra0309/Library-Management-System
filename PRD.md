# Product Requirements Document (PRD)
## Library Management System — LMS
### CBA Internship Capstone Project

---

## 1. PRODUCT SUMMARY

The Library Management System is a full-stack web application that digitizes all library operations. It serves three types of users: Admin, Librarian, and Member. The system handles books, members, borrowing, returns, fines, reservations, e-books, AI recommendations, analytics, and cloud deployment.

---

## 2. PROBLEM STATEMENT

Traditional libraries face:
- Manual record keeping leads to errors and lost data
- No real-time tracking of book availability
- Fine calculation is error-prone and inconsistent
- No way to analyze library usage patterns
- Poor member experience with no self-service options

---

## 3. GOALS

- Digitize entire book catalog with real-time availability
- Automate fine calculation and notifications
- Provide AI-based book recommendations to members
- Give admins data-driven insights through analytics
- Deploy on cloud with zero manual infrastructure management

---

## 4. USER PERSONAS

### Admin
- Full control over the system
- Manages staff, members, books
- Views all reports and analytics
- Can waive fines, suspend members

### Librarian
- Day-to-day library operations
- Issues and returns books
- Manages book catalog
- Cannot access reports or staff management

### Member
- Self-registers on the platform
- Browrows, reserves books
- Views own history and fines
- Gets AI-based recommendations
- Reads e-books online

---

## 5. FUNCTIONAL REQUIREMENTS

### FR-01: Authentication
- User can register with name, email, password, phone
- User can login with email and password
- System generates JWT token on successful login
- Token expires in 7 days
- Account locks after 3 failed attempts for 15 minutes
- User can change password after login
- Role is assigned at registration or by admin

### FR-02: Book Management
- Librarian/Admin can add books with title, author, ISBN, genre, copies, cover image
- ISBN must be unique and validated (ISBN-10 or ISBN-13)
- Cover image uploaded to AWS S3
- E-book PDF uploaded to AWS S3
- Barcode generated from ISBN
- Available copies updated automatically on issue/return
- Books cannot be deleted if active borrows exist
- Search works by title, author, genre, ISBN (partial match, case insensitive)
- Filter by availability, genre, language, year
- Sort by title, year, most borrowed

### FR-03: Member Management
- Librarian/Admin can add, edit, view members
- Each member gets a unique membership ID (LMS-YYYY-XXXX)
- Member status: active, suspended, expired
- Suspended members cannot borrow or reserve
- Members with unpaid fines above Rs 100 cannot borrow
- Members can view own profile and history

### FR-04: Borrowing
- Librarian issues book to member by searching member and book
- Loan period is 14 days by default
- Member can have maximum 5 active borrows
- Book availability decreases by 1 on issue
- Book availability increases by 1 on return
- Member can renew up to 2 times (extends 7 days each time)
- Renewal blocked if book is reserved by another member
- Renewal blocked if book is overdue

### FR-05: Fine Management
- Fine rate is Rs 2 per day per overdue book
- Fine auto-calculated daily by Lambda function
- Fine created when book is returned overdue
- Member can view fine details
- Librarian marks fine as paid
- Admin can waive fine with mandatory reason
- Member cannot borrow if total unpaid fines exceed Rs 100
- Maximum fine per book capped at Rs 500

### FR-06: Reservation System
- Member can reserve a book that is currently unavailable
- Maximum 1 reservation per book per member
- When reserved book becomes available, member gets email
- Member has 3 days to borrow after notification
- Reservation expires after 3 days if not acted on
- Next in queue gets notified when reservation expires
- Member can cancel reservation anytime
- Queue order is first-come-first-served

### FR-07: E-Book Management
- E-books stored as PDF on AWS S3
- Only active members can access e-books
- E-book opens in browser PDF viewer
- Librarian/Admin uploads e-book during book creation or edit
- E-book access link is a pre-signed S3 URL (expires in 1 hour)

### FR-08: Staff Management
- Admin can add, edit, delete staff
- Staff roles: admin, librarian
- Staff has name, email, department, employee ID
- Admin cannot delete own account
- Staff login uses same auth system with role-based access

### FR-09: AI Recommendations
- System recommends 5 books based on member borrowing history
- Uses content-based filtering (genre, author preferences)
- If no borrowing history, shows top 5 most borrowed books
- Recommendations shown on member dashboard and profile
- Recommendations exclude books already borrowed by the member

### FR-10: Reports & Analytics (Admin only)
- Dashboard summary: total books, members, active borrows, fine collected
- Monthly borrowing trends (line chart)
- Most popular books top 10 (bar chart)
- Genre distribution (pie chart)
- Fine collection summary (total collected, pending)
- New member registrations per month
- ETL pipeline generates report data daily

### FR-11: Notifications
- Email sent when book is due in 2 days
- Email sent when book is overdue
- Email sent when reserved book is available
- Email sent when reservation expires
- Email sent on new membership creation
- Email sent when fine is paid

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### Performance
- Page load time under 3 seconds
- API response time under 500ms for standard queries
- Search results returned under 1 second

### Security
- All passwords bcrypt hashed with salt rounds 12
- JWT required for all protected routes
- Role-based access strictly enforced
- S3 files accessed via pre-signed URLs only
- Environment variables never committed to GitHub
- CORS configured to frontend domain only

### Availability
- Hosted on AWS EC2 with PM2 (auto-restart on crash)
- CloudWatch alarms for CPU above 80%
- MongoDB Atlas free tier with automatic backups

### Scalability
- Stateless backend (JWT-based, no server sessions)
- MongoDB Atlas can scale independently
- S3 for file storage (unlimited)

---

## 7. TECHNICAL CONSTRAINTS

- Must use MERN stack (MongoDB, Express, React, Node)
- AI service in Python Flask
- ETL pipeline in Python with Pandas
- Deployment on AWS Free Tier only
- No paid services or APIs
- JavaScript only on frontend (no TypeScript)
- All secrets in .env files, never hardcoded

---

## 8. ACCEPTANCE CRITERIA

| Feature | Acceptance Criteria |
|---------|-------------------|
| Auth | User can register, login, logout. JWT works. Roles enforced. |
| Books | CRUD works. Image uploads to S3. Search returns correct results. |
| Members | CRUD works. Membership ID auto-generated. Status management works. |
| Borrowing | Issue/return updates availability. Renewal rules enforced. |
| Fines | Auto-calculated daily. Paid status tracked. Waiver works. |
| Reservations | Queue works in order. Email sent on availability. Expiry works. |
| E-Books | PDF accessible via pre-signed URL. Only for active members. |
| AI | Recommendations shown. Fallback to popular books works. |
| Reports | All charts load with correct data. ETL runs daily. |
| Deployment | App accessible via public URL. All features work on AWS. |

---

## 9. OUT OF SCOPE

- Mobile application
- Payment gateway integration (fines marked as paid manually)
- Physical barcode scanner hardware
- Multi-library support
- Book purchasing system
- Social features (reviews, ratings)
