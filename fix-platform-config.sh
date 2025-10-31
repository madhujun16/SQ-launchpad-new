#!/bin/bash

# Platform Config Fix Script
# This script helps fix the Platform Config backend issues

echo "🔧 Platform Config Backend Fix"
echo "================================"
echo ""

echo "📋 Issues Identified:"
echo "  • PlatformConfigService was trying to fetch from 'software_categories' table (doesn't exist)"
echo "  • RLS policies might be blocking access after security fixes"
echo "  • Missing default data in categories, software_modules, and hardware_items tables"
echo ""

echo "✅ Fixes Applied:"
echo "  • Updated PlatformConfigService to use correct 'categories' table"
echo "  • Created migration to fix RLS policies for platform config tables"
echo "  • Added default data insertion for all platform config tables"
echo ""

echo "🚀 Next Steps:"
echo "  1. Apply the migration: supabase/migrations/20250122000004-fix-platform-config-rls.sql"
echo "  2. Test the SoftwareHardwareManagement page"
echo "  3. Test the Site Study Step category loading"
echo ""

echo "📝 Manual Migration Steps (if Supabase CLI not available):"
echo "  1. Go to your Supabase Dashboard"
echo "  2. Navigate to SQL Editor"
echo "  3. Copy and paste the contents of: supabase/migrations/20250122000004-fix-platform-config-rls.sql"
echo "  4. Run the SQL script"
echo ""

echo "🔍 What the migration does:"
echo "  • Fixes RLS policies for categories, software_modules, hardware_items tables"
echo "  • Ensures admin users can manage all platform config data"
echo "  • Allows authenticated users to read active items"
echo "  • Inserts default categories, software modules, and hardware items"
echo "  • Creates tables if they don't exist"
echo ""

echo "⚠️  Important: Make sure you're logged in as an admin user when testing!"
