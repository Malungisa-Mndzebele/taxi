# Production Environment Variables for cPanel
# Copy this to .env after uploading to server

# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
# Replace with your actual cPanel database details
MONGODB_URI=mongodb://localhost:27017/taxi-app
# OR if using MySQL (recommended for cPanel):
# DB_HOST=localhost
# DB_NAME=username_taxi_app
# DB_USER=username_taxi_user
# DB_PASS=your_database_password

# Security
# IMPORTANT: Generate a secure random string!
JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_STRING_123456789

# CORS
CLIENT_URL=https://khasinogaming.com/app

# Optional: API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key

