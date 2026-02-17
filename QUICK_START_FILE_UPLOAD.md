# 🚀 File Upload Feature - Quick Start

## ⚡ 3-Step Setup (15 minutes)

### 1️⃣ Add Database Column
```sql
ALTER TABLE documents ADD COLUMN file_url text;
```
Run in: Supabase → SQL Editor

---

### 2️⃣ Create Storage Bucket
1. Supabase → Storage → "Create bucket"
2. Name: `document-files`
3. Make it **PUBLIC** ✅
4. Click "Create"

---

### 3️⃣ Add Storage Policies
```sql
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'document-files');

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'document-files');

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'document-files');

CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'document-files');
```
Run in: Supabase → SQL Editor

---

## ✅ That's It!

Deploy your code and the feature is live!

---

## 🧪 Quick Test

1. Add document → Upload PDF
2. Go to Dashboard
3. Click green download icon 🔗
4. File opens ✅

---

## 📚 Full Documentation

- `FILE_UPLOAD_SETUP.md` - Detailed setup
- `FILE_UPLOAD_FEATURE_COMPLETE.md` - Complete docs
- `TEST_FILE_UPLOAD.md` - Testing guide
- `FILE_UPLOAD_READY.md` - Deployment guide

---

## 🆘 Troubleshooting

**Upload fails?**
→ Check bucket exists and is PUBLIC

**No download icon?**
→ Check database column exists

**File won't open?**
→ Check storage policies are set

---

## 💡 Key Features

- ✅ Optional (users choose)
- ✅ PDF & images (max 10MB)
- ✅ View/Download from Dashboard
- ✅ Edit mode support
- ✅ Beautiful UI

---

**Ready to go! 🎉**
