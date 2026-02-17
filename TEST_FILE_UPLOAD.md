# 🧪 File Upload Feature - Testing Guide

## Pre-Testing Setup Checklist

Before testing, ensure you've completed these setup steps:

- [ ] Run `ADD_FILE_UPLOAD_COLUMN.sql` in Supabase SQL Editor
- [ ] Created `document-files` bucket in Supabase Storage (PUBLIC)
- [ ] Added all 4 storage policies (see FILE_UPLOAD_SETUP.md)
- [ ] Deployed latest code to production/local

---

## Test Scenarios

### Test 1: Upload PDF File (New Document)

**Steps:**
1. Go to "Add Document" page
2. Fill in document details:
   - Name: "Test Passport"
   - Category: "Personal"
   - Expiry Date: (any future date)
   - Priority: "Important"
3. Scroll to "Upload Document File (Optional)" section
4. Click "Choose File"
5. Select a PDF file (< 10MB)
6. Verify file preview shows:
   - File name
   - File size in MB
   - Remove button (X)
7. Click "Save Document & Schedule Alerts"
8. Wait for upload (button shows "Uploading...")
9. Verify success message

**Expected Result:**
- ✅ File uploads successfully
- ✅ Document saves with file URL
- ✅ Redirects to Dashboard
- ✅ Green download icon appears next to document

---

### Test 2: Upload Image File (New Document)

**Steps:**
1. Go to "Add Document" page
2. Fill in document details
3. Click "Choose File"
4. Select an image file (JPG, PNG, or WEBP)
5. Verify file preview
6. Save document

**Expected Result:**
- ✅ Image uploads successfully
- ✅ Download icon appears in Dashboard

---

### Test 3: File Size Validation

**Steps:**
1. Go to "Add Document" page
2. Click "Choose File"
3. Try to select a file > 10MB

**Expected Result:**
- ❌ Alert: "File size must be less than 10MB"
- ❌ File not selected

---

### Test 4: File Type Validation

**Steps:**
1. Go to "Add Document" page
2. Click "Choose File"
3. Try to select a .txt, .doc, or .zip file

**Expected Result:**
- ❌ Alert: "Only PDF and image files (JPG, PNG, WEBP) are allowed"
- ❌ File not selected

---

### Test 5: Remove File Before Saving

**Steps:**
1. Go to "Add Document" page
2. Fill in document details
3. Select a file
4. Verify file preview appears
5. Click the X (remove) button
6. Verify file preview disappears
7. Save document without file

**Expected Result:**
- ✅ File removed from preview
- ✅ Document saves without file URL
- ✅ No download icon in Dashboard

---

### Test 6: View/Download File from Dashboard

**Steps:**
1. Go to Dashboard
2. Find document with uploaded file
3. Look for green download icon (🔗)
4. Click the icon

**Expected Result:**
- ✅ File opens in new browser tab
- ✅ PDF shows in browser viewer OR image displays
- ✅ Can download from browser

---

### Test 7: Edit Document - View Existing File

**Steps:**
1. Go to Dashboard
2. Click Edit (✏️) on document with file
3. Scroll to file upload section
4. Verify "Current file uploaded" section shows
5. Click "View/Download" button

**Expected Result:**
- ✅ Shows "Current file uploaded" with green background
- ✅ View/Download button works
- ✅ File opens in new tab

---

### Test 8: Edit Document - Remove Existing File

**Steps:**
1. Edit document with file
2. In "Current file uploaded" section
3. Click X (remove) button
4. Verify section disappears
5. Save document

**Expected Result:**
- ✅ File section removed
- ✅ Document updates without file URL
- ✅ Download icon disappears from Dashboard

---

### Test 9: Edit Document - Replace File

**Steps:**
1. Edit document with file
2. Click X to remove current file
3. Click "Choose File"
4. Select a different file
5. Save document

**Expected Result:**
- ✅ Old file removed
- ✅ New file uploads
- ✅ Document updates with new file URL
- ✅ Download icon shows new file

---

### Test 10: Save Document Without File (Optional Feature)

**Steps:**
1. Go to "Add Document" page
2. Fill in document details
3. Do NOT upload any file
4. Save document

**Expected Result:**
- ✅ Document saves successfully
- ✅ No file URL in database
- ✅ No download icon in Dashboard
- ✅ Feature is truly optional

---

## Database Verification

After uploading files, verify in Supabase:

### Check Documents Table:
```sql
SELECT id, name, file_url 
FROM documents 
WHERE file_url IS NOT NULL;
```

**Expected:**
- Documents with files show file_url
- URL format: `https://[project].supabase.co/storage/v1/object/public/document-files/documents/[id]-[timestamp].[ext]`

### Check Storage Bucket:
1. Go to Supabase → Storage → document-files
2. Open "documents" folder
3. Verify files are there
4. File names: `[id]-[timestamp].[ext]`

---

## Error Scenarios to Test

### Test E1: Upload Without Internet
**Expected:** Error message, file not uploaded

### Test E2: Supabase Storage Down
**Expected:** Error message, document saves without file

### Test E3: Invalid File Extension
**Expected:** Validation error before upload

### Test E4: Corrupted File
**Expected:** Upload fails gracefully

---

## Performance Testing

### Test P1: Large File (9.9MB)
- Should upload successfully
- May take 5-10 seconds
- Button shows "Uploading..."

### Test P2: Multiple Files in Sequence
- Upload file for Document 1
- Upload file for Document 2
- Upload file for Document 3
- All should work independently

### Test P3: Concurrent Uploads
- Open 2 browser tabs
- Upload files simultaneously
- Both should succeed

---

## Mobile Testing

Test on mobile devices:

- [ ] File picker opens correctly
- [ ] File preview is readable
- [ ] Buttons are touch-friendly
- [ ] Upload works on mobile data
- [ ] Download icon is visible and clickable

---

## Browser Compatibility

Test on:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (Mac/iOS)
- [ ] Mobile browsers

---

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces labels
- [ ] Focus indicators visible
- [ ] Color contrast sufficient

---

## Regression Testing

Ensure existing features still work:

- [ ] Add document without file
- [ ] Edit document without file
- [ ] Delete document
- [ ] Search documents
- [ ] Filter documents
- [ ] Export CSV
- [ ] Import CSV
- [ ] Alerts still trigger

---

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No broken UI
- ✅ Files upload successfully
- ✅ Files download successfully
- ✅ Database updates correctly
- ✅ Feature is optional (can skip)
- ✅ Existing features unaffected

---

## Troubleshooting

### Issue: "File size must be less than 10MB" for small files
**Solution:** Check file.size calculation, ensure it's in bytes

### Issue: Upload button stuck on "Uploading..."
**Solution:** Check Supabase Storage bucket exists and is PUBLIC

### Issue: Download icon not showing
**Solution:** Verify file_url is in database and not null

### Issue: File opens as download instead of view
**Solution:** This is browser-dependent, normal behavior

### Issue: Upload fails silently
**Solution:** Check browser console for errors, verify storage policies

---

## Test Report Template

```
Date: ___________
Tester: ___________
Environment: [ ] Local [ ] Production

Test Results:
- Test 1: [ ] Pass [ ] Fail
- Test 2: [ ] Pass [ ] Fail
- Test 3: [ ] Pass [ ] Fail
- Test 4: [ ] Pass [ ] Fail
- Test 5: [ ] Pass [ ] Fail
- Test 6: [ ] Pass [ ] Fail
- Test 7: [ ] Pass [ ] Fail
- Test 8: [ ] Pass [ ] Fail
- Test 9: [ ] Pass [ ] Fail
- Test 10: [ ] Pass [ ] Fail

Issues Found:
1. ___________
2. ___________

Overall Status: [ ] All Pass [ ] Some Fail [ ] Blocked
```

---

Happy Testing! 🧪✅
