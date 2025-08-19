#!/bin/bash

# SmartQ Launchpad - Workflow Status Backend Update Script
# This script applies the new finalized workflow status sequence to your Supabase database

echo "🚀 SmartQ Launchpad - Workflow Status Backend Update"
echo "=================================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ supabase/config.toml not found. Please run this script from your project root directory."
    exit 1
fi

echo "✅ Project structure verified"

# Check Supabase connection
echo ""
echo "🔍 Checking Supabase connection..."
if ! supabase status &> /dev/null; then
    echo "⚠️  Supabase is not running locally. Starting Supabase..."
    supabase start
    if [ $? -ne 0 ]; then
        echo "❌ Failed to start Supabase. Please check your setup."
        exit 1
    fi
fi

echo "✅ Supabase is running"

# Apply the migration
echo ""
echo "📋 Applying workflow status migration..."
echo "This will:"
echo "  • Create workflow audit logs table"
echo "  • Update status enum with new finalized sequence"
echo "  • Migrate existing status values to new sequence"
echo "  • Add validation functions and triggers"
echo "  • Set up proper permissions and indexes"
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled."
    exit 1
fi

# Run the migration
echo "🔄 Running database migration..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🎉 Backend Update Summary:"
    echo "========================"
    echo "✅ New workflow status sequence implemented:"
    echo "   1. Site Created"
    echo "   2. Site Study Done" 
    echo "   3. Scoping Done"
    echo "   4. Approved"
    echo "   5. Procurement Done"
    echo "   6. Deployed"
    echo "   7. Live"
    echo ""
    echo "✅ Workflow audit logging enabled"
    echo "✅ Status progression validation active"
    echo "✅ Admin override capabilities added"
    echo "✅ Role-based permissions configured"
    echo ""
    echo "🔧 Next Steps:"
    echo "• Your frontend is already updated and ready to use"
    echo "• All existing sites have been migrated to new status values"
    echo "• Users will now see the new workflow sequence"
    echo "• Status transitions are now validated and logged"
    echo ""
    echo "📊 You can verify the changes in your Supabase dashboard:"
    echo "• Check the 'sites' table for updated status values"
    echo "• View the new 'workflow_audit_logs' table"
    echo "• Test status transitions in the application"
    echo ""
else
    echo "❌ Migration failed. Please check the error messages above."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "• Ensure you have proper database permissions"
    echo "• Check if your Supabase project is properly configured"
    echo "• Verify your database connection"
    echo ""
    echo "If you need help, check the migration file:"
    echo "supabase/migrations/20250119000000-implement-finalized-workflow-statuses.sql"
    exit 1
fi

echo "🎯 Workflow status update completed successfully!"
echo "Your SmartQ Launchpad now uses the finalized workflow sequence."
