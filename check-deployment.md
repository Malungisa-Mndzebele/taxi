# 🔍 Deployment Troubleshooting

## ❌ Issue: Taxi App Not Showing at https://khasinogaming.com/app/

**Current Status:** Website shows a card game instead of taxi app

---

## 🎯 Most Likely Causes

### 1. GitHub Secret Not Added (Most Common)

**Problem:** You pushed the code but didn't add the FTP_PASSWORD secret

**Check:**
1. Go to: https://github.com/Malungisa-Mndzebele/taxi/settings/secrets/actions
2. Do you see `FTP_PASSWORD` listed?
3. If NO → This is the problem!

**Fix:**
1. Click "New repository secret"
2. Name: `FTP_PASSWORD`
3. Secret: `@QWERTYasd`
4. Click "Add secret"
5. Then re-run deployment

---

### 2. Deployment Failed

**Check:**
1. Go to: https://github.com/Malungisa-Mndzebele/taxi/actions
2. Look at the latest workflow run
3. Is it ❌ Red (failed) or ✅ Green (success)?

**If Red (Failed):**
- Click on the failed run
- Look at the error message
- Most likely: "FTP_PASSWORD secret not found"

**If Green (Success):**
- Files were uploaded
- Check if path is correct (see below)

---

### 3. Wrong Deployment Path

**Problem:** Files went to wrong directory

**Current Path in Workflow:**
```
/home/mawdqtvped/khasinogaming.com/app/
```

**Possible Issues:**
- Files might be in subfolder
- Need to overwrite existing game files
- Path might need adjustment

---

## ✅ Quick Fix Steps

### Step 1: Add GitHub Secret (If Not Done)

```
1. Go to: https://github.com/Malungisa-Mndzebele/taxi/settings/secrets/actions
2. Click: "New repository secret"
3. Name: FTP_PASSWORD
4. Secret: @QWERTYasd
5. Click: "Add secret"
```

### Step 2: Trigger Manual Deployment

Since automatic deployment might have failed, trigger it manually:

```
1. Go to: https://github.com/Malungisa-Mndzebele/taxi/actions
2. Click: "Full Deploy to Hosting" (left sidebar)
3. Click: "Run workflow" (right side)
4. Select: "web-only"
5. Click: "Run workflow"
6. Wait 2-3 minutes
7. Refresh: https://khasinogaming.com/app/
```

### Step 3: Verify Files via FTP

Use FTP client to check:

**FTP Details:**
- Server: server28.shared.spaceship.host
- Username: app@khasinogaming.com
- Password: @QWERTYasd
- Path: /home/mawdqtvped/khasinogaming.com/app/

**Expected Files:**
- index.html (your taxi app)
- manifest.json
- sw.js
- icon-192.png
- icon-512.png

---

## 🔧 Alternative: Manual FTP Upload

If GitHub Actions isn't working, upload manually:

### Option 1: FileZilla (Recommended)

1. **Download FileZilla:** https://filezilla-project.org/
2. **Connect:**
   - Host: server28.shared.spaceship.host
   - Username: app@khasinogaming.com
   - Password: @QWERTYasd
   - Port: 21
3. **Navigate to:** /home/mawdqtvped/khasinogaming.com/app/
4. **Upload files from:** `web/` folder
5. **Overwrite** existing files when prompted

### Option 2: Command Line FTP

```bash
# Windows
ftp server28.shared.spaceship.host
# Login: app@khasinogaming.com
# Password: @QWERTYasd
cd /home/mawdqtvped/khasinogaming.com/app/
put web/index.html
put web/manifest.json
put web/sw.js
# etc...
```

---

## 🎯 Updated Workflow (If Path Wrong)

If the current game needs to be in a different folder:

### Option A: Deploy to Subfolder

**Change workflow path to:**
```yaml
server-dir: /home/mawdqtvped/khasinogaming.com/app/taxi/
```

**Your app will be at:**
https://khasinogaming.com/app/taxi/

### Option B: Replace Game

**Keep current path, just overwrite:**
```yaml
server-dir: /home/mawdqtvped/khasinogaming.com/app/
```

**Your app will replace game:**
https://khasinogaming.com/app/

---

## 📊 Check Deployment Status

### Via GitHub Actions:

```
1. Open: https://github.com/Malungisa-Mndzebele/taxi/actions
2. Look for latest "Deploy to Hosting" run
3. Click on it
4. Check status:
   ✅ Success = Files uploaded
   ❌ Failed = Check error
   🟡 Running = Wait for completion
```

### Via FTP:

```
1. Connect to FTP server
2. Navigate to: /home/mawdqtvped/khasinogaming.com/app/
3. Check file timestamps
4. Verify index.html is YOUR taxi app (not game)
```

---

## 🐛 Common Errors & Fixes

### Error: "Secret FTP_PASSWORD not found"

**Cause:** GitHub secret not added

**Fix:**
1. Add secret (see Step 1 above)
2. Re-run workflow

---

### Error: "Permission denied"

**Cause:** FTP user lacks write permission

**Fix:**
1. Contact hosting support
2. Verify FTP user has write access to path
3. Check folder ownership/permissions

---

### Error: "Connection timeout"

**Cause:** Firewall blocking FTP

**Fix:**
1. Verify FTP credentials work manually
2. Check if GitHub IPs are allowed
3. Try different port (if available)

---

### Files Upload But Site Doesn't Change

**Causes:**
1. Browser cache
2. Files in wrong directory
3. Server caching

**Fixes:**
```
# Hard refresh browser
Ctrl + Shift + R

# Clear browser cache completely

# Check FTP to verify correct path

# Wait 5-10 minutes for server cache
```

---

## ✅ Verification Steps

After deployment:

1. **Check GitHub Actions:**
   - ✅ Workflow completed successfully
   - No errors in logs

2. **Check via FTP:**
   - ✅ Files exist in correct path
   - ✅ File timestamps are recent
   - ✅ index.html contains taxi app code

3. **Check Website:**
   - ✅ https://khasinogaming.com/app/ shows taxi app
   - ✅ No console errors (F12)
   - ✅ Can register/login

---

## 🚀 Quick Action Plan

**Right Now:**

1. **Check if secret exists:**
   https://github.com/Malungisa-Mndzebele/taxi/settings/secrets/actions

2. **If NO secret:**
   - Add FTP_PASSWORD
   - Re-run deployment

3. **If secret exists:**
   - Check Actions tab for errors
   - Manually run "Full Deploy to Hosting"

4. **If still not working:**
   - Use FileZilla to upload manually
   - Verify files are in correct location

---

## 📞 Need Help?

**Hosting Support:**
- Check with your hosting provider about:
  - Correct FTP path
  - File permissions
  - Whether /app/ is protected

**GitHub Actions Logs:**
- Full error messages at: https://github.com/Malungisa-Mndzebele/taxi/actions

---

## 🎯 Most Likely Solution

**90% of the time, the issue is:**

1. **FTP_PASSWORD secret not added**
   - Add it now
   - Re-run deployment
   - Wait 3 minutes
   - Refresh site

**Try this first!** ⚡

