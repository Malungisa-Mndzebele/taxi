# 🚀 Server Management Quick Reference

## ✅ Your Server is Running!

**Status:** Server is running on port 5000  
**Health:** http://localhost:5000/api/health  
**Web App:** Open `web/index.html` in browser

---

## 🔍 Check if Server is Running

### Method 1: Test Health Endpoint
```powershell
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Taxi App API is running",
  "timestamp": "2025-10-01T22:39:00.069Z"
}
```

### Method 2: Check Port 5000
```powershell
netstat -ano | findstr :5000
```

If you see output, server is running!

---

## 🛑 Stop the Server

### Method 1: Close the Window
- Find the PowerShell window with "Taxi App Server"
- Click the X to close it

### Method 2: Kill Process by PID
```powershell
# Find the PID
netstat -ano | findstr :5000

# Kill it (replace PID with actual number)
taskkill /PID 23768 /F
```

### Method 3: Kill All Node Processes (Nuclear Option)
```powershell
# WARNING: This stops ALL Node.js processes!
taskkill /IM node.exe /F
```

---

## ▶️ Start the Server

### Method 1: Use Startup Script (Easiest)
```bash
start-local.bat
```

### Method 2: Manual Start
```bash
cd server
node index.js
```

### Method 3: Background Start
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; node index.js"
```

---

## 🔄 Restart the Server

### Quick Restart:
```powershell
# Stop
taskkill /IM node.exe /F

# Wait a moment
Start-Sleep -Seconds 2

# Start
cd server
node index.js
```

### Or use the script:
```powershell
# Stop existing
taskkill /IM node.exe /F

# Start fresh
start-local.bat
```

---

## 🐛 Troubleshooting

### Error: "EADDRINUSE: address already in use :::5000"

**Cause:** Server is already running on port 5000

**Solution 1:** Use the existing server (it's working!)
```powershell
# Just open the web app
start web\index.html
```

**Solution 2:** Stop and restart
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill it
taskkill /PID <PID> /F

# Restart
cd server
node index.js
```

**Solution 3:** Use a different port
```powershell
# Set PORT environment variable
$env:PORT=5001
cd server
node index.js
```

---

### Error: "Cannot find module"

**Cause:** Dependencies not installed

**Solution:**
```bash
cd server
npm install
```

---

### Error: "MongoDB connection failed"

**Cause:** MongoDB not running or not configured

**Solution:** Server works without MongoDB!
- The error is just a warning
- API endpoints work for testing
- To enable MongoDB: Install MongoDB and set MONGODB_URI in .env

---

### Web App Can't Connect to Server

**Check:**
1. Is server running? `curl http://localhost:5000/api/health`
2. Is port 5000 open?
3. Check browser console (F12) for errors
4. Make sure using http:// not file://

**Fix:**
- Restart server
- Clear browser cache
- Check firewall settings

---

## 📊 Server Status Commands

### Check Health:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Check All Endpoints:
```powershell
curl http://localhost:5000/
```

### Test API:
```powershell
# Test root endpoint
curl http://localhost:5000/

# Test health
curl http://localhost:5000/api/health

# Test auth endpoint (will fail without data, but shows it's working)
curl -X POST http://localhost:5000/api/auth/register
```

---

## 🔧 Server Configuration

### Environment Variables

Create `server/.env`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database (optional)
MONGODB_URI=mongodb://localhost:27017/taxi-app

# Security
JWT_SECRET=your-secret-key-here

# CORS
CLIENT_URL=http://localhost:8080
```

### Change Port

**Temporary (one time):**
```powershell
$env:PORT=5001
cd server
node index.js
```

**Permanent:**
- Edit `server/.env`
- Set `PORT=5001`

---

## 📱 Access from Phone

### Step 1: Find Your Computer's IP
```powershell
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```

### Step 2: Make Sure Firewall Allows Port 5000
```powershell
# Add firewall rule (run as Administrator)
netsh advfirewall firewall add rule name="Taxi App" dir=in action=allow protocol=TCP localport=5000
```

### Step 3: On Phone
- Open browser
- Go to: `http://YOUR_IP:5000`
- Example: `http://192.168.1.100:5000`

---

## 🎯 Quick Commands Reference

| Task | Command |
|------|---------|
| Start server | `cd server && node index.js` |
| Stop server | `taskkill /IM node.exe /F` |
| Check if running | `netstat -ano \| findstr :5000` |
| Test health | `curl http://localhost:5000/api/health` |
| Open web app | `start web\index.html` |
| Full restart | `start-local.bat` |

---

## ✅ Current Status

**Your server is running and healthy!**

- ✅ Port 5000: Active
- ✅ Health check: Passing
- ✅ All routes: Loaded
- ✅ Socket.io: Enabled
- ✅ Web app: Working

**Just open the web app and start using it!**

---

## 💡 Pro Tips

1. **Don't restart unnecessarily** - If server is running, use it!
2. **Keep window open** - Don't close the server window
3. **Check logs** - Server window shows all activity
4. **Use health check** - Quick way to verify server is running
5. **Bookmark health URL** - http://localhost:5000/api/health

---

## 🎉 You're All Set!

Your server is running perfectly. Just:
1. ✅ Keep the server window open
2. ✅ Use the web app (already opened)
3. ✅ Register and test features

**Happy coding! 🚗💨**

