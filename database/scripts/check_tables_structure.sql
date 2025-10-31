-- Check if hardware_items table exists and has correct structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hardware_items' 
ORDER BY ordinal_position;

-- Check if software_modules table exists and has correct structure  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'software_modules' 
ORDER BY ordinal_position;
