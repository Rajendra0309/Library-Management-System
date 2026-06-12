# Auth & Staff Management — Test Document
**Module:** Authentication + Staff Management  
**Member:** Member 1  
**Date Tested:** ___________  
**Status:** ___________

---

## PRE-CONDITIONS
- [ ] Server running on port 5000
- [ ] MongoDB connected
- [ ] .env has JWT_SECRET configured

---

## MANUAL TEST CASES

### TC-01: Member Registration
```
Step 1: Go to http://localhost:3000/register
Step 2: Fill name, email, password (min 8 chars), phone
Step 3: Click Register

Expected: Redirected to login page, success message shown
Actual: ___________
Status: ___________
```

### TC-02: Login with correct credentials
```
Step 1: Go to http://localhost:3000/login
Step 2: Enter registered email and password
Step 3: Click Login

Expected: Redirected to dashboard, JWT stored
Actual: ___________
Status: ___________
```

### TC-03: Login with wrong password
```
Step 1: Go to http://localhost:3000/login
Step 2: Enter correct email, wrong password
Step 3: Click Login

Expected: Error message "Invalid credentials"
Actual: ___________
Status: ___________
```

### TC-04: Account lockout after 3 failed attempts
```
Step 1: Try wrong password 3 times in a row
Expected: "Account locked for 15 minutes" message
Actual: ___________
Status: ___________
```

### TC-05: Access protected route without token
```
Step 1: Open Postman
Step 2: GET http://localhost:5000/api/members (no auth header)
Expected: 401 Unauthorized response
Actual: ___________
Status: ___________
```

### TC-06: Member cannot access admin route
```
Step 1: Login as member, get token
Step 2: GET http://localhost:5000/api/staff with member token
Expected: 403 Forbidden
Actual: ___________
Status: ___________
```

### TC-07: Admin adds new staff
```
Step 1: Login as admin
Step 2: Go to /admin/staff
Step 3: Click Add Staff, fill details
Step 4: Submit

Expected: Staff created, appears in list
Actual: ___________
Status: ___________
```

### TC-08: Membership ID auto-generation
```
Step 1: Register a new member
Step 2: Login as librarian, view member profile

Expected: membershipId format LMS-YYYY-XXXX assigned
Actual: ___________
Status: ___________
```

---

## API TESTS

### POST /api/auth/register
```
Body: { "name": "Test User", "email": "test@test.com", "password": "Test@1234", "phone": "9876543210" }
Expected: 201, { success: true, data: { token, user } }
Status: ___________
```

### POST /api/auth/login
```
Body: { "email": "test@test.com", "password": "Test@1234" }
Expected: 200, { success: true, data: { token, user } }
Status: ___________
```

### GET /api/auth/me
```
Headers: Authorization: Bearer [token]
Expected: 200, { success: true, data: { user details } }
Status: ___________
```

---

## EDGE CASES

| Edge Case | Expected | Status |
|-----------|----------|--------|
| Register with duplicate email | 409 Conflict error | ___ |
| Register with weak password | 400 validation error | ___ |
| Login with non-existent email | 401 error | ___ |
| Admin deletes own account | 400 error, blocked | ___ |
| Empty fields on register | 400 validation errors shown | ___ |
