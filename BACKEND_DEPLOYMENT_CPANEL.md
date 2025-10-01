# Production Environment Variables for cPanel
# ✅ CONFIGURED FOR: khasinogaming.com
# Copy this to .env after uploading to server

# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration - ✅ YOUR ACTUAL CREDENTIALS
DB_HOST=localhost
DB_NAME=mawdqtvped_taxi_app
DB_USER=mawdqtvped_username_taxi_app
DB_PASS=@QWERTYasd

# Security - ⚠️ CRITICAL: CHANGE THIS!
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_STRING_123456789

# CORS
CLIENT_URL=https://khasinogaming.com/app

# Optional: API Keys (add if needed)
GOOGLE_MAPS_API_KEY=
STRIPE_SECRET_KEY=

