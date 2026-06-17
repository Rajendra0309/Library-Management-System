# Auth & Staff Management — Test Document
**Module:** Authentication + Staff Management  
**Member:** Member 1 (Samarth)  
**Date Tested:** 2026-06-17  
**Status:** ✅ ALL TESTS PASSING

---

## PRE-CONDITIONS
- [x] Server running on port 5000
- [x] PostgreSQL connected
- [x] .env has JWT_SECRET configured

---

## MANUAL TEST CASES

### TC-01: Member Registration
```
Step 1: Go to http://localhost:3000/register
Step 2: Fill name, email, password (min 8 chars + number + special char), phone
Step 3: Click Create Account

Expected: Redirected to login page, success message shown
Actual: ✅ Redirected to /login with "Account created successfully!" message
Status: PASS
```

### TC-02: Login with correct credentials
```
Step 1: Go to http://localhost:3000/login
Step 2: Enter registered email and password
Step 3: Click Sign in to Workspace

Expected: Redirected to dashboard, JWT stored
Actual: ✅ Redirected to /dashboard, token stored in localStorage
Status: PASS
```

### TC-03: Login with wrong password
```
Step 1: Go to http://localhost:3000/login
Step 2: Enter correct email, wrong password
Step 3: Click Login

Expected: Error message "Invalid credentials"
Actual: ✅ Error banner shows "Invalid email or password. 2 attempt(s) remaining before account lockout."
Status: PASS
```

### TC-04: Account lockout after 3 failed attempts
```
Step 1: Try wrong password 3 times in a row
Expected: "Account locked for 15 minutes" message
Actual: ✅ After 3rd failure: "Account locked for 15 minutes due to 3 failed login attempts."
Status: PASS
```

### TC-05: Access protected route without token
```
Step 1: Open Postman
Step 2: GET http://localhost:5000/api/members (no auth header)
Expected: 401 Unauthorized response
Actual: ✅ 401 { success: false, message: "Not authorized to access this route. Token missing." }
Status: PASS
```

### TC-06: Member cannot access admin route
```
Step 1: Login as member, get token
Step 2: GET http://localhost:5000/api/staff with member token
Expected: 403 Forbidden
Actual: ✅ 403 { success: false, message: "User role 'member' is not authorized to access this route." }
Status: PASS
```

### TC-07: Admin adds new staff
```
Step 1: Login as admin (role must be set to admin in DB)
Step 2: Go to /staff
Step 3: Click Add Staff, fill: name, email, password, role=librarian, department, employeeId
Step 4: Submit

Expected: Staff created, appears in list
Actual: ✅ 201 response, staff appears in /api/staff list with correct fields
Status: PASS
```

### TC-08: Membership ID auto-generation
```
Step 1: Register a new member
Step 2: Check the returned user object

Expected: membershipId format LMS-YYYY-XXXX assigned
Actual: ✅ membershipId: "LMS-2026-0001" — correctly formatted and unique
Status: PASS
```

---

## API TESTS

### POST /api/auth/register
```
Body: { "name": "Test User", "email": "test@test.com", "password": "Test@1234", "phone": "9876543210" }
Expected: 201, { success: true, data: { token, user } }
Actual: ✅ 201 — token returned, membershipId: "LMS-2026-0001", role: "member"
Status: PASS
```

### POST /api/auth/login
```
Body: { "email": "test@test.com", "password": "Test@1234" }
Expected: 200, { success: true, data: { token, user } }
Actual: ✅ 200 — JWT token returned, loginAttempts reset to 0
Status: PASS
```

### GET /api/auth/me
```
Headers: Authorization: Bearer [token]
Expected: 200, { success: true, data: { user details } }
Actual: ✅ 200 — returns full user object without password
Status: PASS
```

### POST /api/staff (admin only)
```
Headers: Authorization: Bearer [admin-token]
Body: { "name": "Jane Librarian", "email": "jane@lib.com", "password": "Jane@1234", "role": "librarian", "department": "Circulation Desk", "employeeId": "EMP-2026-001" }
Expected: 201, staff created with all fields
Actual: ✅ 201 — staff created with correct role, department, employeeId
Status: PASS
```

### DELETE /api/staff/:self-id (admin deletes own account)
```
Headers: Authorization: Bearer [admin-token]
Expected: 400 blocked
Actual: ✅ 400 { success: false, message: "You cannot delete your own admin account." }
Status: PASS
```

---

## EDGE CASES

| Edge Case | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Register with duplicate email | 409 Conflict error | `409 "An account with this email already exists."` | ✅ PASS |
| Register with weak password | 400 validation error | `400 "Password must be at least 8 characters long., Password must contain at least one special character."` | ✅ PASS |
| Login with non-existent email | 401 error | `401 "Invalid email or password."` | ✅ PASS |
| Admin deletes own account | 400 error, blocked | `400 "You cannot delete your own admin account."` | ✅ PASS |
| Empty fields on register | 400 validation errors shown | `400 "Name is required."` (per field) | ✅ PASS |
| Member accesses /api/staff | 403 Forbidden | `403 role 'member' not authorized` | ✅ PASS |
| Account locked — login attempt | 403 with minutes remaining | `403 "Account is locked...try again in X minute(s)."` | ✅ PASS |
