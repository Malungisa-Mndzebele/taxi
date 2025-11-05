# 🚗 Taxi App - Ride Sharing Application

A full-stack ride-sharing application built with React Native (mobile), Node.js/Express (backend), and React (web).

## ✨ Features

### For Passengers
- 👤 User registration and authentication
- 📍 Request rides with GPS-enabled maps
- 💰 Real-time fare calculation
- 🚗 Live ride tracking
- ⭐ Rate drivers

### For Drivers
- 👨‍✈️ Driver registration with vehicle info
- 🟢 Online/offline status management
- 📍 Real-time GPS location tracking
- 🚕 Accept and manage ride requests
- 💵 View earnings and ride history

### Technical Features
- 🔐 JWT authentication & authorization
- 🛡️ Rate limiting & CORS protection
- ✅ Input validation
- 📖 Complete API documentation (Swagger)
- 🗺️ GPS-enabled maps with live tracking
- 🧪 Test coverage

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, MongoDB, JWT, Swagger  
**Mobile:** React Native, React Navigation, React Native Maps  
**Web:** React, Progressive Web App (PWA)  
**Real-time:** Socket.IO

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- Android Studio (for Android) or Xcode (for iOS)

### Installation

```bash
# Install all dependencies
npm run install-all

# Set up environment variables (see below)

# Start the backend
cd server
npm start

# Start mobile app
cd client
npm start
npm run android  # or npm run ios
```

### Environment Variables

**server/.env:**
```env
JWT_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017/taxi-app
NODE_ENV=development
PORT=5000
```

**client/.env:**
```env
API_URL=http://localhost:5000
```

## 📖 API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:5000/api-docs
- **Quick Reference:** See `API_QUICK_REFERENCE.md`

## 📱 Running the Apps

### Mobile (React Native)
```bash
cd client
npm start
npm run android  # For Android
npm run ios      # For iOS (macOS only)
```

### Web
```bash
cd web
npm start
# Or open web/index.html in browser
```

## 🗺️ GPS & Maps

The app uses **React Native Maps** with live GPS tracking:
- ✅ Real-time location updates (updates every 10 meters)
- ✅ Live GPS tracking with custom markers
- ✅ Driver tracking for passengers
- ✅ Route visualization with polylines
- ✅ Nearby driver search with geospatial queries
- ✅ Auto-follow user location mode
- ✅ Custom map component (reusable)

**📖 Setup Guide:** See `MAPS_SETUP_GUIDE.md` for Google Maps API key setup and detailed instructions.

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Coverage report
npm run test:coverage
```

## 📁 Project Structure

```
taxi/
├── server/          # Backend API
│   ├── routes/      # API endpoints
│   ├── models/      # Database models
│   ├── middleware/  # Auth, validation
│   └── tests/       # Backend tests
├── client/          # React Native app
│   ├── src/         # App source code
│   ├── android/     # Android config
│   └── ios/         # iOS config
└── web/             # Web interface
```

## 🔑 Main API Endpoints

**Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`  
**Rides:** `/api/rides/request`, `/api/rides/:id/accept`, `/api/rides/:id/complete`  
**Drivers:** `/api/drivers/status`, `/api/drivers/location`, `/api/drivers/available`

See Swagger docs for complete API reference.

## 📄 License

MIT License

---

**Need help?** Check `API_QUICK_REFERENCE.md` for detailed API documentation.
