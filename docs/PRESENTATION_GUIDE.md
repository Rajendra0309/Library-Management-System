# Library Management System - Team Presentation Guide

This guide outlines the presentation strategy for the Library Management System (LMS) Capstone Project.

---

## Suggested Presentation Flow
Based on standard Capstone guidelines, your slides should follow this exact sequence:
**Introduction &rarr; Topic Overview &rarr; Main Content &rarr; Case Study/Examples &rarr; Key Findings &rarr; Conclusion &rarr; Q&A &rarr; Thank You Slide**

To align our 5 modules with this flow, we have divided the presentation as follows:

---

## 🎤 Member 1: Samarth
**Module:** Authentication, Security & Staff Management
**Aligns with Flow:** Introduction & Topic Overview

### Talking Points:
1. **Introduction & Problem Statement:** Briefly introduce the LMS. Explain the problem with traditional paper-based libraries (inefficiency, poor tracking) and how our digital solution solves it.
2. **Security & Authentication Flow:** Explain how the system handles user security. Discuss the use of JWT (JSON Web Tokens) for session management and `bcrypt` for password hashing.
3. **OTP & Email Verification:** Demonstrate the registration process and the "Forgot Password" flow. Emphasize that the system uses a secure OTP system powered by Nodemailer (Gmail SMTP).
4. **Staff Management (Admin Dashboard):** Show the Admin Dashboard. Explain Role-Based Access Control (RBAC) and how Admins manage the system.

---

## 🎤 Member 2: Madhusudhan
**Module:** Book Inventory Management, Catalog & Search
**Aligns with Flow:** Main Content (Part 1)

### Talking Points:
1. **Digital Cataloging:** Explain how the library's physical inventory is digitized. Show the Librarian's "Add Book" interface.
2. **Cloud Asset Management:** Discuss how physical book covers and digital E-Book PDFs are securely uploaded and stored in an AWS S3 Bucket, bypassing local storage limitations.
3. **Advanced Search & Filtering:** Demonstrate the Member's Book Catalog page. Show how members can instantly filter books by genre, language, and search.
4. **Barcode Generation:** Explain the automatic generation of ISBN barcodes on the Book Details page for physical scanning.

---

## 🎤 Member 3: Samrudhi
**Module:** Member Profiles, UI/UX & Reservation System
**Aligns with Flow:** Main Content (Part 2)

### Talking Points:
1. **Modern UI/UX Design:** Discuss the frontend choices. Explain why React.js and TailwindCSS were chosen to build a responsive, premium enterprise application.
2. **Member Dashboard:** Walk through the Member's perspective. Show how a member can view active borrowed books and track unpaid fines.
3. **The Reservation Engine:** Explain the complex logic behind book reservations. Show how a member can reserve a book that is out of stock.
4. **Queue Management:** Explain how the backend handles the reservation queue, preventing users from double-booking.

---

## 🎤 Member 4: Spoorthy
**Module:** Core Circulation (Borrowing, Returns, Fines & Cron Jobs)
**Aligns with Flow:** Main Content (Part 3) & Case Study/Examples

### Talking Points:
1. **Borrowing Workflow (Issue Book):** Explain the core transactional engine. Show how a Librarian issues a book to a member, validating limits.
2. **Returns Workflow:** Demonstrate how a returned book restores the inventory count.
3. **Automated Fine Calculation:** Show the financial penalty system (e.g. returning a book past its due date). This acts as a primary **Case Study**.
4. **Automated Background Jobs (Cron):** Detail the AWS EventBridge setup that triggers a secure Lambda function every night to scan for overdue books and dispatch warning emails.

---

## 🎤 Member 5: Rajendra
**Module:** System Architecture, AI, ETL & Cloud DevOps
**Aligns with Flow:** Key Findings & Conclusion

### Talking Points:
1. **Microservices Architecture:** Bring the presentation together by explaining the "under the hood" architecture.
2. **AI Recommendation Service:** Describe how the Python Flask AI engine uses Scikit-learn to power the "Recommended for You" section based on borrowing history.
3. **ETL Data Pipeline:** Explain the Python Pandas data pipeline that runs in the background for analytical reporting.
4. **Conclusion (AWS Cloud Deployment & CI/CD):** Summarize the robust DevOps pipeline (GitHub Actions, Amazon ECR, ECS Fargate, RDS PostgreSQL). Provide the final **Conclusion** that the project is enterprise-ready.
5. **Q&A / Thank You:** Open the floor for questions.
