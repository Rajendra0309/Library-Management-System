# Book Management & Search — Test Document
**Module:** Book Management + Search  
**Member:** Member 2  
**Date Tested:** ___________  
**Status:** ___________

---

## PRE-CONDITIONS
- [x] Server running, PostgreSQL connected
- [x] AWS S3 bucket configured in .env
- [x] Logged in as librarian or admin

---

## MANUAL TEST CASES

### TC-01: Add a new book (Physical)
```
Step 1: Login as librarian
Step 2: Go to /books/add
Step 3: Fill form (Title, author, ISBN, genre, total copies)
Step 4: Submit

Expected: Book created, appears in catalog
Actual: Book successfully created with 201 Created and appears in DB catalog queries.
Status: PASS
```

### TC-02: Duplicate ISBN
```
Step 1: Add new book with ISBN that already exists
Expected: Error "Book with this ISBN already exists"
Actual: 409 Conflict returned successfully.
Status: PASS
```

### TC-03: Search & Filter Books
```
Step 1: Login as Member
Step 2: Go to /books
Step 3: Type keyword in search bar
Expected: Books matching title/author appear
Actual: 200 OK returned with filtered titles.
Status: PASS
```

### TC-04: Filter by Availability
```
Step 1: Toggle "Available Only" on catalog
Expected: Only books with availableCopies > 0 appear
Actual: 200 OK returned successfully with correct copies > 0 logic applied.
Status: PASS
```

### TC-05: Delete book with active borrows
```
Step 1: Login as Admin
Step 2: Try to delete a book currently issued to a member
Expected: Error "Cannot delete book with active borrows"
Actual: 400 Bad Request returned with precise error message.
Status: PASS
```

### TC-06: Available Copies Logic
```
Step 1: Note available copies (e.g. 2)
Step 2: Issue book -> verify available becomes 1
Step 3: Return book -> verify available becomes 2
Expected: Math works perfectly, never goes below 0.
Actual: Logic verified in API execution tests (Issue: -1, Return: +1) precisely.
Status: PASS
```

### TC-07: E-book upload and access
```
Step 1: Upload PDF as e-book for a book
Step 2: Login as member
Step 3: Open book detail, click Read E-book
Expected: PDF opens in browser via pre-signed S3 URL
Actual: ___________
Status: ___________
```

---

## EDGE CASES

| Edge Case | Expected | Status |
|-----------|----------|--------|
| Upload wrong file type as cover | Error, only jpg/png allowed | ___ |
| Upload PDF larger than 50MB | Error, file too large | ___ |
| Search with empty query | Return all books | ___ |
| ISBN invalid format | 400 validation error | ___ |
| Member tries to delete book | 403 Forbidden | ___ |
