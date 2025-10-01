# 🚀 Backend Deployment Guide for cPanel Hosting

## Complete guide to host your Node.js backend on khasinogaming.com

---

## 📋 Prerequisites

Your cPanel hosting at **khasinogaming.com** includes:
- ✅ Node.js support
- ✅ MySQL database
- ✅ FTP access
- ✅ SSH access (probably)
- ✅ cPanel control panel

---

## 🗄️ Step 1: Create MySQL Database

### Via cPanel:

1. **Log into cPanel:**
   - Go to: https://khasinogaming.com:2083
   - Or: https://server28.shared.spaceship.host:2083
   - Login with your hosting credentials

2. **✅ Database Already Created!**
   
   Your database is already set up:
   ```
   Database Name: mawdqtvped_taxi_app
   Database User: mawdqtvped_username_taxi_app
   Database Password: @QWERTYasd
   Database Host: localhost
   ```
   
   ✅ **Skip to Step 2** (Upload Backend Files)
   
   ---
   
   <details>
   <summary>📝 For reference: How to create database manually</summary>
   
   - Navigate to: **Databases** → **MySQL® Databases**
   - Under **Create New Database:**
     - Database Name: `taxi_app`
     - Click **Create Database**
   - Full name will be: `mawdqtvped_taxi_app`

   - Under **MySQL Users** → **Add New User:**
     - Username: `username_taxi_app`
     - Password: Generate strong password
     - Click **Create User**
   - Full name will be: `mawdqtvped_username_taxi_app`

   - Under **Add User To Database:**
     - User: `mawdqtvped_username_taxi_app`
     - Database: `mawdqtvped_taxi_app`
     - Click **Add**
   - Select **ALL PRIVILEGES**
   - Click **Make Changes**
   
   </details>

---

## 📤 Step 2: Upload Backend Files

### Option A: Via FTP (Easiest)

1. **Connect via FileZilla or similar:**
   - Host: server28.shared.spaceship.host
   - Username: app@khasinogaming.com
   - Password: @QWERTYasd
   - Port: 21

2. **Navigate to:**
   ```
   /home/mawdqtvped/khasinogaming.com/api/
   ```
   
   If `/api/` folder doesn't exist, create it.

3. **Upload these folders/files:**
   ```
   server/
   ├── middleware/
   ├── models/
   ├── routes/
   ├── index.js
   ├── package.json
   └── .env (create this on server)
   ```

### Option B: Via GitHub Actions (Automated)

Update `.github/workflows/deploy-full.yml` to deploy server too:

```yaml
# Run the workflow with "full" option
# It will deploy both web and server
```

---

## ⚙️ Step 3: Configure Environment

### Create .env file on server:

**Via cPanel File Manager:**
1. Go to **Files** → **File Manager**
2. Navigate to `/home/mawdqtvped/khasinogaming.com/api/`
3. Click **+ File**
4. Name: `.env`
5. Edit and add:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database (MySQL via cPanel) - ✅ YOUR ACTUAL CREDENTIALS
DB_HOST=localhost
DB_NAME=mawdqtvped_taxi_app
DB_USER=mawdqtvped_username_taxi_app
DB_PASS=@QWERTYasd

# Security - ⚠️ CHANGE THIS!
JWT_SECRET=your_super_secret_random_string_change_this_now

# CORS
CLIENT_URL=https://khasinogaming.com/app

# Optional
GOOGLE_MAPS_API_KEY=
STRIPE_SECRET_KEY=
```

**✅ Database credentials are already filled in!**

**⚠️ Important:** You MUST change:
- `JWT_SECRET` to a long random string (for security!)

**Generate secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔧 Step 4: Install Dependencies & Start Server

### Via SSH (Recommended):

1. **Connect to SSH:**
   ```bash
   ssh app@khasinogaming.com@server28.shared.spaceship.host
   ```

2. **Navigate to backend:**
   ```bash
   cd /home/mawdqtvped/khasinogaming.com/api
   ```

3. **Install dependencies:**
   ```bash
   npm install --production
   ```

4. **Start server with PM2 (keeps running):**
   ```bash
   # Install PM2 globally (one-time)
   npm install -g pm2
   
   # Start your app
   pm2 start index.js --name taxi-api
   
   # Save PM2 config
   pm2 save
   
   # Set PM2 to start on boot
   pm2 startup
   ```

5. **Check status:**
   ```bash
   pm2 status
   pm2 logs taxi-api
   ```

### Via cPanel Terminal (if SSH not available):

1. **Open Terminal in cPanel:**
   - **Advanced** → **Terminal**

2. **Run same commands as above**

---

## 🌐 Step 5: Configure Reverse Proxy

Your backend runs on `localhost:5000` but needs to be accessible at `https://khasinogaming.com/api`

### Option A: Using .htaccess (Apache)

Create `/home/mawdqtvped/khasinogaming.com/.htaccess`:

```apache
# Enable Rewrite Engine
RewriteEngine On

# API Proxy Rules
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

# WebSocket support (for Socket.io)
RewriteCond %{HTTP:Upgrade} =websocket [NC]
RewriteRule /api/(.*)           ws://localhost:5000/api/$1 [P,L]
```

### Option B: Using cPanel Application Manager

1. **In cPanel:**
   - Go to **Software** → **Setup Node.js App**
   
2. **Register Application:**
   - Node.js version: Latest (18.x or higher)
   - Application mode: Production
   - Application root: `/home/mawdqtvped/khasinogaming.com/api`
   - Application URL: `khasinogaming.com/api`
   - Application startup file: `index.js`
   
3. **Click "Create"**

### Option C: Contact Support

If above options don't work:
1. Contact your hosting support
2. Ask them to:
   - "Set up reverse proxy from /api to localhost:5000"
   - "Enable Node.js app at https://khasinogaming.com/api"

---

## ✅ Step 6: Test Backend

### Test from command line:

```bash
# Check if server is running
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","message":"Taxi App API is running"}
```

### Test from browser:

Visit: https://khasinogaming.com/api/health

**Expected:** JSON response with status "ok"

---

## 🔄 Step 7: Update Frontend

Now that backend is at `https://khasinogaming.com/api`, update your frontend:

**File: `web/index.html`** (already updated!)

The auto-detect code is already set:
```javascript
const isProduction = window.location.hostname === 'khasinogaming.com';
const API_BASE = isProduction 
    ? 'https://khasinogaming.com/api'  // ✅ This is correct!
    : 'http://localhost:5000/api';
```

**Just redeploy:**
```bash
powershell -ExecutionPolicy Bypass -File deploy-now.ps1
```

---

## 🐛 Troubleshooting

### Backend Not Starting:

**Check logs:**
```bash
pm2 logs taxi-api
```

**Common issues:**
- Missing dependencies: `npm install`
- Port in use: Change PORT in .env
- Permission errors: Check folder permissions

### Database Connection Failed:

**Check:**
1. Database exists in cPanel → MySQL Databases
2. User has privileges
3. Credentials in .env are correct (with prefix!)
4. MySQL service is running

**Test connection:**
```bash
mysql -u username_taxi_user -p
# Enter password
# If connects: database is accessible
```

### API Not Accessible from Web:

**Check:**
1. Backend running: `pm2 status`
2. Port 5000 listening: `netstat -tlnp | grep 5000`
3. Reverse proxy configured
4. Firewall allows port 5000

**Test locally first:**
```bash
curl http://localhost:5000/api/health
```

**If local works but external doesn't:**
- Reverse proxy not configured
- Contact hosting support

### CORS Errors:

**In backend** `server/index.js`, verify:
```javascript
app.use(cors({
  origin: 'https://khasinogaming.com',
  credentials: true
}));
```

---

## 🎯 Quick Setup Script

Create this script and run it via SSH:

```bash
#!/bin/bash
# setup-backend.sh

echo "Setting up Taxi App Backend..."

# Navigate to directory
cd /home/mawdqtvped/khasinogaming.com/api

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Stop existing instance
pm2 stop taxi-api 2>/dev/null || true

# Start app
echo "Starting server..."
pm2 start index.js --name taxi-api

# Save configuration
pm2 save

echo ""
echo "=========================================="
echo "Backend setup complete!"
echo "=========================================="
echo ""
echo "Test: curl http://localhost:5000/api/health"
echo "View logs: pm2 logs taxi-api"
echo "Check status: pm2 status"
echo ""
```

**Run it:**
```bash
chmod +x setup-backend.sh
./setup-backend.sh
```

---

## 📊 Production Checklist

Before going live:

- [ ] MySQL database created
- [ ] Database user created with privileges
- [ ] Backend files uploaded to `/api/` folder
- [ ] `.env` file created with correct credentials
- [ ] JWT_SECRET changed to secure random string
- [ ] Dependencies installed (`npm install`)
- [ ] Server started with PM2
- [ ] PM2 configured to restart on boot
- [ ] Reverse proxy configured (/.htaccess or cPanel)
- [ ] Backend accessible at https://khasinogaming.com/api/health
- [ ] Frontend updated and redeployed
- [ ] CORS configured correctly
- [ ] Firewall allows required ports

---

## 🔐 Security Best Practices

1. **Strong JWT Secret:**
   ```bash
   # Generate secure secret:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Secure Database Password:**
   - Use cPanel's password generator
   - At least 20 characters

3. **File Permissions:**
   ```bash
   chmod 600 .env  # Only owner can read
   chmod 755 index.js
   ```

4. **Environment Variables:**
   - Never commit .env to Git
   - Use different secrets for dev/production

5. **HTTPS Only:**
   - Your hosting already has SSL ✅
   - Force HTTPS in .htaccess

---

## 🚀 Deployment Workflow

### Manual Deployment:

1. Make changes locally
2. Test locally
3. Upload via FTP or GitHub Actions
4. SSH into server
5. `cd /home/mawdqtvped/khasinogaming.com/api`
6. `npm install` (if package.json changed)
7. `pm2 restart taxi-api`

### Automated Deployment:

1. Push to GitHub
2. GitHub Actions deploys automatically
3. SSH into server
4. `pm2 restart taxi-api`

---

## 📞 Support Commands

```bash
# Check server status
pm2 status

# View logs
pm2 logs taxi-api

# Restart server
pm2 restart taxi-api

# Stop server
pm2 stop taxi-api

# View environment
printenv | grep -i taxi

# Test database connection
mysql -u username_taxi_user -p

# Check if port is listening
netstat -tlnp | grep 5000

# Test API locally
curl http://localhost:5000/api/health
```

---

## ✅ Success Criteria

Your backend is working when:

1. ✅ `pm2 status` shows "online"
2. ✅ `curl http://localhost:5000/api/health` returns JSON
3. ✅ https://khasinogaming.com/api/health returns JSON
4. ✅ Frontend can register users
5. ✅ Frontend can login
6. ✅ No CORS errors in browser console

---

## 🎉 You're Done!

Your full-stack taxi app will be running at:
- **Frontend:** https://khasinogaming.com/app/
- **Backend:** https://khasinogaming.com/api/

**Fully functional with:**
- ✅ User registration
- ✅ Login system
- ✅ Ride requests
- ✅ Driver dashboard
- ✅ Real-time updates
- ✅ Database persistence

**Happy hosting!** 🚗🚀

