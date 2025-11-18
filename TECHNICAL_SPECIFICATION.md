# 🔧 Taxi App - Technical Specification

## Table of Contents
1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Architecture Specifications](#architecture-specifications)
4. [API Specifications](#api-specifications)
5. [Database Specifications](#database-specifications)
6. [Security Specifications](#security-specifications)
7. [Performance Specifications](#performance-specifications)
8. [Integration Specifications](#integration-specifications)
9. [Testing Specifications](#testing-specifications)
10. [Deployment Specifications](#deployment-specifications)

---

## Overview

### Purpose
This document provides detailed technical specifications for the Taxi App, including system requirements, architecture details, API contracts, database schemas, security measures, and deployment procedures.

### Scope
- Backend API server
- Mobile applications (iOS/Android)
- Web application (PWA)
- Real-time communication
- External service integrations

### Technology Stack Summary
- **Backend**: Node.js 16+, Express.js 4.x, MongoDB 7.x
- **Mobile**: React Native 0.72, React Navigation 6.x
- **Web**: React 18.x, Webpack 5.x
- **Real-time**: Socket.IO 4.x
- **Authentication**: JWT (jsonwebtoken)

---

## System Requirements

### Server Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **Network**: 100 Mbps
- **OS**: Ubuntu 20.04 LTS / CentOS 8 / Windows Server 2019

#### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 100 GB SSD
- **Network**: 1 Gbps
- **OS**: Ubuntu 22.04 LTS

#### Production Requirements
- **CPU**: 8+ cores
- **RAM**: 16+ GB
- **Storage**: 500 GB SSD (with backup)
- **Network**: 10 Gbps
- **Load Balancer**: Required
- **Database**: MongoDB Atlas (M10+ cluster)

### Client Requirements

#### Mobile (iOS)
- **iOS Version**: 13.0+
- **Device**: iPhone 6s or newer
- **Storage**: 50 MB minimum
- **Permissions**: Location, Camera, Notifications

#### Mobile (Android)
- **Android Version**: 8.0 (API 26)+
- **Device**: Any device with Google Play Services
- **Storage**: 50 MB minimum
- **Permissions**: Location, Camera, Notifications

#### Web Browser
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+

### Development Requirements
- **Node.js**: 16.x or 18.x
- **npm**: 8.x or 9.x
- **MongoDB**: 7.x (local or Atlas)
- **Git**: 2.30+
- **IDE**: VS Code / WebStorm / IntelliJ IDEA

---

## Architecture Specifications

### Backend Architecture

#### Application Structure
```
server/
├── index.js                 # Entry point
├── config/
│   ├── database.js          # MongoDB connection
│   └── environment.js       # Environment config
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── rides.js             # Ride management routes
│   ├── drivers.js           # Driver-specific routes
│   └── users.js             # User profile routes
├── controllers/
│   ├── authController.js    # Auth business logic
│   ├── rideController.js   # Ride business logic
│   └── driverController.js # Driver business logic
├── services/
│   ├── authService.js       # Auth service layer
│   ├── rideService.js       # Ride service layer
│   ├── fareCalculator.js    # Fare calculation
│   └── notificationService.js # Notifications
├── models/
│   ├── User.js              # User model
│   └── Ride.js              # Ride model
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── validation.js       # Input validation
│   ├── errorHandler.js      # Error handling
│   └── rateLimiter.js       # Rate limiting
├── utils/
│   ├── logger.js            # Logging utility
│   ├── constants.js         # Constants
│   └── helpers.js           # Helper functions
└── tests/
    ├── unit/                # Unit tests
    ├── integration/         # Integration tests
    └── e2e/                 # End-to-end tests
```

#### Request Flow
```
Client Request
    ↓
Express Middleware Stack
    ├── Helmet (Security)
    ├── CORS
    ├── Rate Limiter
    ├── Body Parser
    ├── Authentication
    └── Validation
    ↓
Route Handler
    ↓
Controller
    ↓
Service Layer
    ↓
Repository/Model
    ↓
Database
    ↓
Response
```

### Frontend Architecture

#### Mobile App Structure
```
client/
├── App.js                   # Root component
├── src/
│   ├── screens/            # Screen components
│   │   ├── AuthScreen.js
│   │   ├── HomeScreen.js
│   │   └── ...
│   ├── components/         # Reusable components
│   │   ├── MapComponent.js
│   │   ├── RideCard.js
│   │   └── ...
│   ├── context/            # Context providers
│   │   ├── AuthContext.js
│   │   └── SocketContext.js
│   ├── services/           # API services
│   │   └── api.js
│   ├── navigation/         # Navigation config
│   │   └── AppNavigator.js
│   ├── utils/              # Utilities
│   │   ├── constants.js
│   │   └── helpers.js
│   └── hooks/              # Custom hooks
│       ├── useAuth.js
│       └── useRideTracking.js
```

#### State Management
- **Global State**: React Context API
- **Local State**: React Hooks (useState, useReducer)
- **Server State**: React Query (future enhancement)

---

## API Specifications

### Base URL
```
Development: http://localhost:5000/api
Staging: https://staging-api.taxiapp.com/api
Production: https://api.taxiapp.com/api
```

### Authentication

#### Token Format
```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600, // seconds
  "refreshToken": "refresh_token_here"
}
```

#### Token Storage
- **Mobile**: Secure storage (Keychain/Keystore)
- **Web**: HttpOnly cookies (preferred) or localStorage

#### Token Refresh
```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

### Request Format

#### Headers
```http
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
X-Request-ID: <unique_request_id>
```

#### Request Body
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details
    }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `AUTH_INVALID` | 401 | Invalid authentication token |
| `AUTH_EXPIRED` | 401 | Authentication token expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Rate Limiting

#### Limits
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Ride Requests**: 10 requests per hour per user

#### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## Database Specifications

### MongoDB Configuration

#### Connection String Format
```
mongodb://[username:password@]host[:port][/database][?options]
```

#### Connection Options
```javascript
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
}
```

### Collection Specifications

#### Users Collection
```javascript
{
  _id: ObjectId,
  firstName: String (required, max: 50),
  lastName: String (required, max: 50),
  email: String (required, unique, indexed, lowercase),
  phone: String (required, unique, indexed),
  password: String (required, hashed, min: 6),
  role: Enum['passenger', 'driver'] (default: 'passenger'),
  driverStatus: Enum['online', 'offline'] (default: 'offline'),
  isDriver: Boolean (default: false),
  profilePicture: String (URL, max: 500),
  isVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  currentLocation: {
    type: 'Point',
    coordinates: [Number, Number], // [lng, lat]
    address: String,
    lastUpdated: Date
  },
  driverProfile: {
    licenseNumber: String (max: 20),
    vehicleInfo: {
      make: String (max: 50),
      model: String (max: 50),
      year: Number (min: 1900, max: current year + 1),
      color: String (max: 30),
      plateNumber: String (max: 20)
    },
    isOnline: Boolean (default: false),
    isAvailable: Boolean (default: false),
    rating: Number (min: 0, max: 5, default: 5.0),
    totalRides: Number (min: 0, default: 0)
  },
  preferences: Map<String, String>,
  deviceTokens: [String],
  createdAt: Date (indexed),
  updatedAt: Date
}
```

#### Rides Collection
```javascript
{
  _id: ObjectId,
  passenger: ObjectId (ref: 'User', required, indexed),
  driver: ObjectId (ref: 'User', indexed),
  status: Enum['requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled'] (default: 'requested', indexed),
  pickupLocation: {
    type: 'Point',
    coordinates: [Number, Number], // [lng, lat]
    address: String (required, max: 200)
  } (2dsphere index),
  dropoffLocation: {
    type: 'Point',
    coordinates: [Number, Number],
    address: String (required, max: 200)
  } (2dsphere index),
  distance: Number (required, min: 0, unit: km),
  estimatedDuration: Number (required, min: 0, unit: minutes),
  fare: {
    baseFare: Number (required, min: 0),
    distanceFare: Number (required, min: 0),
    timeFare: Number (required, min: 0),
    surgeMultiplier: Number (min: 1.0, max: 5.0, default: 1.0),
    totalFare: Number (required, min: 0)
  },
  payment: {
    method: Enum['card', 'cash', 'wallet'] (required),
    status: Enum['pending', 'completed', 'failed', 'refunded'] (default: 'pending'),
    transactionId: String,
    paidAt: Date
  },
  rating: {
    passengerRating: Number (min: 1, max: 5),
    driverRating: Number (min: 1, max: 5),
    passengerReview: String (max: 500),
    driverReview: String (max: 500)
  },
  timeline: {
    requestedAt: Date (default: Date.now),
    acceptedAt: Date,
    arrivedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date
  },
  cancellationReason: String (max: 200),
  notes: String (max: 500),
  createdAt: Date (indexed),
  updatedAt: Date
}
```

### Indexes

#### Users Collection Indexes
```javascript
// Unique indexes
{ email: 1 } // unique
{ phone: 1 } // unique

// Geospatial index
{ 'currentLocation.coordinates': '2dsphere' }

// Compound indexes
{ role: 1, driverStatus: 1 }
{ role: 1, 'driverProfile.isOnline': 1, 'driverProfile.isAvailable': 1 }
```

#### Rides Collection Indexes
```javascript
// Single field indexes
{ passenger: 1 }
{ driver: 1 }
{ status: 1 }
{ createdAt: -1 }

// Geospatial indexes
{ 'pickupLocation': '2dsphere' }
{ 'dropoffLocation': '2dsphere' }

// Compound indexes
{ passenger: 1, status: 1 }
{ driver: 1, status: 1 }
{ passenger: 1, createdAt: -1 }
{ driver: 1, createdAt: -1 }
{ status: 1, createdAt: -1 }
```

### Data Validation Rules

#### User Validation
- Email: Valid email format, unique
- Phone: Valid phone format (E.164), unique
- Password: Minimum 6 characters, must contain alphanumeric
- Name: 2-50 characters, alphanumeric and spaces only

#### Ride Validation
- Coordinates: Valid longitude (-180 to 180), latitude (-90 to 90)
- Distance: Positive number, maximum 500 km
- Duration: Positive number, maximum 300 minutes
- Fare: Positive number, maximum $1000

---

## Security Specifications

### Authentication & Authorization

#### JWT Token Specification
```javascript
{
  algorithm: 'HS256',
  expiresIn: '1h',
  issuer: 'taxi-app',
  audience: 'taxi-app-users'
}
```

#### Token Payload
```javascript
{
  userId: ObjectId,
  email: String,
  role: String,
  iat: Number,
  exp: Number
}
```

#### Password Requirements
- Minimum length: 6 characters
- Hashing algorithm: bcrypt
- Salt rounds: 10
- No password storage in plain text

### Data Encryption

#### At Rest
- Database: MongoDB encryption at rest (if available)
- Files: Encrypted file storage (S3 server-side encryption)

#### In Transit
- HTTPS: TLS 1.3 minimum
- WebSocket: WSS (secure WebSocket)

### Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### Input Validation

#### Validation Rules
- All user inputs validated and sanitized
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- CSRF protection (token-based)

#### Validation Library
- **Backend**: express-validator
- **Frontend**: Form validation libraries

---

## Performance Specifications

### Response Time Requirements

#### API Response Times
- **Authentication**: < 500ms
- **Ride Request**: < 1s
- **Location Updates**: < 200ms
- **Ride History**: < 1s
- **Driver Search**: < 2s

#### Database Query Times
- **Simple queries**: < 50ms
- **Complex queries**: < 200ms
- **Geospatial queries**: < 500ms

### Caching Strategy

#### Cache Layers
1. **Application Cache**: In-memory cache for frequently accessed data
2. **Redis Cache**: Session data, rate limiting, temporary data
3. **CDN Cache**: Static assets, API responses (if applicable)

#### Cache TTL
- **User data**: 5 minutes
- **Ride data**: 1 minute
- **Driver locations**: 30 seconds
- **Static data**: 1 hour

### Scalability Targets

#### Concurrent Users
- **Development**: 100 concurrent users
- **Staging**: 1,000 concurrent users
- **Production**: 10,000+ concurrent users

#### Request Throughput
- **Peak**: 1,000 requests/second
- **Average**: 500 requests/second

---

## Integration Specifications

### Google Maps API

#### Integration Details
- **API Key**: Required, stored in environment variables
- **Services Used**: 
  - Geocoding API
  - Directions API
  - Places API
- **Rate Limits**: As per Google Maps API limits

#### Usage
```javascript
// Geocoding
GET https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={API_KEY}

// Directions
GET https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&key={API_KEY}
```

### Payment Gateway (Stripe)

#### Integration Details
- **API Version**: 2023-10-16
- **Webhook Endpoint**: `/api/webhooks/stripe`
- **Supported Methods**: Card, Wallet

#### Payment Flow
```
1. Create Payment Intent
2. Confirm Payment
3. Process Payment
4. Update Ride Status
5. Send Receipt
```

### Push Notifications (FCM)

#### Integration Details
- **Service**: Firebase Cloud Messaging
- **Platforms**: iOS, Android
- **Message Format**: JSON

#### Notification Types
- New ride request (driver)
- Ride accepted (passenger)
- Driver arrived (passenger)
- Ride completed (both)

### SMS Service (Twilio)

#### Integration Details
- **Service**: Twilio SMS API
- **Use Cases**: Phone verification, ride updates
- **Rate Limits**: As per Twilio limits

---

## Testing Specifications

### Test Coverage Requirements

#### Minimum Coverage
- **Unit Tests**: 80% coverage
- **Integration Tests**: 70% coverage
- **E2E Tests**: Critical paths only

#### Test Types
1. **Unit Tests**: Individual functions/components
2. **Integration Tests**: API endpoints, database operations
3. **E2E Tests**: Complete user flows
4. **Performance Tests**: Load testing, stress testing

### Testing Tools

#### Backend
- **Framework**: Jest
- **HTTP Testing**: Supertest
- **Database**: mongodb-memory-server

#### Frontend
- **Framework**: Jest
- **Component Testing**: React Native Testing Library
- **E2E**: Detox (mobile), Cypress (web)

### Test Data

#### Test Users
- Passenger test account
- Driver test account
- Admin test account

#### Test Scenarios
- Successful ride flow
- Ride cancellation
- Payment processing
- Error handling

---

## Deployment Specifications

### Environment Configuration

#### Development
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taxi-app-dev
JWT_SECRET=dev-secret-key
LOG_LEVEL=debug
```

#### Staging
```env
NODE_ENV=staging
PORT=5000
MONGODB_URI=mongodb+srv://staging-cluster/taxi-app-staging
JWT_SECRET=staging-secret-key
LOG_LEVEL=info
```

#### Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://production-cluster/taxi-app
JWT_SECRET=production-secret-key
LOG_LEVEL=warn
```

### Deployment Process

#### Steps
1. **Build**: Compile and build application
2. **Test**: Run test suite
3. **Deploy**: Deploy to staging/production
4. **Verify**: Health checks and smoke tests
5. **Monitor**: Monitor logs and metrics

#### Deployment Methods
- **Docker**: Containerized deployment
- **Kubernetes**: Orchestrated deployment
- **CI/CD**: Automated deployment pipeline

### Monitoring & Logging

#### Logging
- **Format**: JSON structured logging
- **Levels**: error, warn, info, debug
- **Storage**: Centralized logging system (ELK stack)

#### Monitoring
- **Metrics**: Application performance metrics
- **Alerts**: Error rate, response time, availability
- **Tools**: New Relic, Datadog, or similar

---

## API Endpoint Specifications

### Authentication Endpoints

#### POST /api/auth/register
```javascript
Request: {
  firstName: String (required),
  lastName: String (required),
  email: String (required, valid email),
  phone: String (required, valid phone),
  password: String (required, min: 6),
  role: Enum['passenger', 'driver'] (optional, default: 'passenger')
}

Response: {
  success: true,
  data: {
    user: UserObject,
    token: String
  }
}
```

#### POST /api/auth/login
```javascript
Request: {
  email: String (required),
  password: String (required)
}

Response: {
  success: true,
  data: {
    user: UserObject,
    token: String
  }
}
```

### Ride Endpoints

#### POST /api/rides/request
```javascript
Request: {
  pickupLocation: {
    coordinates: [Number, Number], // [lng, lat]
    address: String
  },
  dropoffLocation: {
    coordinates: [Number, Number],
    address: String
  },
  distance: Number,
  estimatedDuration: Number,
  paymentMethod: Enum['card', 'cash', 'wallet']
}

Response: {
  success: true,
  data: {
    ride: RideObject,
    availableDrivers: Number
  }
}
```

#### PUT /api/rides/:id/accept
```javascript
Request: {
  // No body required
}

Response: {
  success: true,
  data: {
    ride: RideObject
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: Technical Team

