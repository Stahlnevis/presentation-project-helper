# SafeGuard Platform - Testing Guide

## Overview

This guide provides comprehensive testing scenarios, sample data, and validation steps for all features of the SafeGuard GBV Protection Platform.

---

## Table of Contents
1. [Authentication Testing](#authentication-testing)
2. [Evidence Vault Testing](#evidence-vault-testing)
3. [Threat Intelligence Testing](#threat-intelligence-testing)
4. [Geolocation Tracking Testing](#geolocation-tracking-testing)
5. [Security Testing](#security-testing)
6. [Performance Testing](#performance-testing)
7. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## Authentication Testing

### Test Case 1.1: Successful Sign Up
**Steps**:
1. Navigate to `/auth`
2. Click "Sign Up" tab
3. Enter:
   - Email: `testuser@example.com`
   - Password: `SecurePass123!`
4. Click "Create Account"

**Expected**:
- ✅ Success toast appears
- ✅ Redirected to `/dashboard`
- ✅ User session stored in localStorage
- ✅ Email auto-confirmed (no verification email needed)

### Test Case 1.2: Login with Existing User
**Steps**:
1. Use credentials from Test 1.1
2. Click "Sign In" tab
3. Enter email and password
4. Click "Sign In"

**Expected**:
- ✅ Success toast: "Welcome back!"
- ✅ Redirected to `/dashboard`

### Test Case 1.3: Invalid Credentials
**Steps**:
1. Enter: `wrong@example.com` / `wrongpass`
2. Click "Sign In"

**Expected**:
- ❌ Error toast: "Invalid credentials"
- ❌ No redirection

### Test Case 1.4: Protected Route Access
**Steps**:
1. Log out
2. Manually navigate to `/dashboard`

**Expected**:
- ✅ Redirected to `/auth`
- ✅ Toast: "Please sign in to continue"

---

## Evidence Vault Testing

### Test Case 2.1: Upload Screenshot Evidence
**Sample Data**:
- **Title**: "Instagram Harassment Screenshot"
- **Type**: Screenshot
- **Description**: "Threatening DM received on 2025-01-28 saying 'I'll find you'"
- **File**: Create a test image (PNG, < 50MB)

**Steps**:
1. Login and navigate to Evidence Vault
2. Fill form with sample data
3. Upload a screenshot file
4. Click "Upload & Hash Evidence"

**Expected**:
- ✅ Success toast with SHA-256 hash preview
- ✅ Evidence appears in "Your Evidence" list
- ✅ Hash displayed (64 characters)
- ✅ Status: "verified"
- ✅ Timestamp captured
- ✅ File size shown

**Validation**:
```sql
-- Check database record
SELECT * FROM evidence_items WHERE user_id = '<your_user_id>';

-- Verify hash format (should be 64 hex characters)
SELECT LENGTH(file_hash) FROM evidence_items WHERE title = 'Instagram Harassment Screenshot';
-- Expected: 64
```

### Test Case 2.2: Upload Video Evidence
**Sample Data**:
- **Title**: "Video Recording of Stalking Incident"
- **Type**: Video
- **Description**: "15-second clip showing individual following me repeatedly"
- **File**: Any .mp4 or .mov (< 50MB)

**Steps**:
1. Fill form and upload video
2. Submit

**Expected**:
- ✅ Video accepted
- ✅ Hash generated
- ✅ File URL points to Supabase Storage

### Test Case 2.3: File Size Validation
**Steps**:
1. Attempt to upload file > 50MB

**Expected**:
- ❌ Client-side error: "File size must be less than 50MB"
- ❌ Form submission blocked

### Test Case 2.4: Required Field Validation
**Steps**:
1. Leave "Title" blank
2. Try to submit

**Expected**:
- ❌ Browser validation: "Please fill out this field"

### Test Case 2.5: Multiple Evidence Upload
**Steps**:
1. Upload 5 different pieces of evidence
2. Check "Your Evidence" list

**Expected**:
- ✅ All 5 appear in chronological order (newest first)
- ✅ Each has unique hash
- ✅ Total count shows (5)

---

## Threat Intelligence Testing

### Test Case 3.1: Basic Incident Report
**Sample Data**:
```
Platform: Instagram
Harasser Username: @fake_harasser_test
Profile URL: https://instagram.com/fake_harasser_test
Incident Date: [Today's date and time]
Description: "User sent explicit threats via DM: 'I know where you live. 
Watch your back.' This is the third time this week. Previously on 
Facebook and Twitter with similar messages. Escalating behavior."
```

**Steps**:
1. Navigate to Threat Intelligence
2. Fill form with sample data
3. Click "Analyze Threat"

**Expected**:
- ✅ AI analysis completes in 2-5 seconds
- ✅ Toast shows severity (e.g., "Incident analyzed! Severity: HIGH")
- ✅ Incident appears in "Your Reports"
- ✅ Severity badge color-coded (red for HIGH)
- ✅ Risk score displayed (e.g., 78/100)

**AI Response Validation**:
```json
{
  "severityLevel": "high",
  "riskScore": 75-85,
  "patterns": ["explicit threats", "stalking behavior", "cross-platform harassment"]
}
```

### Test Case 3.2: Critical Severity Incident
**Sample Data**:
```
Platform: WhatsApp
Description: "Received death threats. Messages include photos of my home 
with weapon emojis. Sender has my address and phone number. Threats to 
harm family members. Law enforcement contacted but need documentation."
Incident Date: [Recent date]
```

**Expected**:
- ✅ Severity: **CRITICAL** (red badge)
- ✅ Risk Score: 85-100
- ✅ Toast may include: "⚠️ HIGH RISK - Consider contacting authorities"

### Test Case 3.3: Repeat Offender Detection
**Steps**:
1. Submit incident with username: `@serial_harasser_123` on Instagram
2. Wait for analysis
3. Submit **another** incident with same username on Facebook
4. Check second incident

**Expected**:
- ✅ Second incident toast: "⚠️ REPEAT OFFENDER DETECTED"
- ✅ Both incidents show "Linked to repeat offender"
- ✅ `incident_count` in `linked_attackers` table = 2

**Database Check**:
```sql
SELECT * FROM linked_attackers 
WHERE attacker_fingerprint = SHA256('instagram:@serial_harasser_123');

-- Should show:
-- incident_count: 2
-- platforms: ["instagram", "facebook"]
```

### Test Case 3.4: Low Severity Incident
**Sample Data**:
```
Platform: TikTok
Description: "User left mildly rude comment on my video. Not threatening, 
just annoying. Wanted to document in case it escalates."
```

**Expected**:
- ✅ Severity: **LOW** (blue badge)
- ✅ Risk Score: 10-30

### Test Case 3.5: Multiple Platform Incidents
**Steps**:
1. Report incidents on 3 different platforms (Instagram, Twitter, Facebook)
2. Use same harasser username
3. Check all reports

**Expected**:
- ✅ All 3 linked to same `linked_attacker_id`
- ✅ Attacker profile shows all 3 platforms

---

## Geolocation Tracking Testing

### Test Case 4.1: Create Basic Tracking Link
**Sample Data**:
```
Title: "Evidence Document Link"
Description: "Sending to harasser to capture location data"
Redirect URL: [leave empty]
```

**Steps**:
1. Navigate to Geo Tracking
2. Fill form
3. Click "Generate Tracking Link"

**Expected**:
- ✅ Success toast
- ✅ Link appears in "Your Tracking Links"
- ✅ Link format: `https://{project-id}.supabase.co/functions/v1/capture-geo?code={12-char-code}`
- ✅ Copy button works

### Test Case 4.2: Test Link Capture (Manual)
**Steps**:
1. Copy tracking link from Test 4.1
2. Open link in **new incognito window** (or different device)
3. Access the link

**Expected (in incognito window)**:
- ✅ Page shows: "Link has been accessed successfully."

**Expected (in your dashboard)**:
- ✅ Capture count increments to 1
- ✅ Click "View" to see captured data:
  - IP address (e.g., `203.0.113.45`)
  - City, Region, Country
  - Browser (e.g., "Chrome")
  - OS (e.g., "Windows")
  - Device Type (e.g., "Desktop")
  - Browser fingerprint (64-char hash)

### Test Case 4.3: Tracking Link with Redirect
**Sample Data**:
```
Title: "Fake Document Link"
Redirect URL: "https://www.google.com"
```

**Steps**:
1. Create link with redirect URL
2. Open in incognito
3. Verify behavior

**Expected**:
- ✅ Data captured
- ✅ User **redirected** to Google seamlessly
- ✅ No "link accessed" message shown

### Test Case 4.4: Multiple Captures
**Steps**:
1. Access same tracking link 3 times from:
   - Desktop browser
   - Mobile device
   - Tablet (or different browser)

**Expected**:
- ✅ Capture count = 3
- ✅ All 3 captures visible in "Captured Data"
- ✅ Different device types shown
- ✅ Different browser fingerprints

### Test Case 4.5: Geolocation API Failure
**Steps**:
1. Create tracking link
2. Access from environment where `ipapi.co` is blocked (e.g., VPN)

**Expected**:
- ✅ Capture still created
- ✅ IP address recorded
- ❌ Geolocation shows: `{ error: "Unable to fetch geolocation" }`
- ✅ Device info still captured

**Database Check**:
```sql
SELECT geolocation FROM geo_captures WHERE ip_address = '<your_ip>';
-- Should show error object if API failed
```

---

## Security Testing

### Test Case 5.1: Row-Level Security (RLS)
**Steps**:
1. Login as User A, upload evidence
2. Logout, login as User B
3. Try to access User A's data

**Expected**:
- ❌ User B cannot see User A's evidence
- ❌ User B cannot see User A's incidents
- ❌ User B cannot see User A's tracking links

**Database Check** (using Supabase SQL Editor):
```sql
-- As User B, try to read User A's evidence
SELECT * FROM evidence_items WHERE user_id = '<user_a_id>';
-- Should return 0 rows due to RLS
```

### Test Case 5.2: File Access Control
**Steps**:
1. Login as User A, upload evidence file
2. Copy file URL from network tab
3. Logout, try to access URL directly

**Expected**:
- ❌ Access denied (401 Unauthorized)
- ❌ File not viewable

### Test Case 5.3: SQL Injection Prevention
**Steps**:
1. In Evidence Title field, enter: `'; DROP TABLE evidence_items; --`
2. Submit

**Expected**:
- ✅ Treated as normal string
- ✅ Title saved as-is in database
- ✅ No SQL execution

### Test Case 5.4: XSS Prevention
**Steps**:
1. In Evidence Description, enter: `<script>alert('XSS')</script>`
2. Submit and view in list

**Expected**:
- ✅ Script tags rendered as text (not executed)
- ✅ No alert popup

### Test Case 5.5: Public Endpoint Security
**Steps**:
1. Try to access `/functions/v1/upload-evidence` without auth token

**Expected**:
- ❌ 401 Unauthorized
- ❌ No file upload

**Test**:
```bash
curl -X POST https://{project-id}.supabase.co/functions/v1/upload-evidence \
  -H "Content-Type: application/json" \
  -d '{"title": "test"}'

# Expected: {"error": "Unauthorized"}
```

---

## Performance Testing

### Test Case 6.1: Page Load Time
**Steps**:
1. Open Chrome DevTools > Network tab
2. Navigate to `/dashboard`
3. Check waterfall

**Expected**:
- ✅ DOMContentLoaded: < 1.5s
- ✅ Load: < 3s
- ✅ First Contentful Paint (FCP): < 1s

### Test Case 6.2: Edge Function Latency
**Steps**:
1. Submit threat incident
2. Measure time between click and response

**Expected**:
- ✅ AI analysis completes in 2-5 seconds
- ✅ Cold start (first call): < 500ms
- ✅ Warm calls: < 100ms

### Test Case 6.3: Large File Upload
**Steps**:
1. Upload 45MB video file

**Expected**:
- ✅ Upload completes without timeout
- ✅ Progress indicator (if implemented)
- ✅ Hash generation: < 3s

---

## Edge Cases & Error Handling

### Test Case 7.1: Network Disconnection
**Steps**:
1. Fill evidence form
2. Disconnect internet
3. Click "Upload"

**Expected**:
- ❌ Error toast: "Network error. Please check your connection."
- ✅ Form data preserved (not cleared)

### Test Case 7.2: Concurrent Uploads
**Steps**:
1. Open 3 browser tabs
2. Upload evidence simultaneously in all 3

**Expected**:
- ✅ All 3 uploads succeed
- ✅ All have unique hashes
- ✅ No race conditions

### Test Case 7.3: Expired Session
**Steps**:
1. Login
2. Wait for JWT to expire (or manually delete from localStorage)
3. Try to upload evidence

**Expected**:
- ❌ Error toast: "Session expired. Please login again."
- ✅ Redirected to `/auth`

### Test Case 7.4: Invalid File Type
**Steps**:
1. Try to upload `.exe` file

**Expected**:
- ❌ Client-side validation: "Invalid file type"
- ❌ Upload blocked

### Test Case 7.5: Empty Database
**Steps**:
1. New user with no data
2. Navigate to Evidence Vault

**Expected**:
- ✅ Message: "No evidence uploaded yet. Start by uploading..."
- ✅ No errors in console

---

## Automated Testing Setup (Future)

### Unit Tests (Jest + React Testing Library)
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

**Example Test**:
```typescript
// src/components/__tests__/EvidenceVault.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import EvidenceVault from '@/pages/EvidenceVault';

test('renders upload form', () => {
  render(<EvidenceVault />);
  expect(screen.getByLabelText(/Evidence Title/i)).toBeInTheDocument();
});
```

### Integration Tests (Playwright)
```bash
npm install --save-dev @playwright/test
```

**Example Test**:
```typescript
// tests/e2e/evidence-upload.spec.ts
import { test, expect } from '@playwright/test';

test('upload evidence end-to-end', async ({ page }) => {
  await page.goto('/auth');
  // Login flow...
  await page.goto('/evidence-vault');
  await page.fill('#title', 'Test Evidence');
  await page.selectOption('#type', 'screenshot');
  await page.setInputFiles('#file', 'test-screenshot.png');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.toast')).toContainText('Evidence uploaded');
});
```

---

## Sample Test Dataset

### Users
```
User 1: test1@example.com / SecurePass123!
User 2: test2@example.com / SecurePass456!
User 3: victim@example.com / TestUser789!
```

### Evidence Files
```
evidence_samples/
├── screenshot1.png (Fake Instagram DM screenshot)
├── screenshot2.png (Fake Twitter harassment)
├── video1.mp4 (5-second test clip)
├── chat_log.txt (Fake threatening chat log)
└── document.pdf (Fake police report template)
```

### Threat Reports
```csv
Platform,Username,Description,Expected Severity
Instagram,@harasser1,Explicit death threats,CRITICAL
Facebook,@harasser1,Continued threats from Instagram,HIGH
Twitter,@troll123,Mild insults,LOW
WhatsApp,Unknown,Stalking behavior with address,CRITICAL
TikTok,@commenter,Annoying but non-threatening,LOW
```

---

## Testing Checklist

Before deployment, ensure:

- [ ] All authentication flows work (signup, login, logout)
- [ ] Evidence uploads work for all file types
- [ ] SHA-256 hashes are generated correctly
- [ ] AI threat analysis returns valid results
- [ ] Geolocation captures work (IP, location, device)
- [ ] RLS policies prevent unauthorized access
- [ ] Error messages are user-friendly
- [ ] Loading states display correctly
- [ ] Mobile responsiveness works
- [ ] Edge functions return proper CORS headers
- [ ] File size limits enforced
- [ ] Input validation works client and server-side
- [ ] Session expiration handled gracefully
- [ ] No console errors on any page
- [ ] Database migrations applied successfully

---

## Reporting Issues

When reporting bugs, include:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Screenshots** (if applicable)
5. **Browser & OS**
6. **Console errors** (from DevTools)

---

**Last Updated**: 2025-11-28  
**Version**: 1.0.0