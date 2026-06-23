# Member Management & Reservations — Test Document
**Module:** Member Management + Reservations  
**Member:** Member 3  
**Date Tested:** ___________  
**Status:** ___________

---

## PRE-CONDITIONS
- [x] Server running, PostgreSQL connected
- [x] NodeMailer configured in .env
- [x] At least one book exists in catalog

---

## MANUAL TEST CASES

### TC-01: Add new member
```
Step 1: Login as librarian
Step 2: Go to /members, click Add Member
Step 3: Fill all details, submit
Expected: Member created with auto-generated membershipId
Actual: Member created successfully with ID like LMS-YYYY-XXXX
Status: PASS
```

### TC-02: Suspend member
```
Step 1: Login as admin
Step 2: Go to member profile
Step 3: Click Suspend Member
Expected: Status changes to suspended
Actual: Member status successfully updated to suspended
Status: PASS
```

### TC-03: Suspended member tries to borrow
```
Step 1: Try to issue book to suspended member
Expected: Error "Member account is suspended"
Actual: Member cannot reserve/borrow, blocked correctly
Status: PASS
```

### TC-04: Reserve a book
```
Step 1: Login as member
Step 2: Find a book with 0 available copies
Step 3: Click Reserve
Expected: Reservation created, confirmation shown
Actual: Reservation created successfully for out of stock book
Status: PASS
```

### TC-05: Reserve same book twice
```
Step 1: Member who already has reservation tries to reserve same book again
Expected: Error "You already have a reservation for this book"
Actual: API correctly returns error that reservation already exists
Status: PASS
```

### TC-06: Email notification when book available
```
Step 1: Create reservation for a book
Step 2: Return that book (via borrowing module test)
Step 3: Check member email
Expected: Email received "Your reserved book is now available"
Actual: Email functionality skipped per requirements
Status: SKIPPED
```

### TC-07: Cancel reservation
```
Step 1: Login as member
Step 2: Go to /reservations
Step 3: Click Cancel on a reservation
Expected: Reservation cancelled, book queue updated
Actual: Reservation cancelled successfully and queue updated
Status: PASS
```

---

## EDGE CASES

| Edge Case | Expected | Status |
|-----------|----------|--------|
| Reserve available book | Redirect to borrow instead | PASS |
| Reservation expires after 3 days | Status changed to expired | PASS |
| Next in queue notified on expiry | Email sent to next member | SKIPPED |
| Member with fine > Rs 100 reserves | Allowed (only borrow blocked) | PASS |
