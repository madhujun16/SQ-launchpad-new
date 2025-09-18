# Database Scripts

This directory contains database-related scripts and utilities for the SmartQ Launchpad project.

## 📁 Directory Structure

```
database/
├── migrations/          # Supabase migration files (managed by Supabase CLI)
├── scripts/            # Manual database scripts and utilities
├── backups/            # Database backup files
└── README.md           # This file
```

## 🗂️ Scripts Overview

### Migration Scripts
- `complete_database_setup.sql` - Complete database setup script
- `complete_migration_script.sql` - Migration script (legacy)
- `complete_migration_script_fixed.sql` - Fixed migration script (legacy)
- `20250118000001-migrate-categories-to-foreign-keys.sql` - Categories foreign key migration

### Setup Scripts
- `setup_categories_table.sql` - Categories table setup
- `setup_software_hardware_tables.sql` - Software/hardware tables setup

### Fix Scripts
- `fix_categories_rls.sql` - Categories RLS policy fixes
- `fix_organizations_migration.sql` - Organizations migration fixes
- `simple_organization_fix.sql` - Simple organization fixes

### Utility Scripts
- `check_tables_structure.sql` - Table structure verification

## 🚀 Usage

### Running Scripts
```bash
# Run a specific script
psql -h your-host -U your-user -d your-database -f database/scripts/script-name.sql

# Or use Supabase CLI for migrations
supabase db reset
supabase db push
```

### Migration Management
- **Supabase Migrations**: Use `supabase/migrations/` for version-controlled migrations
- **Manual Scripts**: Use `database/scripts/` for one-time setup or maintenance scripts

## 📋 Best Practices

1. **Use Supabase Migrations**: For schema changes, use the official Supabase migration system
2. **Document Scripts**: Add comments explaining what each script does
3. **Version Control**: Keep all scripts in version control
4. **Backup First**: Always backup before running destructive scripts
5. **Test Locally**: Test scripts on development environment first

## 🔧 Maintenance

- **Regular Cleanup**: Remove obsolete scripts periodically
- **Documentation**: Update this README when adding new scripts
- **Naming**: Use descriptive names with dates for temporary scripts
- **Organization**: Group related scripts in subdirectories if needed

## 📞 Support

For database-related issues, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Project documentation in `docs/database/`
