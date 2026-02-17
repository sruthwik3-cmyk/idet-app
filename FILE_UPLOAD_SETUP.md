# 📁 File Upload Feature Setup Guide

## Overview
Users can now optionally upload PDF or image files when adding documents. This feature allows them to store and access their document files directly in the app.

## ✅ What's Already Done
- ✅ UI added to Add Document page with file upload button
- ✅ File validation (max 10MB, PDF/images only)
- ✅ File preview when selected
- ✅ Upload logic implemented
- ✅ View/Download button in Dashboard
- ✅ Edit mode support (can replace existing files)

## 🔧 Setup Required (Do These Steps)

### Step 1: Add Database Column
Run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE documents 
ADD COLUMN file_url text;
```

Or simply run the `ADD_FILE_UPLOAD_COLUMN.sql` file in Supabase.

### Step 2: Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Bucket name: `document-files`
4. Make it **PUBLIC** (so users can download their files)
5. Click "Create bucket"

### Step 3: Set Storage Policies
After creating the bucket, add these policies:

**Policy 1: Allow users to upload their own files**
```sql
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'document-files');
```

**Policy 2: Allow users to view their own files**
```sql
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'document-files');
```

**Policy 3: Allow users to delete their own files**
```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'document-files');
```

**Policy 4: Allow public access to files (for download)**
```sql
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'document-files');
```

## 📝 How It Works

### For Users:
1. When adding a document, they see an optional "Upload Document File" section
2. They can click "Choose File" to select a PDF or image (max 10MB)
3. File preview shows with name and size
4. On save, file uploads to Supabase Storage
5. In Dashboard, documents with files show a green download icon
6. Click the icon to view/download the file

### Supported File Types:
- PDF (.pdf)
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### File Size Limit:
- Maximum 10MB per file

## 🎨 UI Features
- Optional feature - users choose whether to upload or not
- Beautiful file preview with size display
- Remove file button before saving
- View/Download button in Dashboard (green icon)
- Replace file option in Edit mode
- Smooth animations and hover effects

## 🔒 Security
- Files are stored in Supabase Storage (secure and scalable)
- Only authenticated users can upload
- File type validation (only PDF and images)
- File size validation (max 10MB)
- Public URLs for easy download

## 🚀 Testing
1. Add a new document
2. Scroll to "Upload Document File (Optional)" section
3. Click "Choose File" and select a PDF or image
4. See the file preview
5. Save the document
6. Go to Dashboard
7. See the green download icon next to the document
8. Click it to view/download the file

## 📌 Notes
- This is an OPTIONAL feature - users can skip it
- Files are stored permanently until document is deleted
- When a document is deleted, the file should also be deleted (future enhancement)
- File URLs are stored in the `file_url` column in the database
