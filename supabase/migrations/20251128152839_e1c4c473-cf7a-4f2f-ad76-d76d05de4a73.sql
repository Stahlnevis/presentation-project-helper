-- Create storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence-files',
  'evidence-files',
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/mp3', 'application/pdf', 'text/plain']
);

-- RLS policies for evidence storage
CREATE POLICY "Users can upload their own evidence files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evidence-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own evidence files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'evidence-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own evidence files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'evidence-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own evidence files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'evidence-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);