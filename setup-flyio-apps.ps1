# Fly.io App Setup Script
# Run this script to create the Fly.io apps for staging and production

Write-Host "🚀 Setting up Fly.io apps for Taxi App" -ForegroundColor Cyan
Write-Host ""

# Check if flyctl is installed
try {
    $flyctlVersion = flyctl version
    Write-Host "✅ Fly.io CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Fly.io CLI is not installed" -ForegroundColor Red
    Write-Host "Install it from: https://fly.io/docs/hands-on/install-flyctl/" -ForegroundColor Yellow
    exit 1
}

# Login check
Write-Host ""
Write-Host "Checking authentication..." -ForegroundColor Cyan
try {
    flyctl auth whoami
    Write-Host "✅ Authenticated with Fly.io" -ForegroundColor Green
} catch {
    Write-Host "❌ Not authenticated. Please run: flyctl auth login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Creating Fly.io apps..." -ForegroundColor Cyan
Write-Host ""

# Create staging app
Write-Host "1️⃣  Creating staging app: taxi-app-staging" -ForegroundColor Yellow
try {
    flyctl apps create taxi-app-staging --org personal
    Write-Host "✅ Staging app created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Staging app might already exist or there was an error" -ForegroundColor Yellow
}

Write-Host ""

# Create production app
Write-Host "2️⃣  Creating production app: taxi-app" -ForegroundColor Yellow
try {
    flyctl apps create taxi-app --org personal
    Write-Host "✅ Production app created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Production app might already exist or there was an error" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Set up MongoDB Atlas (if you haven't already):" -ForegroundColor White
Write-Host "   https://www.mongodb.com/cloud/atlas" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Generate a JWT secret:" -ForegroundColor White
Write-Host "   openssl rand -base64 32" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Set secrets for STAGING:" -ForegroundColor White
Write-Host '   flyctl secrets set JWT_SECRET="your-jwt-secret" MONGODB_URI="your-mongodb-uri" -a taxi-app-staging' -ForegroundColor Gray
Write-Host ""
Write-Host "4. Set secrets for PRODUCTION:" -ForegroundColor White
Write-Host '   flyctl secrets set JWT_SECRET="your-jwt-secret" MONGODB_URI="your-mongodb-uri" -a taxi-app' -ForegroundColor Gray
Write-Host ""
Write-Host "5. Add secrets to GitHub:" -ForegroundColor White
Write-Host "   Go to: https://github.com/Malungisa-Mndzebele/taxi/settings/secrets/actions" -ForegroundColor Gray
Write-Host "   Add: MONGODB_URI and JWT_SECRET" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Push to main branch to trigger deployment:" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Setup complete! Your apps are ready for deployment." -ForegroundColor Green
