# 🚀 Production Setup Guide

## ✅ Files Deployed Successfully!

All web app files are now live at **https://khasinogaming.com/app/**

---

## 🔧 Current Setup

### ✅ Deployed Files:
- `index.html` - Main app with auto-detect API URL
- `manifest.json` - PWA manifest
- `sw.js` - Service worker
- `icon-192.png` - App icon
- `icon-512.png` - App icon  
- `icon.svg` - App icon

### 🔄 API URL Configuration:

The app now auto-detects the environment:

**Production (khasinogaming.com):**
```javascript
API_BASE = 'https://khasinogaming.com/api'
```

**Local Development (localhost):**
```javascript
API_BASE = 'http://localhost:5000/api'
```

---

## ⚠️ Important: Backend API Required

Your web app is trying to connect to: **https://khasinogaming.com/api**

**You have 3 options:**

### Option 1: Deploy Backend to Same Hosting (Recommended)

If your hosting supports Node.js:

1. **Upload server files** via FTP or GitHub Actions
2. **Install dependencies:** `npm install --production`
3. **Configure environment:**
   ```bash
   cd server
   nano .env
   ```
   
   Add:
   ```env
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb://localhost:27017/taxi-app
   JWT_SECRET=CHANGE_TO_SECURE_RANDOM_STRING
   CLIENT_URL=https://khasinogaming.com/app
   ```

4. **Start server:**
   ```bash
   npm start
   # Or use PM2 for production:
   npm install -g pm2
   pm2 start index.js --name taxi-server
   pm2 save
   ```

5. **Configure reverse proxy** (Apache/Nginx)
   - Map `/api` to `localhost:5000`
   - Example Nginx config:
     ```nginx
     location /api/ {
         proxy_pass http://localhost:5000/api/;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
     }
     ```

---

### Option 2: Use Separate Backend Server

Deploy backend to another service:

**Free Options:**
- **Railway.app** - Free Node.js hosting
- **Render.com** - Free tier with Node.js
- **Fly.io** - Free tier
- **Heroku** - Free tier (limited)

**Then update the API URL in `web/index.html`:**
```javascript
const API_BASE = isProduction 
    ? 'https://your-backend-url.railway.app/api'  // Your backend URL
    : 'http://localhost:5000/api';
```

---

### Option 3: Frontend-Only Mode (No Backend)

For demo purposes, modify the app to work without backend:

1. **Mock API responses** in the frontend
2. **Use localStorage** for data persistence
3. **Remove server-dependent features**

**Note:** This limits functionality significantly.

---

## 🎯 Quick Fix: Deploy Backend to Railway

### Step 1: Sign up for Railway
1. Go to: https://railway.app/
2. Sign up with GitHub
3. It's free!

### Step 2: Deploy Backend
```bash
# In your project
git add server/
git commit -m "Prepare server for Railway"

# Push to GitHub
git push origin main
```

### Step 3: Create Railway Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose "taxi" repository
4. Set root directory: `server`
5. Railway auto-detects Node.js
6. Click "Deploy"

### Step 4: Configure Environment
In Railway dashboard:
1. Go to "Variables"
2. Add:
   - `PORT`: 5000
   - `NODE_ENV`: production
   - `JWT_SECRET`: (random secure string)
   - `CLIENT_URL`: https://khasinogaming.com/app
   - `MONGODB_URI`: (get from Railway MongoDB addon or external)

### Step 5: Get Your Backend URL
Railway gives you URL like: `https://taxi-production-abc.up.railway.app`

### Step 6: Update Frontend
Update `web/index.html`:
```javascript
const API_BASE = isProduction 
    ? 'https://taxi-production-abc.up.railway.app/api'
    : 'http://localhost:5000/api';
```

Deploy updated file:
```bash
powershell -ExecutionPolicy Bypass -File deploy-now.ps1
```

---

## 📊 Current Status

### ✅ Working:
- Frontend deployed
- PWA files available
- Auto-detect environment
- All static assets loading

### ⚠️ Needs Backend:
- User registration
- Login
- Ride requests
- All API-dependent features

### 🎯 Next Steps:
1. **Deploy backend** (Railway recommended)
2. **Update API URL** in web/index.html
3. **Redeploy** frontend
4. **Test** at https://khasinogaming.com/app/

---

## 🔍 Testing

### Test Frontend (Works Now):
1. Visit: https://khasinogaming.com/app/
2. Hard refresh: `Ctrl + Shift + R`
3. Check browser console (F12)
4. Verify no 404 errors for manifest/sw.js

### Test Backend Connection:
1. Open browser console (F12)
2. Should see: "Backend health check passed" or "Backend connection failed"
3. If failed: Backend needs to be deployed

---

## 🐛 Troubleshooting

### Mixed Content Error
**Fixed!** App now uses HTTPS in production.

### 404 for manifest.json/sw.js
**Fixed!** All files deployed.

### "Backend connection failed"
**Expected** - Deploy backend to fix (see options above)

### App shows old version
**Solution:**
```
Clear browser cache
Hard refresh: Ctrl + Shift + R
Wait 2-3 minutes for CDN cache
```

---

## 💡 Recommended Production Stack

### Current Setup:
- ✅ **Frontend:** khasinogaming.com (static hosting)
- ⚠️ **Backend:** Not deployed yet

### Recommended Setup:
- ✅ **Frontend:** khasinogaming.com (static hosting)
- ✅ **Backend:** Railway.app (free Node.js)
- ✅ **Database:** Railway MongoDB addon (free tier)

**Total Cost:** FREE! 🎉

---

## 🎉 Your App is Live!

**URL:** https://khasinogaming.com/app/

**Status:**
- ✅ Frontend: Working
- ⚠️ Backend: Needs deployment

**To make fully functional:**
1. Deploy backend (Railway - 10 minutes)
2. Update API URL
3. Redeploy frontend
4. Done! 🚀

---

## 📞 Quick Commands

### Deploy updated frontend:
```bash
powershell -ExecutionPolicy Bypass -File deploy-all-files.ps1
```

### Test locally with backend:
```bash
cd server
npm start
```

Then visit: http://localhost:5000/api/health

---

**Your frontend is live! Deploy the backend to make it fully functional.** 🚀

