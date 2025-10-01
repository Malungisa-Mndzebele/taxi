# 🚀 Start Taxi App Locally - Quick Guide

## ⚡ Quick Start (Choose Your OS)

### Windows:
```bash
start-local.bat
```

### Mac/Linux:
```bash
chmod +x start-local.sh
./start-local.sh
```

That's it! The app will open automatically.

---

## 📋 Manual Start (Step by Step)

### Option 1: Start Everything

**Windows (PowerShell):**
```powershell
# Start server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm start"

# Wait a moment, then open web app
Start-Sleep -Seconds 3
Start-Process "web\index.html"
```

**Mac/Linux (Terminal):**
```bash
# Start server in background
cd server && npm start &

# Wait a moment, then open web app
sleep 3
open web/index.html  # macOS
# OR
xdg-open web/index.html  # Linux
```

---

### Option 2: Start Step-by-Step

#### Step 1: Install Dependencies (First Time Only)

```bash
# Install server dependencies
cd server
npm install

# Go back to root
cd ..
```

#### Step 2: Start Backend Server

**Open Terminal/Command Prompt and run:**

```bash
cd server
npm start
```

You should see:
```
🚗 Taxi App Server
Server running on port 5000
MongoDB: Attempting to connect...
```

**Keep this terminal open!**

#### Step 3: Open Web App

**Option A: Double-click**
- Navigate to `web/` folder
- Double-click `index.html`

**Option B: Command line**

**Windows:**
```bash
start web\index.html
```

**Mac:**
```bash
open web/index.html
```

**Linux:**
```bash
xdg-open web/index.html
```

---

## 🌐 Access the App

Once started, access at:

- **Web Interface:** `file:///path/to/web/index.html`
- **Backend API:** `http://localhost:5000`
- **API Health:** `http://localhost:5000/api/health`

---

## 📱 Use on Phone (Same WiFi)

### Step 1: Find Your Computer's IP

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig
# OR
ip addr show
# Look for your local IP (e.g., 192.168.1.100)
```

### Step 2: On Your Phone

**For Android:**
1. Open Chrome
2. Go to: `http://YOUR_IP:5000` (e.g., `http://192.168.1.100:5000`)
3. Or open the download page at: `http://YOUR_IP:5000/releases/download-android.html`
4. Add to Home Screen!

**Note:** You'll need to serve the web files. See "Advanced Options" below.

---

## 🛠️ Advanced Options

### Serve Web App via HTTP (Better for Testing)

If you want to serve the web app properly (not file://):

**Quick HTTP Server:**
```bash
# In the web directory
cd web
npx http-server -p 8080
```

Then access at: `http://localhost:8080`

---

### Start with MongoDB (If Using Database)

If you're using MongoDB locally:

**1. Start MongoDB:**

**Windows:**
```bash
# If installed as service, it's already running
# Or manually:
mongod
```

**Mac (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**2. Set Environment Variable:**

Create `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/taxi-app
JWT_SECRET=your-secret-key-here
PORT=5000
```

**3. Start Server:**
```bash
cd server
npm start
```

---

## 🔍 Verify Everything Works

### Test Backend:
```bash
# In a browser or using curl
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Taxi App API is running"
}
```

### Test Web App:
- Open `web/index.html`
- You should see the Taxi App interface
- Try registering a user

---

## 🚨 Troubleshooting

### Port 5000 Already in Use:
```bash
# Find and kill the process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Dependencies Not Installed:
```bash
# Install all dependencies
cd server && npm install
cd ../web && npm install
cd ../client && npm install --legacy-peer-deps
```

### MongoDB Connection Error:
- Make sure MongoDB is running
- Check `server/.env` has correct `MONGODB_URI`
- Or comment out MongoDB connection in `server/index.js` for testing

### Can't Access from Phone:
- Make sure phone and computer are on same WiFi
- Check firewall allows port 5000
- Use correct IP address (not 127.0.0.1)

---

## 📊 What Runs Where

| Component | Port | Access |
|-----------|------|--------|
| Backend API | 5000 | http://localhost:5000 |
| Web App | file:// | Open index.html |
| Web Server (optional) | 8080 | http://localhost:8080 |
| MongoDB (if used) | 27017 | localhost:27017 |

---

## ⚙️ Environment Setup (Optional)

Create `server/.env` for configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/taxi-app

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS
CLIENT_URL=http://localhost:8080

# API Keys (if needed)
GOOGLE_MAPS_API_KEY=your-google-maps-key
STRIPE_SECRET_KEY=your-stripe-key
```

---

## 🎯 Quick Commands Reference

### Start Everything:
```bash
# Windows
start-local.bat

# Mac/Linux
./start-local.sh
```

### Start Just Server:
```bash
cd server && npm start
```

### Start Just Web:
```bash
open web/index.html
```

### Start with Web Server:
```bash
cd web && npx http-server -p 8080
```

### Check Server Status:
```bash
curl http://localhost:5000/api/health
```

---

## 📱 Mobile Access

### Option 1: PWA (Recommended)
1. Serve web app via HTTP: `cd web && npx http-server -p 8080`
2. Get your IP: `ipconfig` or `ifconfig`
3. On phone: Open `http://YOUR_IP:8080` in Chrome
4. Add to Home Screen

### Option 2: Use ngrok (Public URL)
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Expose publicly
npx ngrok http 5000
```

Access from anywhere using ngrok URL!

---

## ✅ Success Checklist

- [ ] Server running on port 5000
- [ ] Can access http://localhost:5000/api/health
- [ ] Web app opens in browser
- [ ] Can register a new user
- [ ] Can login
- [ ] No errors in browser console

---

## 🎉 You're Ready!

Once the server is running and web app is open:

1. **Register** as Passenger or Driver
2. **Login** with your credentials
3. **Request a ride** (as passenger)
4. **Accept rides** (as driver)
5. **Enjoy!**

---

## 📞 Need Help?

- **Server won't start:** Check `server/package.json` exists
- **Port conflicts:** Change port in `server/index.js`
- **MongoDB errors:** Use without database for testing
- **Web app blank:** Check browser console for errors

**Everything is working!** 🚗💨

