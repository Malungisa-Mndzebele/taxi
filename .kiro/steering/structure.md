# Project Structure

## Repository Layout

```
taxi/
├── server/              # Backend API (Node.js/Express)
├── client/              # Mobile app (React Native)
├── web/                 # Web app (React PWA)
├── .github/workflows/   # CI/CD pipelines
├── .kiro/               # Kiro configuration and specs
├── fly.*.toml           # Fly.io deployment configs
└── Documentation files  # Design, specs, guides
```

## Server Structure (`server/`)

```
server/
├── index.js                    # Entry point, Express setup, Socket.IO
├── swagger.js                  # Swagger/OpenAPI configuration
├── Dockerfile                  # Docker configuration for deployment
├── .env / .env.test           # Environment variables
├── routes/                     # API route handlers
│   ├── auth.js                # Authentication endpoints
│   ├── rides.js               # Ride management endpoints
│   ├── drivers.js             # Driver-specific endpoints
│   └── users.js               # User profile endpoints
├── models/                     # Mongoose schemas
│   ├── User.js                # User model (passengers & drivers)
│   └── Ride.js                # Ride model
├── services/                   # Business logic layer
│   └── fareCalculator.js      # Fare calculation service
├── middleware/                 # Express middleware
│   ├── auth.js                # JWT authentication middleware
│   └── validation.js          # Input validation middleware
├── utils/                      # Utility functions
│   └── logger.js              # Logging utility
└── tests/                      # Test suites
    ├── unit/                  # Unit tests (services, utils)
    ├── integration/           # Integration tests (routes, DB)
    ├── e2e/                   # End-to-end tests (full flows)
    ├── performance/           # Performance/load tests
    ├── security/              # Security tests
    ├── helpers/               # Test utilities and factories
    └── fixtures/              # Test data fixtures
```

## Client Structure (`client/`)

```
client/
├── App.js                      # Root component
├── android/                    # Android native configuration
├── ios/                        # iOS native configuration
├── .env                        # Environment variables
└── src/
    ├── screens/               # Screen components (pages)
    ├── components/            # Reusable UI components
    ├── context/               # React Context providers
    ├── services/              # API service layer
    ├── navigation/            # Navigation configuration
    ├── utils/                 # Utility functions
    ├── hooks/                 # Custom React hooks
    └── __tests__/             # Component tests
```

## Web Structure (`web/`)

```
web/
├── index.html                  # Main HTML file
├── server.js                   # Simple web server
├── sw.js                       # Service worker (PWA)
├── manifest.json               # PWA manifest
├── icon-*.png / icon.svg      # App icons
└── tests/                      # Web tests
```

## Architecture Patterns

### Backend Layered Architecture

**Request Flow:**
```
Client Request
    ↓
Middleware Stack (security, auth, validation)
    ↓
Route Handler (routes/*.js)
    ↓
Service Layer (services/*.js) - Business logic
    ↓
Model/Repository (models/*.js) - Data access
    ↓
Database (MongoDB)
```

**Key Principles:**
- Routes handle HTTP concerns (request/response)
- Services contain business logic
- Models define data schemas and database operations
- Middleware handles cross-cutting concerns (auth, validation, logging)

### Frontend Component Structure

**Mobile App Pattern:**
- **Screens**: Full-page components (e.g., HomeScreen, RideScreen)
- **Components**: Reusable UI elements (e.g., MapComponent, RideCard)
- **Context**: Global state management (AuthContext, SocketContext)
- **Services**: API communication layer
- **Navigation**: React Navigation stack/tab navigators

### Database Schema Organization

**Collections:**
- `users` - Both passengers and drivers (role-based)
- `rides` - All ride records with status tracking

**Key Indexes:**
- Geospatial indexes on location fields (2dsphere)
- Compound indexes on frequently queried fields (user + status, driver + status)
- Unique indexes on email and phone

## File Naming Conventions

### Backend
- **Routes**: Lowercase, plural nouns (`auth.js`, `rides.js`, `users.js`)
- **Models**: PascalCase, singular (`User.js`, `Ride.js`)
- **Services**: camelCase with descriptive names (`fareCalculator.js`)
- **Middleware**: camelCase (`auth.js`, `validation.js`)
- **Tests**: Match source file with `.test.js` suffix

### Frontend
- **Components**: PascalCase (`MapComponent.js`, `RideCard.js`)
- **Screens**: PascalCase with "Screen" suffix (`HomeScreen.js`)
- **Utilities**: camelCase (`helpers.js`, `constants.js`)
- **Context**: PascalCase with "Context" suffix (`AuthContext.js`)

## Code Organization Rules

### Route Files
- Use Express Router
- Include JSDoc comments for Swagger documentation
- Group related endpoints together
- Apply middleware at route level (auth, validation)
- Keep route handlers thin - delegate to services

### Model Files
- Define Mongoose schemas with validation
- Include pre-save hooks for data transformation (e.g., password hashing)
- Add instance methods for common operations (e.g., comparePassword)
- Define indexes for performance
- Use virtuals for computed properties

### Service Files
- Pure business logic, no HTTP concerns
- Reusable across different routes
- Throw errors, let routes handle HTTP responses
- Keep functions focused and testable

### Test Files
- Mirror source directory structure
- Use descriptive test names
- Group related tests with `describe` blocks
- Use test helpers and factories for setup
- Mock external dependencies

## Import/Export Patterns

### Backend (CommonJS)
```javascript
// Exports
module.exports = router;
module.exports = { functionA, functionB };

// Imports
const express = require('express');
const { auth } = require('../middleware/auth');
```

### Frontend (ES Modules)
```javascript
// Exports
export default Component;
export { functionA, functionB };

// Imports
import React from 'react';
import { View, Text } from 'react-native';
```

## Configuration Files

- **Environment**: `.env` files (never commit secrets)
- **Package Management**: `package.json` in each directory
- **Build Config**: `babel.config.js`, `metro.config.js`, `webpack.config.js`
- **Test Config**: `jest.config.js` in server and client
- **Deployment**: `fly.staging.toml`, `fly.production.toml`, `Dockerfile`
- **Documentation**: Markdown files in root directory

## Documentation Structure

- **Root Level**: High-level docs (README, design docs, specs)
- **Code Level**: JSDoc comments for API documentation
- **API Docs**: Auto-generated Swagger UI at `/api-docs`
- **Specs**: `.kiro/specs/` for feature specifications
