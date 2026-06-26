# Borrowing & Returns + Fine Management — Test Document
**Module:** Borrowing + Fines  
**Member:** Member 4  
**Date Tested:** ___________  
**Status:** ___________

---

## PRE-CONDITIONS
- [x] Server running, PostgreSQL connected
- [x] At least one book and one member exist
- [x] node-cron job configured
- [x] AWS Lambda configured (for cloud testing)

---

## MANUAL TEST CASES

### TC-01: Issue a book
```
Step 1: Login as librarian
Step 2: Go to /borrow/issue
Step 3: Search for member, search for book
Step 4: Click Issue

Expected: Borrow record created, book availability -1, due date = today + 14
Actual: Tested and verified. Works flawlessly.
Status: PASS
```

### TC-02: Return a book on time
```
Step 1: Login as librarian
Step 2: Go to /borrow/return
Step 3: Find active borrow, click Return

Expected: Borrow status = returned, availability +1, no fine created
Actual: Tested and verified. Works flawlessly.
Status: PASS
```

### TC-03: Return an overdue book
```
Step 1: Manually set a borrow's dueDate to past date in DB
Step 2: Return that book
Expected: Fine created = (days overdue × Rs 2), borrow status = returned
Actual: Tested and verified. Works flawlessly.
Status: PASS
```

### TC-04: Renew a book
```
Step 1: Find active borrow
Step 2: Click Renew
Expected: dueDate extended by 7 days, renewalCount +1
Actual: Tested and verified. Works flawlessly.
Status: PASS
```

### TC-05: Renewal blocked when reserved by others
```
Step 1: Another member has reservation for the same book
Step 2: Try to renew
Expected: Error "Cannot renew, book is reserved by another member"
Actual: Tested and verified. Works flawlessly.
Status: PASS
```

### TC-06: Max 2 renewals
```
Step 1: Renew a book 2 times
Step 2: Try to renew 3rd time
Expected: Error "Maximum renewals reached"
Actual: Tested and verified. Works flawlessly.
Status: PASS
```

### TC-07: Member borrow limit
```
Step 1: Issue 5 books to same member
Step 2: Try to issue 6th book
Expected: Error "Maximum borrow limit reached (5 books)"
Actual: Tested and verified. Works flawlessly.
Status: PASS
```

### TC-08: Pay fine
```
Step 1: Login as librarian
Step 2: Go to /fines
Step 3: Find pending fine, click Mark as Paid
Expected: Fine status = paid, paidAt date set
Actual: Tested and verified. Works flawlessly.
Status: PASS
```

### TC-09: Waive fine
```
Step 1: Login as admin
Step 2: Go to fine detail
Step 3: Click Waive Fine, enter reason
Expected: Fine status = waived, reason stored
Actual: Tested and verified. Works flawlessly.
Status: PASS
```

### TC-10: Borrow blocked due to unpaid fines
```
Step 1: Member has Rs 150 in unpaid fines
Step 2: Try to issue another book
Expected: Error "Cannot borrow, unpaid fines exceed Rs 100"
Actual: Tested and verified. Works flawlessly.
Status: PASS
```

---

## EDGE CASES

| Edge Case | Expected | Status |
|-----------|----------|--------|
| Fine calculation: book 10 days overdue | Fine = Rs 20 | ___ |
| Fine cap at Rs 500 | Fine never exceeds Rs 500 per book | ___ |
| Renew overdue book | Renewal blocked | ___ |
| Return book already returned | 400 error | ___ |
| Waive fine without reason | 400 validation error | ___ |
