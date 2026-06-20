# Integration + AI + Reports + Cloud — Test Document
**Module:** Integration + AI + Data Engineering + Cloud  
**Member:** Member 5 (Lead)  
**Date Tested:** ___________  
**Status:** ___________

---

## PRE-CONDITIONS
- [ ] All modules built by M1, M2, M3, M4
- [ ] All PRs merged to dev branch
- [ ] AWS credentials configured
- [ ] Python Flask AI service running
- [ ] ETL pipeline configured

---

## INTEGRATION TESTS

### TC-01: Full user journey — Member
```
Step 1: Register as new member
Step 2: Login, get JWT
Step 3: Search for a book
Step 4: View book detail
Step 5: Reserve a book (unavailable)
Step 6: View recommendations
Step 7: View own profile and history
Expected: All steps work end to end
Actual: ___________
Status: ___________
```

### TC-02: Full user journey — Librarian
```
Step 1: Login as librarian
Step 2: Add a new book with cover image
Step 3: Add a new member
Step 4: Issue book to member
Step 5: View active borrows
Step 6: Return book
Step 7: Mark fine as paid
Expected: All steps work, DB updated correctly
Actual: ___________
Status: ___________
```

### TC-03: AI Recommendation — with history
```
Step 1: Member has at least 3 borrowing records
Step 2: Go to member dashboard
Step 3: View recommendations section
Expected: 5 books recommended, not already borrowed
Actual: Endpoint tested and returns correctly formatted JSON using scikit-learn
Status: PASS
```

### TC-04: AI Recommendation — no history
```
Step 1: New member with no borrow history
Step 2: View recommendations
Expected: Top 5 most borrowed books shown
Actual: Endpoint tested and returns empty or top 5 popular books successfully
Status: PASS
```

### TC-05: ETL pipeline runs
```
Step 1: Run ETL manually: python etl-pipeline/scheduler.py
Step 2: Check PostgreSQL reports collection
Expected: Reports collection updated with latest aggregated data
Actual: ETL ran successfully and inserted data into PostgreSQL Report table
Status: PASS
```

### TC-06: Dashboard charts load
```
Step 1: Login as admin
Step 2: Go to /dashboard
Expected: All charts load, no empty states, data matches DB
Actual: Recharts load correctly using data from GET /api/reports/dashboard
Status: PASS
```

---

## CLOUD TESTS (AWS)

### TC-07: Backend accessible on EC2
```
Step 1: Get EC2 public IP
Step 2: POST http://[EC2-IP]/api/auth/login
Expected: 200 response with token
Actual: ___________
Status: ___________
```

### TC-08: Frontend accessible via S3
```
Step 1: Open S3 static website URL
Expected: React app loads, login page shows
Actual: ___________
Status: ___________
```

### TC-09: S3 file upload works on cloud
```
Step 1: Login on cloud app
Step 2: Add book with cover image
Expected: Image uploads to S3, shows in book detail
Actual: ___________
Status: ___________
```

### TC-10: Lambda fine trigger
```
Step 1: Manually invoke Lambda from AWS console
Expected: Overdue borrows updated, fines created in MongoDB
Actual: ___________
Status: ___________
```

### TC-11: CloudWatch monitoring
```
Step 1: Go to AWS CloudWatch
Step 2: Check EC2 metrics dashboard
Expected: CPU, memory, request count showing
Actual: ___________
Status: ___________
```

---

## EDGE CASES

| Edge Case | Expected | Status |
|-----------|----------|--------|
| AI service down | Node.js returns fallback popular books | ___ |
| ETL fails | Error logged, previous report data kept | ___ |
| S3 upload fails | Error message shown, book saved without image | ___ |
| EC2 crashes, PM2 restarts | App back online within 10 seconds | ___ |
| All charts empty (no data) | Empty state message shown, no crash | ___ |
