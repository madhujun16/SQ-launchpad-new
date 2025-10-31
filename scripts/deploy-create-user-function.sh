#!/bin/bash

# Script to deploy the create-user edge function to Supabase
# Usage: ./scripts/deploy-create-user-function.sh

set -e

echo "🚀 Deploying create-user edge function to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Check if we're in the right directory
if [ ! -f "supabase/functions/create-user/index.ts" ]; then
    echo "❌ Error: create-user function not found at supabase/functions/create-user/index.ts"
    echo "   Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase is linked
if [ ! -f ".supabase/config.toml" ] && [ ! -f "supabase/config.toml" ]; then
    echo "⚠️  Supabase project not linked. Attempting to link..."
    echo "   You may need to provide your project reference ID"
    read -p "Enter your Supabase project reference ID (or press Enter to skip): " project_ref
    
    if [ -n "$project_ref" ]; then
        supabase link --project-ref "$project_ref"
    else
        echo "❌ Cannot proceed without linking. Please run: supabase link --project-ref <your-project-ref>"
        exit 1
    fi
fi

# Deploy the function
echo "📤 Deploying create-user function..."
supabase functions deploy create-user

if [ $? -eq 0 ]; then
    echo "✅ Successfully deployed create-user function!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. The function is now available at: https://<your-project>.supabase.co/functions/v1/create-user"
    echo "   2. Test user creation from the User Management page"
    echo ""
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi

