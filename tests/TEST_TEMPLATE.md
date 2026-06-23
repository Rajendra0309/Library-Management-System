# Feature Test Document
## [FEATURE NAME] — LMS

**Module:** [Module name]  
**Member:** [Member who built it]  
**Date Tested:** [DD/MM/YYYY]  
**Status:** [PASS / FAIL / PARTIAL]

---

## 1. FEATURE DESCRIPTION

[Brief description of what this feature does]

---

## 2. PRE-CONDITIONS

Before testing this feature, make sure:
- [x] Server is running on port 5000
- [x] Client is running on port 3000
- [x] PostgreSQL is connected
- [x] .env file is configured
- [x] [Any other specific pre-condition]

---

## 3. MANUAL TESTING STEPS

### Test Case 1: [Test case name]
```
Step 1: [What to do]
Step 2: [What to do]
Step 3: [What to do]

Expected Result: [What should happen]
Actual Result:   [What actually happened]
Status:          PASS / FAIL
```

### Test Case 2: [Test case name]
```
Step 1: [What to do]
Step 2: [What to do]

Expected Result: [What should happen]
Actual Result:   [What actually happened]
Status:          PASS / FAIL
```

---

## 4. API TESTING (Postman)

### Endpoint: [METHOD] [/api/route]
```
URL:     http://localhost:5000/api/[route]
Method:  [GET/POST/PUT/DELETE]
Headers: Authorization: Bearer [token]

Request Body:
{
  "field": "value"
}

Expected Response:
{
  "success": true,
  "message": "...",
  "data": { ... }
}

Actual Response: [paste actual]
Status: PASS / FAIL
```

---

## 5. EDGE CASE TESTING

| Edge Case | Steps | Expected | Actual | Status |
|-----------|-------|----------|--------|--------|
| [Case 1] | [Steps] | [Expected] | [Actual] | PASS/FAIL |
| [Case 2] | [Steps] | [Expected] | [Actual] | PASS/FAIL |

---

## 6. UI TESTING

| Test | Description | Status |
|------|-------------|--------|
| Page loads without error | Open page, no console errors | PASS/FAIL |
| Loading state shows | Slow network, spinner appears | PASS/FAIL |
| Error message shows | Submit invalid data, error shown | PASS/FAIL |
| Mobile responsive | Check on 375px width | PASS/FAIL |
| Role access | Wrong role cannot access page | PASS/FAIL |

---

## 7. BUGS FOUND

| Bug | Steps to Reproduce | Severity | Fixed? |
|-----|--------------------|----------|--------|
| [Bug description] | [Steps] | High/Medium/Low | Yes/No |

---

## 8. SIGN OFF

- [x] All manual tests passed
- [x] All API tests passed
- [x] All edge cases handled
- [x] No console errors
- [x] Code pushed to feature branch
- [x] PR raised
- [x] README.md updated

**Tested by:** [Name]  
**Reviewed by:** [Team Lead]
