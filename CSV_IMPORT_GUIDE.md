# CSV Import Feature - User Guide

## Overview

The CSV Import feature allows you to add multiple documents at once by uploading a CSV file, saving you time and effort.

---

## How to Use

### Step 1: Prepare Your CSV File

Create a CSV file with the following columns (in this exact order):

```
Name,Category,Expiry Date,Priority,Notes
```

### Step 2: Fill in Your Data

**Example:**
```csv
Name,Category,Expiry Date,Priority,Notes
Passport,Personal,2026-12-31,Critical,Renewal needed
Driver License,Personal,2027-06-15,Important,
Health Insurance,Medical,2026-08-20,Critical,Policy #12345
```

### Step 3: Import to IDET

1. Go to Dashboard
2. Click "Import CSV" button (next to Export button)
3. Select your CSV file
4. Wait for processing
5. Review import results

---

## CSV Format Requirements

### Required Columns

| Column | Description | Example | Required |
|--------|-------------|---------|----------|
| **Name** | Document name | "Passport" | ✅ Yes |
| **Category** | Document type | "Personal" | ✅ Yes |
| **Expiry Date** | Date in YYYY-MM-DD format | "2026-12-31" | ✅ Yes |
| **Priority** | Critical, Important, or Optional | "Critical" | ✅ Yes |
| **Notes** | Additional information | "Renewal needed" | ❌ No |

### Valid Values

#### Category
- Personal
- Financial
- Medical
- Legal
- Education
- Vehicle
- Or any custom category name

#### Priority
- Critical
- Important
- Optional

#### Expiry Date Format
- Must be: YYYY-MM-DD
- Example: 2026-12-31
- ❌ Wrong: 31/12/2026, 12-31-2026, 2026/12/31

---

## Sample CSV Template

Download or copy this template:

```csv
Name,Category,Expiry Date,Priority,Notes
Passport,Personal,2026-12-31,Critical,Renewal needed before travel
Driver License,Personal,2027-06-15,Important,
Health Insurance Policy,Medical,2026-08-20,Critical,Policy #12345
Car Insurance,Vehicle,2026-11-30,Important,Annual renewal
PAN Card,Financial,2030-01-01,Optional,Permanent document
Aadhaar Card,Personal,2099-12-31,Critical,No expiry but keep updated
Credit Card,Financial,2027-03-31,Important,VISA ending 1234
Gym Membership,Personal,2026-05-15,Optional,Monthly auto-renewal
```

**File location:** `public/sample-import-template.csv`

---

## Import Process

### What Happens During Import

1. **File Validation**
   - Checks if file is CSV format
   - Verifies required columns exist
   - Validates file is not empty

2. **Row Processing**
   - Each row is validated individually
   - Invalid rows are skipped with error message
   - Valid rows are imported to database

3. **Alert Triggering**
   - Documents within 30 days trigger alerts
   - Sound and email notifications sent automatically

4. **Results Display**
   - Shows number of successful imports
   - Lists any errors encountered
   - Provides detailed error messages

---

## Common Errors & Solutions

### Error: "Missing required columns"

**Problem:** CSV doesn't have all required columns

**Solution:** Make sure your CSV has these exact column names:
```
Name,Category,Expiry Date,Priority,Notes
```

### Error: "Invalid date format"

**Problem:** Date is not in YYYY-MM-DD format

**Examples:**
- ❌ Wrong: 31/12/2026
- ❌ Wrong: 12-31-2026
- ❌ Wrong: December 31, 2026
- ✅ Correct: 2026-12-31

**Solution:** Convert all dates to YYYY-MM-DD format

### Error: "Invalid priority"

**Problem:** Priority value is not recognized

**Valid values:**
- Critical
- Important
- Optional

**Solution:** Use only these three values (case-sensitive)

### Error: "Missing required fields"

**Problem:** One or more required fields are empty

**Solution:** Fill in all required columns (Name, Category, Expiry Date, Priority)

---

## Tips for Successful Import

### 1. Use Excel or Google Sheets

1. Create your data in Excel/Sheets
2. File > Save As > CSV (Comma delimited)
3. Upload to IDET

### 2. Test with Small File First

- Start with 5-10 documents
- Verify import works correctly
- Then import larger files

### 3. Keep Backup

- Save original CSV file
- Keep copy before importing
- Easy to re-import if needed

### 4. Check Date Format

- Use Excel formula: `=TEXT(A1,"YYYY-MM-DD")`
- Or manually format: 2026-12-31

### 5. Avoid Special Characters

- Use simple text in Notes field
- Avoid: quotes, commas, line breaks
- Or wrap in quotes: "Notes with, comma"

---

## Import Limits

- **File Size:** Up to 5MB
- **Number of Rows:** Unlimited (but recommended < 1000 for performance)
- **Processing Time:** ~1 second per 10 documents

---

## After Import

### What to Check

1. **Dashboard Stats**
   - Verify "Total Documents" increased
   - Check "Expiring Soon" count

2. **Document List**
   - Scroll through imported documents
   - Verify data is correct

3. **Alerts**
   - Check if alerts triggered for documents within 30 days
   - Look for email notifications
   - Listen for sound alerts

### If Something Went Wrong

1. **Review Error Messages**
   - Import results modal shows all errors
   - Fix issues in CSV file
   - Re-import corrected file

2. **Delete and Re-import**
   - Delete incorrectly imported documents
   - Fix CSV file
   - Import again

---

## Advanced Usage

### Bulk Update

1. Export existing documents to CSV
2. Edit in Excel/Sheets
3. Delete old documents
4. Import updated CSV

### Migration from Other Systems

1. Export data from old system
2. Convert to IDET CSV format
3. Import to IDET
4. Verify all data transferred

### Team Collaboration

1. Share CSV template with team
2. Each person fills their documents
3. Combine all CSVs
4. Import master file

---

## Troubleshooting

### Import Button Disabled

**Cause:** Import already in progress

**Solution:** Wait for current import to finish

### No Results Shown

**Cause:** All rows had errors

**Solution:** Check error messages and fix CSV file

### Partial Import

**Cause:** Some rows valid, some invalid

**Solution:** Review error list, fix invalid rows, re-import

### Duplicate Documents

**Cause:** Imported same file twice

**Solution:** Delete duplicates manually or export, clean, re-import

---

## FAQ

**Q: Can I import documents for different users?**
A: No, imports are for your account only

**Q: What happens to existing documents?**
A: They remain unchanged. Import only adds new documents.

**Q: Can I update existing documents via CSV?**
A: No, import only creates new documents. Delete old ones first.

**Q: Is there a limit on file size?**
A: Recommended under 5MB (approximately 10,000 documents)

**Q: Can I import from Excel directly?**
A: No, save as CSV first, then import

**Q: What if I have custom categories?**
A: Any category name is accepted, not just predefined ones

**Q: Will alerts trigger immediately?**
A: Yes, for documents expiring within 30 days

**Q: Can I undo an import?**
A: No automatic undo. Delete documents manually if needed.

---

## Example Use Cases

### 1. New User Setup

Import all your documents at once instead of adding one by one:

```csv
Name,Category,Expiry Date,Priority,Notes
Passport,Personal,2028-05-20,Critical,
Driver License,Personal,2027-11-15,Important,
Health Insurance,Medical,2026-12-31,Critical,
Car Insurance,Vehicle,2026-06-30,Important,
```

### 2. Annual Review

Export all documents, review dates, update, re-import:

1. Click "Export" button
2. Open CSV in Excel
3. Update expiry dates
4. Delete old documents
5. Import updated CSV

### 3. Family Documents

Create CSV with all family member documents:

```csv
Name,Category,Expiry Date,Priority,Notes
Dad's Passport,Personal,2027-03-15,Critical,
Mom's Passport,Personal,2026-08-20,Critical,
Son's School ID,Education,2026-06-30,Important,
Daughter's Aadhaar,Personal,2099-12-31,Critical,
```

---

## Best Practices

1. ✅ Always keep a backup of your CSV file
2. ✅ Test with small file first
3. ✅ Use consistent date format (YYYY-MM-DD)
4. ✅ Review import results carefully
5. ✅ Export regularly for backup
6. ❌ Don't import duplicate data
7. ❌ Don't use special characters in names
8. ❌ Don't skip required fields

---

## Support

If you encounter issues:

1. Check error messages in import results
2. Verify CSV format matches template
3. Try sample template first
4. Review this guide
5. Check browser console (F12) for technical errors

---

**Last Updated:** February 16, 2026
**Feature Version:** 1.0.0
**Status:** Production Ready ✅
