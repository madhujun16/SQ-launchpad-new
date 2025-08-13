# Supabase File Upload Configuration

This document outlines the configuration required in Supabase to enable the layout image upload functionality.

## 1. Storage Bucket Configuration

### Create Storage Bucket
The application automatically creates a storage bucket called `site-layout-images` if it doesn't exist. However, you can also create it manually:

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **Create a new bucket**
4. Configure as follows:
   - **Name**: `site-layout-images`
   - **Public bucket**: ✅ Checked (enables public access to uploaded files)
   - **File size limit**: 10MB
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/jpg` 
     - `image/png`
     - `application/pdf`

### Storage Policies
The following RLS (Row Level Security) policies are automatically created by the migration:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow public access to view uploaded files
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT USING (true);

-- Allow users to delete their own uploads
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated');
```

## 2. Database Schema Updates

### Migration File
The file `supabase/migrations/20250105000021-add-layout-images-to-sites.sql` adds the following columns to the `sites` table:

- `layout_images`: JSONB array storing file URLs
- `layout_images_metadata`: JSONB array storing file metadata

### Run Migration
```bash
# If using Supabase CLI locally
supabase db push

# Or manually run the SQL in your Supabase SQL editor
```

## 3. Environment Variables

Ensure your `.env` file contains:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. File Upload Limits

- **Maximum files per site**: 3
- **Maximum file size**: 10MB per file
- **Supported file types**: JPG, PNG, PDF
- **Storage location**: `site-layout-images/{siteId}/` folder structure

## 5. Security Considerations

### File Validation
- File type validation (MIME type checking)
- File size validation (10MB limit)
- File count validation (max 3 per site)

### Access Control
- Only authenticated users can upload files
- Files are organized by site ID for isolation
- Public read access for viewing uploaded images

### Data Integrity
- Database triggers validate file count limits
- Automatic cleanup when files are deleted
- Audit trail through metadata storage

## 6. Testing the Setup

1. **Upload Test**:
   - Navigate to a site's configuration page
   - Try uploading an image file (JPG/PNG) or PDF
   - Verify the file appears in the uploaded images list

2. **Storage Verification**:
   - Check Supabase Storage → `site-layout-images` bucket
   - Verify files are organized by site ID
   - Confirm public URLs are accessible

3. **Database Verification**:
   - Check the `sites` table for new columns
   - Verify `layout_images` and `layout_images_metadata` are populated

## 7. Troubleshooting

### Common Issues

**"Bucket not found" error**:
- Ensure the storage bucket exists
- Check bucket name is exactly `site-layout-images`
- Verify bucket is public

**"Permission denied" error**:
- Check RLS policies are properly configured
- Ensure user is authenticated
- Verify storage policies allow uploads

**"File too large" error**:
- Check file size limit in bucket settings
- Verify the 10MB limit is configured

**"Invalid file type" error**:
- Check allowed MIME types in bucket settings
- Ensure file extension matches MIME type

### Debug Steps

1. Check browser console for error messages
2. Verify Supabase client configuration
3. Check storage bucket permissions
4. Verify RLS policies are active
5. Test with smaller files first

## 8. Performance Optimization

### Storage Optimization
- Images are stored with unique names to prevent conflicts
- Automatic cleanup of orphaned files
- Efficient folder structure by site ID

### Database Optimization
- JSONB columns for flexible metadata storage
- GIN indexes for fast JSON queries
- Automatic validation triggers

### Caching
- Public URLs enable CDN caching
- Browser caching for frequently accessed images
- Efficient metadata storage for quick access

## 9. Monitoring

### Storage Usage
Monitor your storage bucket usage in Supabase Dashboard:
- **Storage** → **Buckets** → **site-layout-images**
- Track total storage used
- Monitor file count and sizes

### Database Performance
Monitor the `sites` table performance:
- Check query execution times
- Monitor JSONB column performance
- Track storage growth

## 10. Backup and Recovery

### Storage Backup
- Supabase automatically backs up storage buckets
- Consider additional backup strategies for critical files
- Implement file versioning if needed

### Database Backup
- Regular database backups include layout image metadata
- File URLs are preserved in backups
- Consider implementing file reference validation

---

For additional support or questions, refer to the Supabase documentation or contact your development team.
