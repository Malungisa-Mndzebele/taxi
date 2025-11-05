# Taxi App - API Quick Reference

## 🚀 Getting Started

### Installation
```bash
# Install server dependencies
cd server
npm install

# Start the server
npm start

# Or run in development mode
npm run dev
```

### Access Points
- **API Base URL**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/api/health

---

## 🔑 Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "passenger"  // or "driver"
}
```

**Response**: `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "passenger"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**: `200 OK` (same structure as register)

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN
```

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newpassword123"
}
```

---

## 🚗 Ride Management

### Request a Ride (Passenger)
```http
POST /api/rides/request
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "pickupLocation": {
    "coordinates": [-122.4194, 37.7749],  // [longitude, latitude]
    "address": "123 Main St, San Francisco, CA"
  },
  "dropoffLocation": {
    "coordinates": [-122.3965, 37.7937],
    "address": "456 Oak Ave, Oakland, CA"
  },
  "distance": 15,  // kilometers
  "estimatedDuration": 20,  // minutes
  "paymentMethod": "cash"  // or "card", "wallet"
}
```

**Response**: `200 OK`
```json
{
  "message": "Ride requested successfully",
  "ride": {
    "id": "507f1f77bcf86cd799439011",
    "status": "pending",
    "fare": 25.50,
    "fareBreakdown": {
      "baseFare": 2.0,
      "distanceFare": 22.5,
      "timeFare": 6.0,
      "surgeMultiplier": 1.0,
      "totalFare": 25.50
    }
  },
  "availableDrivers": 5
}
```

### Get Ride Details
```http
GET /api/rides/:rideId
Authorization: Bearer YOUR_TOKEN
```

### Accept Ride (Driver)
```http
PUT /api/rides/:rideId/accept
Authorization: Bearer YOUR_TOKEN
```

### Mark Arrival (Driver)
```http
PUT /api/rides/:rideId/arrive
Authorization: Bearer YOUR_TOKEN
```

### Start Ride (Driver)
```http
PUT /api/rides/:rideId/start
Authorization: Bearer YOUR_TOKEN
```

### Complete Ride (Driver)
```http
PUT /api/rides/:rideId/complete
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "endLocation": {
    "coordinates": [-122.3965, 37.7937],
    "address": "456 Oak Ave, Oakland, CA"
  }
}
```

### Cancel Ride
```http
PUT /api/rides/:rideId/cancel
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "reason": "Changed my mind"  // optional
}
```

---

## 👨‍✈️ Driver Management

### Get Driver Status
```http
GET /api/drivers/status
Authorization: Bearer YOUR_TOKEN
```

**Response**: `200 OK`
```json
{
  "status": "offline",
  "isOnline": false,
  "isAvailable": false
}
```

### Update Driver Status
```http
PUT /api/drivers/status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "online"  // or "offline"
}
```

### Update Driver Location
```http
PUT /api/drivers/location
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "coordinates": [-122.4194, 37.7749],  // [longitude, latitude]
  "address": "San Francisco, CA"  // optional
}
```

### Get Available Drivers
```http
GET /api/drivers/available?latitude=37.7749&longitude=-122.4194&radius=5000
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters**:
- `latitude` (required): Latitude of search center
- `longitude` (required): Longitude of search center
- `radius` (optional): Search radius in meters (default: 5000)

### Get Driver Ride History
```http
GET /api/drivers/rides?status=completed&limit=20&page=1
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters**:
- `status` (optional): Filter by ride status
- `limit` (optional): Number of results (default: 20)
- `page` (optional): Page number (default: 1)

### Get Driver Earnings
```http
GET /api/drivers/earnings?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer YOUR_TOKEN
```

**Response**: `200 OK`
```json
{
  "message": "Earnings fetched successfully",
  "earnings": {
    "total": 1250.50,
    "totalRides": 50,
    "averagePerRide": 25.01
  }
}
```

### Update Driver Profile
```http
PUT /api/drivers/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "licenseNumber": "DL123456",
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "color": "White",
    "plateNumber": "ABC-123"
  }
}
```

---

## 📊 Response Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200  | OK | Request successful |
| 201  | Created | Resource created successfully |
| 400  | Bad Request | Invalid input data |
| 401  | Unauthorized | Missing or invalid token |
| 403  | Forbidden | Insufficient permissions |
| 404  | Not Found | Resource not found |
| 422  | Unprocessable Entity | Validation failed |
| 429  | Too Many Requests | Rate limit exceeded |
| 500  | Internal Server Error | Server error |

---

## 🔒 Security Features

### Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Applies to**: All /api/* routes
- **Override**: Disabled in test environment

### CORS
- **Allowed Origins**: Configurable via `ALLOWED_ORIGINS` env variable
- **Default**: localhost:3000, localhost:19006, localhost:8080
- **Methods**: GET, POST, PUT, DELETE, OPTIONS

### Input Validation
All endpoints validate input data:
- Email format validation
- Password strength (min 6 characters)
- Phone number format
- Coordinate range validation
- Required field checks

---

## 🧪 Testing the API

### Using cURL

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "role": "passenger"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Request Ride
```bash
curl -X POST http://localhost:5000/api/rides/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pickupLocation": {
      "coordinates": [-122.4194, 37.7749],
      "address": "San Francisco, CA"
    },
    "dropoffLocation": {
      "coordinates": [-122.3965, 37.7937],
      "address": "Oakland, CA"
    },
    "distance": 15,
    "estimatedDuration": 20
  }'
```

### Using Swagger UI
Visit http://localhost:5000/api-docs for interactive testing

---

## 🎯 Common Workflows

### Passenger Workflow
1. **Register** → `POST /api/auth/register`
2. **Login** → `POST /api/auth/login` (get token)
3. **Request Ride** → `POST /api/rides/request`
4. **Track Ride** → `GET /api/rides/:rideId`
5. **Cancel Ride** (if needed) → `PUT /api/rides/:rideId/cancel`

### Driver Workflow
1. **Register as Driver** → `POST /api/auth/register` (role: "driver")
2. **Login** → `POST /api/auth/login` (get token)
3. **Update Profile** → `PUT /api/drivers/profile`
4. **Go Online** → `PUT /api/drivers/status` (status: "online")
5. **Update Location** → `PUT /api/drivers/location`
6. **Accept Ride** → `PUT /api/rides/:rideId/accept`
7. **Mark Arrival** → `PUT /api/rides/:rideId/arrive`
8. **Start Ride** → `PUT /api/rides/:rideId/start`
9. **Complete Ride** → `PUT /api/rides/:rideId/complete`
10. **View Earnings** → `GET /api/drivers/earnings`

---

## 🐛 Error Handling

### Validation Error (422)
```json
{
  "success": false,
  "errors": [
    {"email": "Please include a valid email"},
    {"password": "Password must be at least 6 characters"}
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "error": "Authentication failed",
  "message": "Please authenticate to access this resource"
}
```

### Not Found Error (404)
```json
{
  "message": "Ride not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## 📚 Additional Resources

- **Full API Documentation**: http://localhost:5000/api-docs
- **Swagger JSON**: http://localhost:5000/api-docs.json
- **Health Check**: http://localhost:5000/api/health

---

## 💡 Tips

1. **Save the token** after login to use in subsequent requests
2. **Use Swagger UI** for easy testing without cURL
3. **Check health endpoint** to verify server is running
4. **Coordinates format**: Always [longitude, latitude]
5. **Date format**: ISO 8601 (e.g., 2025-01-01T00:00:00Z)
6. **Rate limits**: Max 100 requests per 15 minutes

---

## 🔧 Environment Setup

Create a `.env` file in the server directory:

```env
# Required
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=mongodb://localhost:27017/taxi-app
NODE_ENV=development

# Optional
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

---

**Happy Coding! 🚀**
