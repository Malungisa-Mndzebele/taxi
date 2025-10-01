#!/bin/bash
# Backend Setup Script for cPanel Hosting
# Run this via SSH after uploading files

echo ""
echo "=========================================="
echo " Taxi App Backend Setup"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "index.js" ]; then
    echo "Error: index.js not found!"
    echo "Please run this script from the backend directory:"
    echo "cd /home/mawdqtvped/khasinogaming.com/api"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
    echo "✅ PM2 installed"
fi

# Stop existing instance if running
echo "🛑 Stopping existing instance (if any)..."
pm2 stop taxi-api 2>/dev/null || true
pm2 delete taxi-api 2>/dev/null || true

# Start the server
echo "🚀 Starting server..."
pm2 start index.js --name taxi-api

if [ $? -ne 0 ]; then
    echo "❌ Failed to start server"
    echo "Check logs: pm2 logs taxi-api"
    exit 1
fi

# Save PM2 configuration
pm2 save

# Setup startup script
echo "⚙️  Configuring startup..."
pm2 startup

echo ""
echo "=========================================="
echo " ✅ Backend Setup Complete!"
echo "=========================================="
echo ""
echo "Server Status:"
pm2 status

echo ""
echo "Next Steps:"
echo "1. Test backend: curl http://localhost:5000/api/health"
echo "2. Configure reverse proxy (see CPANEL_BACKEND_SETUP.md)"
echo "3. Test from web: https://khasinogaming.com/api/health"
echo ""
echo "Useful Commands:"
echo "  pm2 status           - Check server status"
echo "  pm2 logs taxi-api    - View logs"
echo "  pm2 restart taxi-api - Restart server"
echo "  pm2 stop taxi-api    - Stop server"
echo ""
echo "=========================================="
echo ""

