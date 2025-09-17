#!/bin/bash

# Fix Organizations and Sites Data Script
# This script runs the SQL migration to fix organization data

echo "🔧 Fixing Organizations and Sites Data..."
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "fix_organizations_migration.sql" ]; then
    echo "❌ Error: fix_organizations_migration.sql not found in current directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found"
    echo "Please install Supabase CLI: npm install -g supabase"
    exit 1
fi

# Check if we're linked to a project
echo "🔍 Checking Supabase project status..."
if ! supabase status &> /dev/null; then
    echo "❌ Error: Not linked to a Supabase project"
    echo "Please run: supabase link"
    exit 1
fi

echo "✅ Supabase project is linked"

# Run the migration
echo "🚀 Running organization fix migration..."
echo "This will:"
echo "  1. Create missing organizations (ASDA, Tesco, Sainsbury, etc.)"
echo "  2. Link existing sites to proper organizations"
echo "  3. Show verification results"
echo ""

# Execute the SQL migration
if supabase db reset --linked; then
    echo "✅ Database reset completed"
    
    # Apply the migration
    if supabase db push; then
        echo "✅ Migration applied successfully"
        
        # Run the fix script
        echo "🔧 Applying organization fixes..."
        if psql "$(supabase status | grep 'DB URL' | awk '{print $3}')" -f fix_organizations_migration.sql; then
            echo "✅ Organization fixes applied successfully!"
            echo ""
            echo "🎉 All done! Your sites should now be properly linked to organizations."
            echo ""
            echo "Next steps:"
            echo "  1. Refresh your Sites page in the browser"
            echo "  2. Verify that organizations are now showing correctly"
            echo "  3. Check that sites are properly linked to their organizations"
        else
            echo "❌ Error applying organization fixes"
            exit 1
        fi
    else
        echo "❌ Error applying migration"
        exit 1
    fi
else
    echo "❌ Error resetting database"
    exit 1
fi

echo ""
echo "✨ Migration completed successfully!"
