-- Add sector field to organizations table
ALTER TABLE public.organizations 
ADD COLUMN sector TEXT;

-- Add comment for the new column
COMMENT ON COLUMN public.organizations.sector IS 'The sector or industry this organization belongs to'; 