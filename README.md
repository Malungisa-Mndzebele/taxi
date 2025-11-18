# 🚗 Taxi App - Ride Sharing Application

A full-stack ride-sharing application built with React Native (mobile), Node.js/Express (backend), and React (web). Deployed on [Fly.io](https://fly.io) with comprehensive testing infrastructure.

## ✨ Features

### For Passengers
- 👤 User registration and authentication
- 📍 Request rides with GPS-enabled maps
- 💰 Real-time fare calculation with surge pricing
- 🚗 Live ride tracking
- ⭐ Rate drivers
- 💳 Multiple payment methods (card, cash, wallet)
- 📱 Push notifications

### For Drivers
- 👨‍✈️ Driver registration with vehicle info
- 🟢 Online/offline status management
- 📍 Real-time GPS location tracking
- 🚕 Accept and manage ride requests
- 💵 View earnings and ride history
- 📊 Driver statistics and analytics
- 🎯 Nearby ride requests

### Technical Features
- 🔐 JWT authentication & authorization
- 🛡️ Rate limiting & CORS protection
- ✅ Input validation
- 📖 Complete API documentation (Swagger)
- 🗺️ GPS-enabled maps with live tracking
- 🧪 Comprehensive test coverage (Unit, Integration, E2E, Performance)
- 🚀 CI/CD with GitHub Actions
- ☁️ Fly.io deployment ready
- 🔄 Real-time updates with Socket.IO

## 🛠️ Tech Stack

**Backend:**
- Node.js 18+, Express.js 4.x
- MongoDB 7.x (with geospatial queries)
- JWT authentication
- Socket.IO for real-time features
- Swagger/OpenAPI documentation
- **Deployment:** [Fly.io](https://fly.io)

**Mobile:**
- React Native 0.72
- React Navigation 6.x
- React Native Maps
- React Native Paper (UI components)

**Web:**
- React 18.x
- Progressive Web App (PWA)
- Service Workers

**Testing:**
- Jest (unit, integration, E2E tests)
- Supertest (API testing)
- MongoDB Memory Server (test database)
- Performance and load testing

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

### Test Commands

```bash
# Run all tests
cd server
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # End-to-end tests only
npm run test:performance   # Performance tests
npm run test:security      # Security tests

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch

# CI optimized
npm run test:ci
```

### Test Structure

```
server/tests/
├── unit/              # Unit tests (services, utils, middleware)
├── integration/       # Integration tests (routes, models)
├── e2e/               # End-to-end tests (complete flows)
├── performance/      # Performance and load tests
├── security/          # Security tests
├── helpers/           # Test utilities and factories
└── fixtures/          # Test data fixtures
```

### Test Coverage

- **Overall Coverage**: 80%+ target
- **Unit Tests**: 85%+ coverage
- **Integration Tests**: 75%+ coverage
- **Critical Paths**: 100% coverage

**📖 Testing Documentation:**
- [Comprehensive Testing Strategy](./COMPREHENSIVE_TESTING_STRATEGY.md)
- [Testing Implementation Guide](./TESTING_IMPLEMENTATION_GUIDE.md)
- [Test Fixes Report](./TEST_FIXES_REPORT.md)

## 📁 Project Structure

```
taxi/
├── server/                    # Backend API
│   ├── routes/                # API endpoints
│   │   ├── auth.js           # Authentication routes
│   │   ├── rides.js          # Ride management routes
│   │   ├── drivers.js        # Driver-specific routes
│   │   └── users.js          # User profile routes
│   ├── models/                # Database models
│   │   ├── User.js           # User model
│   │   └── Ride.js           # Ride model
│   ├── services/              # Business logic services
│   │   └── fareCalculator.js # Fare calculation service
│   ├── middleware/            # Express middleware
│   │   ├── auth.js           # JWT authentication
│   │   └── validation.js    # Input validation
│   ├── tests/                 # Backend tests
│   │   ├── unit/             # Unit tests
│   │   ├── integration/       # Integration tests
│   │   ├── e2e/              # End-to-end tests
│   │   ├── performance/      # Performance tests
│   │   └── helpers/          # Test utilities
│   ├── Dockerfile             # Docker configuration
│   └── index.js              # Server entry point
├── client/                     # React Native app
│   ├── src/
│   │   ├── screens/          # Screen components
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React Context providers
│   │   ├── services/         # API services
│   │   └── __tests__/        # Component tests
│   ├── android/               # Android configuration
│   └── ios/                   # iOS configuration
├── web/                        # Web interface (PWA)
├── .github/
│   └── workflows/            # CI/CD workflows
│       └── test-and-deploy.yml
├── fly.staging.toml           # Fly.io staging config
├── fly.production.toml        # Fly.io production config
└── Documentation/
    ├── COMPREHENSIVE_DESIGN.md
    ├── COMPREHENSIVE_TESTING_STRATEGY.md
    ├── TECHNICAL_SPECIFICATION.md
    ├── API_DOCUMENTATION_TEMPLATES.md
    └── VISUAL_DIAGRAMS.md
```

## 🔑 Main API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-phone` - Verify phone number

### Rides
- `POST /api/rides/request` - Request a ride
- `GET /api/rides/:id` - Get ride details
- `POST /api/rides/:id/accept` - Accept ride (driver)
- `POST /api/rides/:id/arrive` - Mark arrival (driver)
- `PUT /api/rides/:id/start` - Start ride (driver)
- `PUT /api/rides/:id/complete` - Complete ride (driver)
- `PUT /api/rides/:id/cancel` - Cancel ride
- `GET /api/rides/active` - Get active rides
- `GET /api/rides/history` - Get ride history

### Drivers
- `GET /api/drivers/status` - Get driver status
- `PUT /api/drivers/status` - Update driver status
- `PUT /api/drivers/location` - Update driver location
- `GET /api/drivers/available` - Get available drivers
- `GET /api/drivers/earnings` - Get driver earnings
- `PUT /api/drivers/profile` - Update driver profile

### Users
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/location` - Update user location
- `PUT /api/users/preferences` - Update preferences

**📖 Complete API Documentation:**
- **Swagger UI:** http://localhost:5000/api-docs
- **Quick Reference:** See `API_QUICK_REFERENCE.md`
- **API Templates:** See `API_DOCUMENTATION_TEMPLATES.md`

## 🚀 Deployment

### Fly.io Deployment

The backend is configured for deployment on [Fly.io](https://fly.io), a modern cloud platform for running full-stack apps globally.

#### Prerequisites
- Fly.io account ([Sign up here](https://fly.io))
- Fly.io CLI installed

#### Setup

```bash
# Install Fly.io CLI
# macOS
brew install flyctl

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Linux
curl -L https://fly.io/install.sh | sh
```

#### Deploy

```bash
# Login to Fly.io
flyctl auth login

# Set secrets
flyctl secrets set \
  JWT_SECRET=your-secret-key \
  MONGODB_URI=your-mongodb-uri \
  NODE_ENV=production \
  -a taxi-app

# Deploy to staging
flyctl deploy --config fly.staging.toml -a taxi-app-staging

# Deploy to production
flyctl deploy --config fly.production.toml -a taxi-app
```

#### Configuration Files
- `fly.staging.toml` - Staging environment configuration
- `fly.production.toml` - Production environment configuration
- `server/Dockerfile` - Docker configuration for Fly.io

**📖 Deployment Guide:** See `TESTING_IMPLEMENTATION_GUIDE.md` for detailed Fly.io setup instructions.

## 🔄 CI/CD Pipeline

The project includes GitHub Actions workflows for automated testing and deployment:

- **Automated Testing**: Runs on every push and pull request
- **Test Suites**: Unit, Integration, E2E, Performance, Security
- **Automatic Deployment**: Deploys to Fly.io on merge to main/develop
- **Health Checks**: Verifies deployment success

**Workflow File:** `.github/workflows/test-and-deploy.yml`

## 📚 Documentation

### Design & Architecture
- [Comprehensive Design Document](./COMPREHENSIVE_DESIGN.md) - Complete system design
- [Visual Diagrams](./VISUAL_DIAGRAMS.md) - Architecture and flow diagrams
- [Wireframes & Mockups](./WIREFRAMES_MOCKUPS.md) - UI/UX specifications
- [Technical Specification](./TECHNICAL_SPECIFICATION.md) - Technical implementation details

### Testing
- [Comprehensive Testing Strategy](./COMPREHENSIVE_TESTING_STRATEGY.md) - Complete testing approach
- [Testing Implementation Guide](./TESTING_IMPLEMENTATION_GUIDE.md) - Setup and usage guide
- [Test Fixes Report](./TEST_FIXES_REPORT.md) - Test fixes documentation

### API
- [API Quick Reference](./API_QUICK_REFERENCE.md) - Quick API reference
- [API Documentation Templates](./API_DOCUMENTATION_TEMPLATES.md) - API documentation templates

### Setup Guides
- [Maps Setup Guide](./MAPS_SETUP_GUIDE.md) - Google Maps integration
- [Design Documentation Index](./DESIGN_DOCUMENTATION_INDEX.md) - Documentation index

## 🏗️ Architecture Highlights

### Backend Services
- **Fare Calculator Service**: Dynamic fare calculation with surge pricing
- **Authentication Service**: JWT-based authentication
- **Ride Service**: Complete ride lifecycle management
- **Driver Service**: Driver status and location management

### Real-time Features
- **Socket.IO**: Real-time location updates
- **Live Tracking**: Driver location broadcasting
- **Status Updates**: Instant ride status notifications

### Database
- **MongoDB**: Document database with geospatial indexes
- **Geospatial Queries**: Nearby driver search
- **Indexes**: Optimized for performance

## 🧪 Test Results

Current test status:
- **Test Suites**: 5 passed, 6 failed (11 total)
- **Tests**: 141 passed, 45 failed (186 total)
- **Coverage**: 80%+ target

Run `npm test` in the server directory to see current status.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License

---

## 📞 Support & Resources

- **API Documentation**: http://localhost:5000/api-docs
- **Quick Reference**: `API_QUICK_REFERENCE.md`
- **Testing Guide**: `TESTING_IMPLEMENTATION_GUIDE.md`
- **Design Documentation**: `COMPREHENSIVE_DESIGN.md`

**Need help?** Check the documentation files listed above or review the test examples in `server/tests/`.
