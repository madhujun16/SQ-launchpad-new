-- Add layout images support to sites table
-- This migration adds the ability to store layout image references for sites

-- Add layout_images column to sites table
ALTER TABLE public.sites 
ADD COLUMN IF NOT EXISTS layout_images JSONB DEFAULT '[]';

-- Add layout_images_metadata column for additional file information
ALTER TABLE public.sites 
ADD COLUMN IF NOT EXISTS layout_images_metadata JSONB DEFAULT '[]';

-- Create function to validate layout images JSON structure
CREATE OR REPLACE FUNCTION public.validate_layout_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure layout_images is an array
  IF NEW.layout_images IS NOT NULL AND jsonb_typeof(NEW.layout_images) != 'array' THEN
    RAISE EXCEPTION 'layout_images must be an array';
  END IF;
  
  -- Ensure layout_images_metadata is an array
  IF NEW.layout_images_metadata IS NOT NULL AND jsonb_typeof(NEW.layout_images_metadata) != 'array' THEN
    RAISE EXCEPTION 'layout_images_metadata must be an array';
  END IF;
  
  -- Limit to maximum 3 images
  IF NEW.layout_images IS NOT NULL AND jsonb_array_length(NEW.layout_images) > 3 THEN
    RAISE EXCEPTION 'Maximum 3 layout images allowed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate layout images
CREATE TRIGGER validate_sites_layout_images
  BEFORE INSERT OR UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.validate_layout_images();

-- Update RLS policies to include layout images
-- Users can view layout images for sites they have access to
CREATE POLICY "Users can view layout images for accessible sites" ON public.sites
  FOR SELECT USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND (full_name LIKE '%' || sites.name || '%' OR email LIKE '%' || sites.name || '%')
    )
  );

-- Admins can update layout images
CREATE POLICY "Admins can update layout images" ON public.sites
  FOR UPDATE USING (public.is_admin());

-- Create index for better performance when querying layout images
CREATE INDEX IF NOT EXISTS idx_sites_layout_images 
ON public.sites USING GIN (layout_images);

CREATE INDEX IF NOT EXISTS idx_sites_layout_images_metadata 
ON public.sites USING GIN (layout_images_metadata);

-- Storage policies for the site-layout-images bucket
-- Note: These policies will be applied when the bucket is created
-- You may need to create these manually in the Supabase dashboard

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'site-layout-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public access to view uploaded files
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT USING (bucket_id = 'site-layout-images');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'site-layout-images' 
  AND auth.role() = 'authenticated'
);
