#!/bin/bash

# Site Workflow Database Setup Script
# This script sets up all necessary tables and sample data for the site workflow

echo "🚀 Starting Site Workflow Database Setup..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Error: Not connected to Supabase. Please run:"
    echo "   supabase login"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✅ Supabase CLI is available and connected"

# Run the database setup script
echo "📊 Setting up database tables and sample data..."

# Execute the SQL script
if supabase db reset --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < database/scripts/fixed_site_workflow_setup.sql; then
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "🎉 What was set up:"
    echo "   • Complete site workflow tables (creation, study, scoping, approval, procurement, deployment, go-live)"
    echo "   • Software modules and hardware items reference tables"
    echo "   • Sample data for testing (including Morrisons Leeds site)"
    echo "   • Proper indexes and RLS policies"
    echo "   • Automatic timestamp triggers"
    echo ""
    echo "🔍 Test the setup by visiting:"
    echo "   http://localhost:8082/sites/5805e4ec-adce-43c7-a001-d93b70f7ab3e"
    echo ""
    echo "📝 The site should now show:"
    echo "   • Site Name: 'Morrisons Leeds' (instead of site code)"
    echo "   • Organization: 'Morrisons' (instead of 'Unknown Organization')"
    echo "   • Complete stepper flow with real data"
    echo "   • No more mock data in the network tab"
else
    echo "❌ Database setup failed. Please check the error messages above."
    echo ""
    echo "🔧 Manual setup option:"
    echo "   1. Open your Supabase dashboard"
    echo "   2. Go to SQL Editor"
    echo "   3. Copy and paste the contents of database/scripts/fixed_site_workflow_setup.sql"
    echo "   4. Run the script"
    exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "   1. Restart your development server: npm run dev"
echo "   2. Visit the site page to see real data"
echo "   3. Check the browser console for data loading logs"
echo "   4. Verify the stepper flow shows proper progress"
