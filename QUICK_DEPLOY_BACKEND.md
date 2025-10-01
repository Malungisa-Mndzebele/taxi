# ⚡ Quick Backend Deployment

## ✅ Database Ready!

Your MySQL database is already set up:
- **Database:** `mawdqtvped_taxi_app`
- **User:** `mawdqtvped_username_taxi_app`  
- **Password:** `@QWERTYasd`
- **Host:** `localhost`

---

## 🚀 Quick Deploy (15 Minutes)

### Step 1: Generate JWT Secret (1 min)

Run this locally:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output (long random string).

---

### Step 2: Create .env File (2 min)

Create file: `/home/mawdqtvped/khasinogaming.com/api/.env`

**Copy this content:**
```env
PORT=5000
NODE_ENV=production

DB_HOST=localhost
DB_NAME=mawdqtvped_taxi_app
DB_USER=mawdqtvped_username_taxi_app
DB_PASS=@QWERTYasd

JWT_SECRET=PASTE_YOUR_GENERATED_SECRET_HERE
CLIENT_URL=https://khasinogaming.com/app
```

**Replace** `PASTE_YOUR_GENERATED_SECRET_HERE` with your JWT secret from Step 1.

---

### Step 3: Upload Backend Files (5 min)

**Via FTP:**
- Server: `server28.shared.spaceship.host`
- User: `app@khasinogaming.com`
- Password: `@QWERTYasd`

**Upload to:** `/home/mawdqtvped/khasinogaming.com/api/`

**Upload these:**
```
server/
├── middleware/
├── models/
├── routes/
├── index.js
├── package.json
└── .env (from Step 2)
```

---

### Step 4: Setup Server (5 min)

**SSH into server:**
```bash
ssh app@khasinogaming.com@server28.shared.spaceship.host
```

**Run these commands:**
```bash
# Navigate to backend
cd /home/mawdqtvped/khasinogaming.com/api

# Install dependencies
npm install --production

# Install PM2
npm install -g pm2

# Start server
pm2 start index.js --name taxi-api

# Save configuration
pm2 save

# Setup auto-restart
pm2 startup
```

---

### Step 5: Configure Reverse Proxy (2 min)

**Create/Edit:** `/home/mawdqtvped/khasinogaming.com/.htaccess`

**Add these lines:**
```apache
RewriteEngine On

# Proxy API requests to Node.js server
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

# WebSocket support
RewriteCond %{HTTP:Upgrade} =websocket [NC]
RewriteRule /api/(.*)  ws://localhost:5000/api/$1 [P,L]
```

**OR via cPanel:**
- **Software** → **Setup Node.js App**
- Application root: `/home/mawdqtvped/khasinogaming.com/api`
- Application URL: `khasinogaming.com/api`
- Startup file: `index.js`

---

### Step 6: Test (1 min)

**Test from SSH:**
```bash
curl http://localhost:5000/api/health
```

**Test from browser:**
```
https://khasinogaming.com/api/health
```

**Expected response:**
```json
{"status":"ok","message":"Taxi App API is running"}
```

---

## ✅ Success Checklist

- [ ] JWT_SECRET generated and added to .env
- [ ] .env file created on server
- [ ] Backend files uploaded via FTP
- [ ] Dependencies installed (`npm install`)
- [ ] Server started with PM2
- [ ] PM2 saved and configured for auto-start
- [ ] Reverse proxy configured (.htaccess or cPanel)
- [ ] http://localhost:5000/api/health works (SSH test)
- [ ] https://khasinogaming.com/api/health works (browser)
- [ ] Frontend can connect (no CORS errors)

---

## 🎯 Useful Commands

```bash
# Check server status
pm2 status

# View logs
pm2 logs taxi-api

# Restart server
pm2 restart taxi-api

# Stop server
pm2 stop taxi-api

# Test database connection
mysql -u mawdqtvped_username_taxi_app -p mawdqtvped_taxi_app
```

---

## 🐛 Troubleshooting

### Backend not starting?
```bash
cd /home/mawdqtvped/khasinogaming.com/api
pm2 logs taxi-api
# Check logs for errors
```

### Database connection failed?
- Verify credentials in .env
- Test: `mysql -u mawdqtvped_username_taxi_app -p`
- Password: `@QWERTYasd`

### API not accessible from web?
- Check reverse proxy (.htaccess)
- Verify port 5000 is listening: `netstat -tlnp | grep 5000`
- Contact hosting support if needed

---

## 🎉 Done!

Your backend is now running at:
**https://khasinogaming.com/api/**

Your full app:
- **Frontend:** https://khasinogaming.com/app/
- **Backend:** https://khasinogaming.com/api/

**Everything is connected!** 🚀

