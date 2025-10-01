#!/bin/bash

echo ""
echo "========================================"
echo " 🚗 Starting Taxi App Locally"
echo "========================================"
echo ""

# Check if server dependencies are installed
echo "[1/3] Checking server dependencies..."
cd server
if [ ! -d "node_modules" ]; then
    echo "Installing server dependencies..."
    npm install
fi
cd ..

echo ""
echo "[2/3] Starting backend server..."
echo "Server will run on: http://localhost:5000"
echo ""

# Start server in background
cd server
npm start &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 3

echo ""
echo "[3/3] Opening web app..."
echo ""

# Open web app in default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open web/index.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open web/index.html
fi

echo ""
echo "========================================"
echo " ✅ Taxi App Started Successfully!"
echo "========================================"
echo ""
echo "Backend Server: http://localhost:5000"
echo "Web App: Opened in browser"
echo ""
echo "To stop the server:"
echo "  kill $SERVER_PID"
echo "  Or press Ctrl+C"
echo ""
echo "========================================"
echo ""

# Wait for user to stop
wait $SERVER_PID

