# Book Management & Search — Test Document
**Module:** Book Management + Search  
**Member:** Member 2  
**Date Tested:** ___________  
**Status:** ___________

---

## PRE-CONDITIONS
- [ ] Server running, MongoDB connected
- [ ] AWS S3 bucket configured in .env
- [ ] Logged in as librarian or admin

---

## MANUAL TEST CASES

### TC-01: Add a new book
```
Step 1: Login as librarian
Step 2: Go to /books/add
Step 3: Fill title, author, ISBN, genre, copies
Step 4: Upload cover image
Step 5: Submit

Expected: Book created, appears in catalog, cover shows from S3
Actual: ___________
Status: ___________
```

### TC-02: Add book with duplicate ISBN
```
Step 1: Try adding book with already existing ISBN
Expected: 409 error "ISBN already exists"
Actual: ___________
Status: ___________
```

### TC-03: Search by title (partial match)
```
Step 1: Go to /search
Step 2: Type partial book title
Expected: Matching books appear, case insensitive
Actual: ___________
Status: ___________
```

### TC-04: Filter by availability
```
Step 1: Go to /books
Step 2: Filter by "Available only"
Expected: Only books with availableCopies > 0 shown
Actual: ___________
Status: ___________
```

### TC-05: Delete book with active borrows
```
Step 1: Issue a book to a member
Step 2: Try to delete that book as admin
Expected: Error "Cannot delete book with active borrows"
Actual: ___________
Status: ___________
```

### TC-06: Available copies never go below 0
```
Step 1: Set a book's totalCopies to 1
Step 2: Issue it to a member
Step 3: Try to issue same book to another member
Expected: Error "Book not available"
Actual: ___________
Status: ___________
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
