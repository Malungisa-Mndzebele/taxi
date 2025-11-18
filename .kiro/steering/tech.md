# Technology Stack

## Backend

- **Runtime**: Node.js 16+ (18.x recommended)
- **Framework**: Express.js 4.x
- **Database**: MongoDB 7.x with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) with bcryptjs for password hashing
- **Real-time**: Socket.IO 4.x for WebSocket communication
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Payment**: Stripe integration
- **File Upload**: Multer

## Mobile (React Native)

- **Framework**: React Native 0.72.6, React 18.2.0
- **Navigation**: React Navigation 6.x (Stack, Bottom Tabs)
- **Maps**: React Native Maps 1.7.1
- **UI Components**: React Native Paper 5.x, React Native Elements 3.x
- **State Management**: React Context API with hooks
- **Storage**: AsyncStorage, React Native Keychain (secure storage)
- **HTTP Client**: Axios
- **Real-time**: socket.io-client
- **Permissions**: react-native-permissions, react-native-geolocation-service
- **Notifications**: react-native-push-notification

## Web

- **Framework**: React 18.x
- **Build Tool**: Webpack 5.x
- **PWA**: Service Workers, Web Manifest
- **HTTP Client**: Axios

## Testing

- **Framework**: Jest 29.x
- **API Testing**: Supertest
- **Test Database**: mongodb-memory-server
- **Component Testing**: React Native Testing Library, @testing-library/jest-native
- **Coverage Target**: 80%+ overall, 85%+ for unit tests

## Development Tools

- **Package Manager**: npm 8.x+
- **Process Manager**: nodemon (development), concurrently (multi-process)
- **Linting**: ESLint
- **Version Control**: Git

## Deployment

- **Platform**: Fly.io (staging and production)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Database Hosting**: MongoDB Atlas (recommended for production)

## Common Commands

### Installation
```bash
# Install all dependencies (root, server, client, web)
npm run install-all

# Install individual packages
cd server && npm install
cd client && npm install
cd web && npm install
```

### Development
```bash
# Start backend server (with auto-reload)
cd server && npm run dev
# or from root: npm run server

# Start mobile app
cd client && npm start
npm run android  # Android
npm run ios      # iOS (macOS only)

# Start web app
cd web && node server.js
# or from root: npm run web

# Run all (server + web)
npm run dev-all
```

### Testing
```bash
# Run all tests
cd server && npm test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:performance  # Performance tests
npm run test:security     # Security tests

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode (optimized for CI/CD)
npm run test:ci
```

### Building
```bash
# Build Android APK
cd client && npm run build:android

# Build iOS (macOS only)
cd client && npm run build:ios

# Build web
cd web && npm run web:build
```

### Deployment
```bash
# Deploy to Fly.io staging
flyctl deploy --config fly.staging.toml -a taxi-app-staging

# Deploy to Fly.io production
flyctl deploy --config fly.production.toml -a taxi-app

# Set environment secrets
flyctl secrets set JWT_SECRET=xxx MONGODB_URI=xxx -a taxi-app
```

## Environment Variables

### Server (.env)
```
NODE_ENV=development|staging|production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taxi-app
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

### Client (.env)
```
API_URL=http://localhost:5000
GOOGLE_MAPS_API_KEY=your-api-key
```

### Web (.env)
```
REACT_APP_API_URL=http://localhost:5000
```
