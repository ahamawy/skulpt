#!/bin/bash

echo "🎯 Starting Skulpt Booking System..."
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting local server..."
echo "   Opening http://localhost:8080 in your browser..."
echo ""
echo "   Press Ctrl+C to stop the server"
echo ""

npm start