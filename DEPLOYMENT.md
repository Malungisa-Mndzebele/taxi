# 🚀 Deployment Guide

## Prerequisites

1. ✅ Fly.io account created
2. ✅ Fly.io CLI installed: https://fly.io/docs/hands-on/install-flyctl/
3. ✅ GitHub repository set up
4. ✅ MongoDB Atlas database (or other MongoDB hosting)

## 🔐 Security Setup

### Step 1: Revoke Compromised Token
**IMPORTANT:** If you've shared your Fly.io token anywhere, revoke it immediately:
1. Go to https://fly.io/user/personal_access_tokens
2. Find and revoke the exposed token
3. Create a new token

### Step 2: Add Secrets to GitHub
1. Go to your repo: https://github.com/Malungisa-Mndzebele/taxi/settings/secrets/actions
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `FLY_API_TOKEN` | Your Fly.io API token | `FlyV1 fm2_...` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/taxi` |
| `JWT_SECRET` | Secret for JWT tokens | Generate with `openssl rand -base64 32` |

## 📦 Initial Fly.io Setup

### Create Apps (One-time setup)

```bash
# Login to Fly.io
flyctl auth login

# Create staging app
flyctl apps create taxi-app-staging --org personal

# Create production app
flyctl apps create taxi-app --org personal
```

### Set Environment Secrets

**For Staging:**
```bash
flyctl secrets set \
  JWT_SECRET="your-jwt-secret-here" \
  MONGODB_URI="your-mongodb-uri-here" \
  -a taxi-app-staging
```

**For Production:**
```bash
flyctl secrets set \
  JWT_SECRET="your-jwt-secret-here" \
  MONGODB_URI="your-mongodb-uri-here" \
  -a taxi-app
```

## 🚀 Deployment Methods

### Method 1: Automatic via GitHub Actions (Recommended)

The CI/CD pipeline automatically deploys when you push to:
- **`develop` branch** → Deploys to staging
- **`main` branch** → Deploys to production

Just push your code:
```bash
git push origin main
```

GitHub Actions will:
1. ✅ Build the application
2. ✅ Deploy to Fly.io
3. ✅ Run health checks

### Method 2: Manual Deployment

**Deploy to Staging:**
```bash
flyctl deploy --config fly.staging.toml -a taxi-app-staging
```

**Deploy to Production:**
```bash
flyctl deploy --config fly.production.toml -a taxi-app
```

## 🔍 Monitoring & Management

### Check App Status
```bash
# Staging
flyctl status -a taxi-app-staging

# Production
flyctl status -a taxi-app
```

### View Logs
```bash
# Staging
flyctl logs -a taxi-app-staging

# Production
flyctl logs -a taxi-app
```

### Check Health
```bash
# Staging
curl https://taxi-app-staging.fly.dev/api/health

# Production
curl https://taxi-app.fly.dev/api/health
```

### Scale Application
```bash
# Scale production to 3 instances
flyctl scale count 3 -a taxi-app

# Scale memory
flyctl scale memory 2048 -a taxi-app
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (Free tier available)
3. Create database user
4. Whitelist Fly.io IPs or use `0.0.0.0/0` (all IPs)
5. Get connection string
6. Add to Fly.io secrets (see above)

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

## 🌐 Custom Domain (Optional)

### Add Custom Domain
```bash
# Add domain
flyctl certs add yourdomain.com -a taxi-app

# Check certificate status
flyctl certs show yourdomain.com -a taxi-app
```

### DNS Configuration
Add these records to your DNS provider:

| Type | Name | Value |
|------|------|-------|
| A | @ | `66.241.124.213` |
| AAAA | @ | `2a09:8280:1::1:1` |
| CNAME | www | `taxi-app.fly.dev` |

## 🔧 Troubleshooting

### Deployment Fails
```bash
# Check build logs
flyctl logs -a taxi-app-staging

# SSH into machine
flyctl ssh console -a taxi-app-staging

# Restart app
flyctl apps restart taxi-app-staging
```

### Database Connection Issues
```bash
# Verify secrets are set
flyctl secrets list -a taxi-app

# Test connection from app
flyctl ssh console -a taxi-app
# Then inside the container:
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e))"
```

### Health Check Failing
- Ensure `/api/health` endpoint returns 200 status
- Check if MongoDB is connected
- Verify PORT environment variable is set to 8080

## 📊 Current Configuration

### Staging
- **App Name:** `taxi-app-staging`
- **URL:** https://taxi-app-staging.fly.dev
- **Region:** `iad` (Ashburn, Virginia)
- **Instances:** 1 (auto-start/stop enabled)
- **Resources:** 1 CPU, 512MB RAM

### Production
- **App Name:** `taxi-app`
- **URL:** https://taxi-app.fly.dev
- **Region:** `iad` (Ashburn, Virginia)
- **Instances:** 2 minimum (always running)
- **Resources:** 2 CPUs, 1GB RAM
- **Auto-scaling:** 2-10 instances

## 💰 Cost Estimation

### Free Tier Includes:
- Up to 3 shared-cpu-1x VMs with 256MB RAM
- 160GB outbound data transfer

### Estimated Costs:
- **Staging:** ~$0-5/month (within free tier)
- **Production:** ~$15-30/month (2 instances, 1GB RAM each)

## 🔄 Rollback

If deployment fails or has issues:

```bash
# List releases
flyctl releases -a taxi-app

# Rollback to previous version
flyctl releases rollback <version> -a taxi-app
```

## 📝 Post-Deployment Checklist

- [ ] Verify health endpoint: `curl https://taxi-app.fly.dev/api/health`
- [ ] Test authentication: Register and login
- [ ] Test ride creation
- [ ] Test real-time features (Socket.IO)
- [ ] Check logs for errors: `flyctl logs -a taxi-app`
- [ ] Monitor performance in Fly.io dashboard
- [ ] Set up monitoring/alerts (optional)

## 🆘 Support

- **Fly.io Docs:** https://fly.io/docs/
- **Fly.io Community:** https://community.fly.io/
- **Status Page:** https://status.fly.io/

## 🔗 Useful Links

- **Staging App:** https://taxi-app-staging.fly.dev
- **Production App:** https://taxi-app.fly.dev
- **Fly.io Dashboard:** https://fly.io/dashboard
- **GitHub Actions:** https://github.com/Malungisa-Mndzebele/taxi/actions
