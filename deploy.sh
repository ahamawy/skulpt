#!/bin/bash

echo "🚀 Deploying Skulpt Booking System to Netlify..."
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if logged in to Netlify
echo "📝 Checking Netlify authentication..."
netlify status || netlify login

echo ""
echo "🏗️  Deploying to production..."
netlify deploy --prod --dir=public

echo ""
echo "✅ Deployment complete!"
echo ""
echo "💡 Tip: You can also deploy by:"
echo "   1. Dragging the 'skulpt' folder to https://app.netlify.com/drop"
echo "   2. Connecting this repo to Netlify for automatic deployments"
echo ""