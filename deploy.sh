#!/bin/bash

# Technifold Consumables Portal - Deployment Script

echo "🚀 Deploying Technifold Consumables Portal..."

# Initialize git if not already done
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Create commit
echo "💾 Creating commit..."
git commit -m "feat: Complete Technifold Consumables Portal MVP

✅ Features implemented:
- Dynamic portal access via /r/[token] URLs  
- Company-specific consumable data from Supabase
- Reorder tab with purchase history and dates
- Tool-specific consumable tabs
- Shopping cart with quantity pickers and pricing
- Mobile responsive design with Tailwind CSS
- 404 handling for invalid tokens
- JSON API endpoint with 60-second caching

🏗️ Tech Stack:
- Next.js 15 with App Router & TypeScript
- Supabase for database queries
- Tailwind CSS for styling
- Vercel-ready deployment configuration

🧪 Tested with real company data
🔒 Secure token validation and server-side queries"

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

echo "✅ Ready to push! Now run:"
echo "git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "git push -u origin main"
echo ""
echo "🔗 Then deploy to Vercel with your environment variables!"