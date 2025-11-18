# 🚀 Testing Implementation Guide - Taxi App

## Quick Start

This guide helps you implement the comprehensive testing strategy for the Taxi App with Fly.io deployment.

---

## Prerequisites

1. **Node.js 18+** installed
2. **MongoDB** (local or Atlas)
3. **Fly.io account** ([Sign up here](https://fly.io))
4. **GitHub account** (for CI/CD)

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create `server/.env`:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/taxi-app
```

### 3. Run Tests Locally

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance
npm run test:security

# Run with coverage
npm run test:coverage
```

---

## Fly.io Setup

### 1. Install Fly.io CLI

```bash
# macOS
brew install flyctl

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Linux
curl -L https://fly.io/install.sh | sh
```

### 2. Login to Fly.io

```bash
flyctl auth login
```

### 3. Create Fly.io App

```bash
# For staging
flyctl apps create taxi-app-staging

# For production
flyctl apps create taxi-app
```

### 4. Set Secrets

```bash
# Staging secrets
flyctl secrets set \
  JWT_SECRET=your-staging-secret \
  MONGODB_URI=your-staging-mongodb-uri \
  NODE_ENV=staging \
  -a taxi-app-staging

# Production secrets
flyctl secrets set \
  JWT_SECRET=your-production-secret \
  MONGODB_URI=your-production-mongodb-uri \
  NODE_ENV=production \
  -a taxi-app
```

### 5. Deploy to Fly.io

```bash
# Deploy to staging
flyctl deploy --config fly.staging.toml -a taxi-app-staging

# Deploy to production
flyctl deploy --config fly.production.toml -a taxi-app
```

---

## CI/CD Setup

### 1. GitHub Actions Setup

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:
   - `FLY_API_TOKEN`: Get from `flyctl auth token`

### 2. Test CI/CD Pipeline

1. Push code to `develop` branch → Triggers staging deployment
2. Push code to `main` branch → Triggers production deployment
3. Create a pull request → Triggers tests only

---

## Test Structure

### Directory Structure

```
server/
├── tests/
│   ├── unit/              # Unit tests (60%)
│   │   ├── services/
│   │   ├── utils/
│   │   └── middleware/
│   │
│   ├── integration/       # Integration tests (30%)
│   │   ├── routes/
│   │   ├── models/
│   │   └── complete-flow.test.js
│   │
│   ├── e2e/               # E2E tests (10%)
│   │   ├── passenger-flow.test.js
│   │   └── driver-flow.test.js
│   │
│   ├── performance/       # Performance tests
│   │   └── load.test.js
│   │
│   ├── security/          # Security tests
│   │   └── authentication.test.js
│   │
│   ├── helpers/           # Test utilities
│   │   ├── factories.js
│   │   └── test-helper.js
│   │
│   └── fixtures/          # Test data
│       └── users.json
```

---

## Writing Tests

### Unit Test Example

```javascript
// tests/unit/services/fareCalculator.test.js
const FareCalculator = require('../../../services/fareCalculator');

describe('FareCalculator', () => {
  it('should calculate fare correctly', () => {
    const fare = FareCalculator.calculateFare({
      distance: 10,
      duration: 15,
      surgeMultiplier: 1.0
    });
    
    expect(fare.totalFare).toBeGreaterThan(0);
  });
});
```

### Integration Test Example

```javascript
// tests/integration/routes/rides.test.js
const request = require('supertest');
const { app } = require('../../test-server');

describe('POST /api/rides/request', () => {
  it('should create ride request', async () => {
    const response = await request(app)
      .post('/api/rides/request')
      .set('Authorization', `Bearer ${token}`)
      .send(rideData)
      .expect(201);
    
    expect(response.body.ride).toBeDefined();
  });
});
```

### Using Test Factories

```javascript
const { UserFactory, RideFactory } = require('../helpers/factories');

// Create test user
const passenger = await UserFactory.createAndSavePassenger();

// Create test ride
const ride = await RideFactory.createAndSaveRide(passenger);
```

---

## Test Coverage

### View Coverage Report

```bash
npm run test:coverage
```

Open `server/coverage/lcov-report/index.html` in browser.

### Coverage Targets

- **Overall**: 80%
- **Unit Tests**: 85%
- **Integration Tests**: 75%
- **Critical Paths**: 100%

---

## Performance Testing

### Run Performance Tests

```bash
npm run test:performance
```

### Performance Targets

- **Auth requests**: < 500ms
- **Ride requests**: < 1s
- **Location updates**: < 200ms
- **Database queries**: < 500ms

---

## Security Testing

### Run Security Tests

```bash
npm run test:security
```

### Security Checks

- Authentication bypass attempts
- Authorization violations
- Input validation
- SQL/NoSQL injection
- XSS attacks

---

## Monitoring Tests on Fly.io

### Health Checks

Fly.io automatically checks `/api/health` endpoint:

```bash
# Check app status
flyctl status -a taxi-app

# View logs
flyctl logs -a taxi-app

# Monitor metrics
flyctl metrics -a taxi-app
```

### Test Health Endpoint

```bash
curl https://taxi-app.fly.dev/api/health
```

---

## Troubleshooting

### Tests Failing Locally

1. **Check MongoDB connection**:
   ```bash
   mongosh mongodb://localhost:27017/taxi-app-test
   ```

2. **Clear test database**:
   ```bash
   # Tests use in-memory MongoDB, but if issues persist:
   npm run test:clean
   ```

3. **Check environment variables**:
   ```bash
   echo $NODE_ENV
   echo $JWT_SECRET
   ```

### Deployment Issues on Fly.io

1. **Check build logs**:
   ```bash
   flyctl logs -a taxi-app
   ```

2. **Verify secrets**:
   ```bash
   flyctl secrets list -a taxi-app
   ```

3. **Check health endpoint**:
   ```bash
   curl https://taxi-app.fly.dev/api/health
   ```

---

## Best Practices

### 1. Test Organization
- Keep tests close to code
- Use descriptive test names
- One assertion per test (when possible)

### 2. Test Data
- Use factories for test data
- Clean up after tests
- Isolate test data

### 3. Test Speed
- Keep unit tests fast (< 100ms)
- Use in-memory database for tests
- Mock external services

### 4. Test Maintenance
- Update tests with code changes
- Remove obsolete tests
- Refactor tests regularly

---

## Resources

### Documentation
- [Comprehensive Testing Strategy](./COMPREHENSIVE_TESTING_STRATEGY.md)
- [Fly.io Documentation](https://fly.io/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

### Support
- [Fly.io Community](https://community.fly.io)
- [GitHub Issues](https://github.com/your-repo/issues)

---

## Next Steps

1. ✅ Review [Comprehensive Testing Strategy](./COMPREHENSIVE_TESTING_STRATEGY.md)
2. ✅ Set up local testing environment
3. ✅ Configure Fly.io deployment
4. ✅ Set up CI/CD pipeline
5. ✅ Write tests for your features
6. ✅ Monitor test coverage
7. ✅ Deploy to staging
8. ✅ Deploy to production

---

**Last Updated**: January 2025  
**Maintained By**: Development Team

