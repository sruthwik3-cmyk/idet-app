# 📥 How to See the Download Button

## ⚠️ IMPORTANT: You need to upload a file first!

The download button will **ONLY** appear if a document has a file attached. Here's how to test it:

---

## 🎯 Step-by-Step Guide

### Step 1: Add a Document with a File

1. Go to your website
2. Click **"+ Add Document"** button
3. Fill in the document details:
   - Name: "Test Passport"
   - Category: "Personal"
   - Expiry Date: (any future date)
   - Priority: "Important"

4. **Scroll down** to the section that says:
   ```
   📄 Upload Document File (Optional)
   Upload a PDF or image of your document for easy access later (Max 10MB)
   ```

5. Click the **"Choose File"** button
6. Select a PDF or image file from your computer
7. You should see a preview showing the file name and size
8. Click **"Save Document & Schedule Alerts"**
9. Wait for the upload to complete

### Step 2: Check Dashboard

1. Go to **Dashboard**
2. Find the document you just added
3. You should see:
   - A green badge that says **"📄 File Attached"**
   - A **green download icon** (🔗) next to the Edit and Delete buttons
4. Click the green download icon
5. Your file should open in a new tab!

### Step 3: Check Document Files Page

1. Look at the **left sidebar**
2. Click on **"Document Files"** (should be second item)
3. You should see your uploaded file in a gallery view
4. Click **"View"** or the download icon to access the file

---

## 🔍 Troubleshooting

### "I don't see the upload section"
- Make sure you're on the **Add Document** page
- Scroll down - it's below the Notes field
- Look for the dashed border box with "Upload Document File (Optional)"

### "I don't see the download button in Dashboard"
- Make sure you uploaded a file when adding the document
- The download button only shows for documents WITH files
- Look for the "File Attached" badge - if you don't see it, the document has no file

### "I don't see Document Files in the sidebar"
- Wait for Render deployment to complete (2-3 minutes)
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache

### "Upload button says 'Uploading...' forever"
- Check that you completed the Supabase setup:
  - Database column `file_url` added
  - Storage bucket `document-files` created (PUBLIC)
  - Storage policies added
- Check browser console for errors (F12)

### "File won't open when I click download"
- Check that the file uploaded successfully
- Try right-click → "Open in new tab"
- Check browser popup blocker settings

---

## 📸 What You Should See

### In Add Document Page:
```
┌─────────────────────────────────────────┐
│  📄 Upload Document File (Optional)     │
│  Upload a PDF or image...               │
│                                          │
│  [📤 Choose File]                       │
│  Supported: PDF, JPG, PNG, WEBP         │
└─────────────────────────────────────────┘
```

### After Selecting File:
```
┌─────────────────────────────────────────┐
│  📄 my-passport.pdf          ❌         │
│     2.45 MB                              │
└─────────────────────────────────────────┘
```

### In Dashboard:
```
┌─────────────────────────────────────────┐
│  Test Passport  📄 File Attached        │
│  Expires in 30 days • Personal          │
│                    [🔗] [✏️] [🗑️]      │
└─────────────────────────────────────────┘
         ↑ This is the download button
```

### In Document Files Page:
```
┌─────────────────────────┐
│                         │
│         📄              │
│                         │
├─────────────────────────┤
│ Test Passport           │
│ [Personal] [PDF]        │
│ [View] [📥]             │
└─────────────────────────┘
```

---

## ✅ Quick Test Checklist

- [ ] Supabase setup complete (database column + storage bucket + policies)
- [ ] Render deployment finished (check Render dashboard for "Live" status)
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Added a document WITH a file uploaded
- [ ] Can see "File Attached" badge in Dashboard
- [ ] Can see green download icon in Dashboard
- [ ] Can see "Document Files" in sidebar
- [ ] Can click download icon and file opens

---

## 🆘 Still Not Working?

1. **Check Render deployment status:**
   - Go to Render dashboard
   - Look for your service
   - Make sure it says "Live" (green)
   - Check deployment logs for errors

2. **Check Supabase setup:**
   - Database column exists: `file_url`
   - Storage bucket exists: `document-files` (PUBLIC)
   - All 4 storage policies added

3. **Hard refresh browser:**
   - Windows: Ctrl+Shift+R
   - Mac: Cmd+Shift+R
   - Or clear browser cache completely

4. **Check browser console:**
   - Press F12
   - Go to Console tab
   - Look for any red errors
   - Share the errors if you see any

---

## 📞 Need Help?

If you still can't see the download button after:
1. ✅ Completing Supabase setup
2. ✅ Waiting for deployment
3. ✅ Uploading a file with a document
4. ✅ Hard refreshing browser

Then share:
- Screenshot of Dashboard
- Screenshot of Add Document page
- Browser console errors (F12 → Console)
- Render deployment status

---

**Remember: The download button ONLY appears for documents that have files uploaded!** 📁
