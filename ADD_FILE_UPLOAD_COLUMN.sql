-- Add fileUrl column to documents table for optional file uploads
-- This allows users to upload PDF or image files of their documents

ALTER TABLE documents 
ADD COLUMN file_url text;

-- Add comment to explain the column
COMMENT ON COLUMN documents.file_url IS 'Optional URL to uploaded document file (PDF or image) stored in Supabase Storage';
