# ✅ Backend Server is Running!

## 🎉 Success! Your server started successfully

```
Name: taxi-app
Status: online ✅
PID: [Your Process ID]
Location: /home/your_username/your_domain/app/server/
```

---

## 📋 Complete Setup - Next 3 Steps

### Step 1: Save PM2 Configuration (30 seconds)

**Run these commands in SSH:**

```bash
# Save PM2 process list
pm2 save

# Configure PM2 to start on server reboot
pm2 startup
```

This ensures your server automatically restarts if the hosting server reboots.

---

### Step 2: Test Backend Locally (1 minute)

**In SSH, run:**

```bash
# Test the API
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{"status":"ok","message":"Taxi App API is running","timestamp":"2025-10-01..."}
```

If you see this ✅ - Your backend is working!

---

### Step 3: Configure Reverse Proxy (5 minutes)

Your backend runs on `localhost:5000` but needs to be accessible at `https://khasinogaming.com/api`

#### Option A: Using cPanel Application Manager (Easiest)

1. **Log into cPanel:**
   - Go to: https://yourdomain.com:2083

2. **Navigate to:**
   - **Software** → **Setup Node.js App**

3. **Click "Create Application"**

4. **Fill in:**
   - Node.js version: 18.x or latest
   - Application mode: Production
   - Application root: `/home/your_username/your_domain/app/server`
   - Application URL: Choose your domain → then add `/api`
   - Application startup file: `index.js`
   - Environment variables:
     ```
     PORT=5000
     NODE_ENV=production
     ```

5. **Click "Create"**

6. **In the app list, click "Stop" then "Start"**
   - This registers the proxy

---

#### Option B: Using .htaccess (Manual)

1. **In cPanel File Manager, navigate to:**
   ```
   /home/your_username/your_domain/
   ```

2. **Create/Edit `.htaccess` file**

3. **Add these lines:**

```apache
# Enable Rewrite Engine
RewriteEngine On

# Proxy API requests to Node.js backend
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

# WebSocket support (for Socket.io)
RewriteCond %{HTTP:Upgrade} =websocket [NC]
RewriteRule /api/(.*)  ws://localhost:5000/api/$1 [P,L]

# Enable proxy
ProxyPreserveHost On
ProxyPass /api http://localhost:5000/api
ProxyPassReverse /api http://localhost:5000/api
```

4. **Save the file**

---

#### Option C: Contact Support (If above don't work)

**Contact your hosting support and ask:**

> "Can you please configure a reverse proxy to forward requests from https://yourdomain.com/api to http://localhost:5000/api? My Node.js backend is running on port 5000."

---

### Step 4: Test Public API (1 minute)

**After configuring reverse proxy, test from your browser:**

Visit: **https://khasinogaming.com/api/health**

**Expected:** JSON response with `"status":"ok"`

---

## ✅ Verification Checklist

Run these tests to verify everything works:

### Test 1: Server Running
```bash
pm2 status
# Should show: taxi-app | online
```

### Test 2: Local API
```bash
curl http://localhost:5000/api/health
# Should return JSON
```

### Test 3: Public API
**Browser:** https://yourdomain.com/api/health
**Expected:** JSON response

### Test 4: Frontend Connection
1. Visit: https://yourdomain.com/app/
2. Open browser console (F12)
3. Should see: "Backend health check passed" or similar
4. No CORS errors

---

## 🐛 Troubleshooting

### Server stops running?

**Check logs:**
```bash
pm2 logs taxi-app
```

**Restart:**
```bash
pm2 restart taxi-app
```

### Can't access public API?

**Check if proxy is configured:**
1. Verify .htaccess exists and has proxy rules
2. Or check cPanel Node.js App setup
3. Contact hosting support if needed

**Test locally first:**
```bash
curl http://localhost:5000/api/health
```

If local works but public doesn't = proxy issue

### Database errors?

**Check environment variables:**
```bash
cd /home/your_username/your_domain/app/server
cat .env
```

**Verify database connection:**
```bash
mysql -u your_database_user -p
# Password: Check your .env file
```

---

## 🎯 Current Status

✅ **Completed:**
- MySQL database created
- Backend files uploaded
- Dependencies installed
- Server started with PM2
- Server running (PID: 140852)

⏳ **Remaining:**
- Save PM2 configuration
- Configure reverse proxy
- Test public API access
- Verify frontend connection

---

## 📊 Your Application URLs

```
Frontend:  https://yourdomain.com/app/          ✅ Live
Backend:   https://yourdomain.com/api/          ⏳ Needs proxy
Database:  localhost:3306/your_database_name    ✅ Ready
Server:    PM2 (taxi-app)                        ✅ Running
```

---

## 🚀 Quick Commands Reference

```bash
# Check server status
pm2 status

# View server logs
pm2 logs taxi-app

# Restart server
pm2 restart taxi-app

# Stop server
pm2 stop taxi-app

# Save PM2 config
pm2 save

# Test API locally
curl http://localhost:5000/api/health

# Test API publicly (after proxy setup)
curl https://yourdomain.com/api/health

# View environment
cd /home/your_username/your_domain/app/server
cat .env

# Database connection test
mysql -u your_database_user -p
```

---

## 🎉 Almost Done!

You're **90% complete!** Just need to:

1. **Save PM2:** `pm2 save`
2. **Configure proxy:** Use cPanel Node.js App or .htaccess
3. **Test:** Visit https://khasinogaming.com/api/health

**Then your full-stack app will be 100% live!** 🚀

---

## 💡 Next SSH Commands

**Copy and run these:**

```bash
# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup

# Test local API
curl http://localhost:5000/api/health

# View logs (if needed)
pm2 logs taxi-app --lines 50
```

**After that, configure the reverse proxy via cPanel or .htaccess!**

---

**You're almost there!** 🎊

