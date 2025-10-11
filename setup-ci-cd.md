# ⚡ Quick CI/CD Setup

## 🚀 5-Minute Setup Guide

### Step 1: Add GitHub Secret (REQUIRED)

1. **Go to:** https://github.com/Malungisa-Mndzebele/taxi/settings/secrets/actions

2. **Click:** "New repository secret"

3. **Add:**
   - **Name:** `FTP_PASSWORD`
   - **Secret:** `your_ftp_password` (get from hosting provider)

4. **Click:** "Add secret"

**Done!** ✅

---

### Step 2: Push This Commit

```bash
git add .
git commit -m "Setup CI/CD deployment"
git push origin main
```

**GitHub Actions will run and deploy automatically!** ✅

---

### Step 3: Verify Deployment

1. **Check workflow:** https://github.com/Malungisa-Mndzebele/taxi/actions

2. **Wait 2-5 minutes** for deployment to complete

3. **Visit your app:** https://khasinogaming.com/app/

---

## ✅ That's It!

**Your CI/CD is now set up!**

Every time you push to main branch:
- ✅ GitHub Actions triggers
- ✅ Files are deployed to your hosting
- ✅ App updates automatically

---

## 🎯 Quick Commands

### Deploy Now:
```bash
git add .
git commit -m "Deploy updates"
git push origin main
```

### Manual Deploy:
1. Go to: https://github.com/Malungisa-Mndzebele/taxi/actions
2. Click: "Full Deploy to Hosting"
3. Click: "Run workflow"
4. Choose: "web-only" or "full"
5. Click: "Run workflow"

---

## 📱 Your Deployed App

**Live URL:** https://khasinogaming.com/app/

**Features:**
- ✅ Taxi app interface
- ✅ User registration
- ✅ Login system
- ✅ PWA (installable)
- ✅ Works on all devices

---

## 🔄 What Happens on Push

```
You Push Code
    ↓
GitHub Actions Starts
    ↓
Install Dependencies
    ↓
Prepare Files
    ↓
Upload via FTP
    ↓
Deployment Complete!
    ↓
App Live! 🎉
```

**Time:** 2-5 minutes

---

## 📖 Full Documentation

Read **DEPLOYMENT_GUIDE.md** for:
- Detailed setup instructions
- Troubleshooting
- Advanced configuration
- Security best practices

---

## ⚠️ Important Notes

### Before First Deployment:

1. **Add GitHub Secret** (FTP_PASSWORD) - REQUIRED!
2. **Update API URL** in web/index.html if using backend
3. **Test locally** before deploying

### After First Deployment:

1. **Visit:** https://khasinogaming.com/app/
2. **Test:** Registration and login
3. **Check:** Browser console for errors

---

## 🎉 Ready!

Your CI/CD pipeline is configured and ready to use!

**Next push will automatically deploy to your hosting!** 🚀

