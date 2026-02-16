-- ============================================
-- IDET App - Supabase Database Fix Commands
-- ============================================
-- Run these commands in Supabase SQL Editor if you're having issues
-- Link: https://supabase.com/dashboard/project/egnajcexpflszsgjarzt/sql/new

-- ============================================
-- 1. ADD MISSING COLUMN (if needed)
-- ============================================
-- Run this if you see error: column "user_group" does not exist
ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_group TEXT DEFAULT 'Self';

-- ============================================
-- 2. FIX ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- These policies control who can read/write documents
-- Without these, documents won't save or load!

-- First, enable RLS on the documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any) to start fresh
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can read own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

-- Create new policies that allow authenticated users to manage their documents

-- Allow INSERT (saving new documents)
CREATE POLICY "Users can insert own documents"
ON documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow SELECT (reading/viewing documents)
CREATE POLICY "Users can read own documents"
ON documents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow UPDATE (editing documents)
CREATE POLICY "Users can update own documents"
ON documents FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow DELETE (removing documents)
CREATE POLICY "Users can delete own documents"
ON documents FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 3. FIX PROFILES TABLE (if needed)
-- ============================================
-- Make sure profiles table has RLS enabled too

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. VERIFY TABLES EXIST
-- ============================================
-- Run this to check if your tables are set up correctly

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('documents', 'profiles')
ORDER BY table_name, ordinal_position;

-- ============================================
-- 5. CHECK EXISTING DOCUMENTS
-- ============================================
-- Run this to see if any documents exist in the database

SELECT 
    id,
    name,
    category,
    expiry_date,
    priority,
    user_id,
    user_group,
    alerts_json,
    created_at
FROM documents
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 6. CHECK YOUR USER ID
-- ============================================
-- Run this to see your current user ID
-- (You must be logged in to the app first)

SELECT auth.uid() as my_user_id;

-- ============================================
-- 7. DELETE TEST DOCUMENTS (if needed)
-- ============================================
-- Run this to clean up test documents
-- WARNING: This will delete ALL your documents!

-- DELETE FROM documents WHERE user_id = auth.uid();

-- Or delete specific test documents:
-- DELETE FROM documents WHERE name LIKE '%Test%' AND user_id = auth.uid();

-- ============================================
-- 8. RESET ALERT FLAGS (if needed)
-- ============================================
-- Run this if you want to re-trigger alerts for testing

UPDATE documents
SET alerts_json = jsonb_set(
    jsonb_set(
        alerts_json,
        '{emailSent30}',
        'false'
    ),
    '{emailSent7}',
    'false'
)
WHERE user_id = auth.uid();

-- ============================================
-- 9. CHECK RLS POLICIES
-- ============================================
-- Run this to see what policies are currently active

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('documents', 'profiles')
ORDER BY tablename, policyname;

-- ============================================
-- 10. GRANT PERMISSIONS (if needed)
-- ============================================
-- Run this if you're getting permission errors

GRANT ALL ON documents TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- ============================================
-- NOTES:
-- ============================================
-- 1. Run commands one at a time or in small groups
-- 2. Check for errors after each command
-- 3. If you see "already exists" errors, that's OK - skip that command
-- 4. After running these, refresh your app and try adding a document
-- 5. Check browser console (F12) for any remaining errors

-- ============================================
-- MOST COMMON FIX:
-- ============================================
-- If documents aren't saving, 90% of the time it's RLS policies.
-- Just run sections 2 and 3 above, then refresh your app.
