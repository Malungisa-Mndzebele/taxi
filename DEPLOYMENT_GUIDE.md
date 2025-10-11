# 🚀 Deployment Guide - GitHub to Hosting

## 📋 Overview

This guide shows you how to set up automatic deployment from GitHub to your hosting server at https://khasinogaming.com/app/

---

## ⚙️ Setup GitHub Secrets

Before deployment works, you need to add your FTP password as a GitHub secret.

### Step 1: Go to GitHub Repository Settings

1. Open your repository: https://github.com/Malungisa-Mndzebele/taxi
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

### Step 2: Add FTP Password

- **Name:** `FTP_PASSWORD`
- **Value:** `your_ftp_password` (get from hosting provider)
- Click **Add secret**

---

## 🔄 Deployment Methods

### Method 1: Automatic Deployment (Recommended)

**Triggers:** Every time you push to `main` branch

**What it does:**
- Installs dependencies
- Prepares files
- Uploads to FTP server automatically

**How to use:**
```bash
# Just commit and push!
git add .
git commit -m "Your changes"
git push origin main
```

**GitHub Actions will automatically deploy!** ✅

---

### Method 2: Manual Deployment

**Triggers:** You click a button

**How to use:**
1. Go to: https://github.com/Malungisa-Mndzebele/taxi/actions
2. Click **"Full Deploy to Hosting"**
3. Click **"Run workflow"**
4. Choose deployment type:
   - **web-only** - Deploy just the web app
   - **server-only** - Deploy just the server
   - **full** - Deploy everything
5. Click **"Run workflow"**

---

## 📁 What Gets Deployed

### Web App Files:
```
khasinogaming.com/app/
├── index.html          # Main web app
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── icon-192.png       # App icon
├── icon-512.png       # App icon
└── icon.svg           # App icon
```

### Server Files (if needed):
```
khasinogaming.com/app/server/
├── index.js           # Server entry
├── routes/           # API routes
├── models/           # Database models
├── middleware/       # Auth middleware
├── node_modules/     # Dependencies
└── .env             # Environment config
```

---

## 🌐 Access Your Deployed App

### Web App:
**URL:** https://khasinogaming.com/app/

### API (if deployed):
**URL:** https://khasinogaming.com/app/server/ (or configure subdomain)

---

## 🔧 Configuration

### Update API URL in Web App

If you deploy the backend server, update the API URL in `web/index.html`:

**Find this line (around line 50-100):**
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

**Change to:**
```javascript
const API_BASE_URL = 'https://khasinogaming.com/api';
```

Or use environment variable:
```javascript
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
```

---

### Server Configuration

If deploying the backend, create `.env` file on server:

**File:** `/home/mawdqtvped/khasinogaming.com/app/server/.env`

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/taxi-app

# Security
JWT_SECRET=your-super-secret-key-change-this-immediately

# CORS
CLIENT_URL=https://khasinogaming.com/app

# API Keys (if needed)
GOOGLE_MAPS_API_KEY=your-key-here
STRIPE_SECRET_KEY=your-key-here
```

**Important:** Change `JWT_SECRET` to a random secure string!

---

## 📊 Deployment Workflow

### What Happens When You Push:

1. **GitHub receives push** ✅
2. **GitHub Actions triggered** ✅
3. **Workflow starts:**
   - Checkout code
   - Setup Node.js
   - Install dependencies
   - Build files (if needed)
   - Upload to FTP server
4. **Deployment complete** ✅
5. **App live at https://khasinogaming.com/app/** ✅

**Time:** ~2-5 minutes

---

## 🔍 Monitor Deployment

### Check Deployment Status:

1. Go to: https://github.com/Malungisa-Mndzebele/taxi/actions
2. See latest workflow run
3. Click to view details
4. Check logs for any errors

### Deployment Logs Show:
- ✅ Files uploaded
- ✅ Dependencies installed
- ❌ Any errors

---

## 🐛 Troubleshooting

### Deployment Fails

**Check:**
1. **GitHub Secret:** Is `FTP_PASSWORD` set correctly?
2. **FTP Connection:** Can GitHub reach your server?
3. **Permissions:** Does FTP user have write access?
4. **Logs:** Check GitHub Actions logs for errors

**Fix:**
- Verify FTP credentials
- Check server firewall allows FTP (port 21)
- Ensure path exists: `/home/mawdqtvped/khasinogaming.com/app/`

---

### Files Not Updating

**Possible causes:**
1. Browser cache
2. Server cache
3. FTP upload failed

**Solutions:**
```bash
# Hard refresh browser
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)

# Check FTP manually
Use FileZilla or similar to verify files uploaded

# Clear server cache (if applicable)
Contact hosting support
```

---

### Permission Denied

**Error:** "550 Permission denied"

**Fix:**
- Log in via FTP client (FileZilla)
- Check folder permissions
- Ensure path is correct
- Contact hosting support to verify permissions

---

## 🔐 Security Best Practices

### 1. Protect Secrets
- ✅ Never commit passwords to Git
- ✅ Use GitHub Secrets for sensitive data
- ✅ Change default passwords

### 2. Secure .env File
```bash
# On server, set proper permissions
chmod 600 .env
```

### 3. Use HTTPS
- ✅ Your domain has SSL: https://khasinogaming.com ✅
- ✅ Always use HTTPS URLs in production

### 4. Environment Variables
- Store API keys in `.env`
- Never commit `.env` to Git
- Use `.env.example` as template

---

## 📱 Deploy Mobile App

To also deploy the mobile app download page:

**Edit `.github/workflows/deploy.yml`** and remove this from exclude:
```yaml
# Remove or comment out this line:
# releases/download-android.html
```

This will deploy the Android app download page to:
https://khasinogaming.com/app/releases/download-android.html

---

## 🚀 Quick Deployment Commands

### Deploy Everything:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### Deploy Only Web App:
1. Go to Actions tab on GitHub
2. Run "Full Deploy to Hosting"
3. Choose "web-only"

### Deploy Only Server:
1. Go to Actions tab on GitHub
2. Run "Full Deploy to Hosting"
3. Choose "server-only"

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] Update API URL in web app
- [ ] Set production environment variables
- [ ] Test locally first
- [ ] Create `.env` file on server
- [ ] Change JWT_SECRET to secure value
- [ ] Verify FTP credentials
- [ ] Check GitHub Secret is set
- [ ] Test deployment with manual trigger first

---

## 🎯 Post-Deployment Steps

After first deployment:

1. **Visit Your App:**
   - https://khasinogaming.com/app/

2. **Test Features:**
   - Registration
   - Login
   - Basic functionality

3. **Check Browser Console:**
   - Press F12
   - Look for any errors
   - Verify API calls work

4. **Test on Mobile:**
   - Open on phone
   - Add to home screen
   - Test PWA features

---

## 📞 Support

### FTP Details (For Manual Upload):
- **Server:** server28.shared.spaceship.host
- **Username:** app@khasinogaming.com
- **Password:** (stored in GitHub Secrets)
- **Port:** 21
- **Path:** /home/mawdqtvped/khasinogaming.com/app/

### Hosting Support:
- Contact your hosting provider for:
  - FTP issues
  - Permission problems
  - Server configuration

### GitHub Actions:
- View logs: https://github.com/Malungisa-Mndzebele/taxi/actions
- Documentation: https://docs.github.com/en/actions

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ GitHub Actions workflow completes without errors
- ✅ Files appear on FTP server
- ✅ App loads at https://khasinogaming.com/app/
- ✅ No console errors
- ✅ Can register and login
- ✅ All features work

---

## 🎉 You're Ready!

Your CI/CD pipeline is set up! Now every time you push to GitHub, your app automatically deploys to your hosting! 🚀

**Next push will deploy automatically!** ✨

---

## 🔄 Workflow Files Created

- `.github/workflows/deploy.yml` - Automatic deployment on push
- `.github/workflows/deploy-full.yml` - Manual deployment with options
- `.ftpignore` - Files to exclude from deployment
- `DEPLOYMENT_GUIDE.md` - This guide

**All ready to use!** 🎊

