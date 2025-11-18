# 📚 Taxi App - API Documentation Templates

## Table of Contents
1. [API Documentation Structure](#api-documentation-structure)
2. [Endpoint Documentation Template](#endpoint-documentation-template)
3. [Request/Response Examples](#requestresponse-examples)
4. [Error Documentation](#error-documentation)
5. [Authentication Documentation](#authentication-documentation)
6. [Code Examples](#code-examples)
7. [Postman Collection Template](#postman-collection-template)

---

## API Documentation Structure

### Base Information
```yaml
title: Taxi App API
version: 1.0.0
description: Complete API documentation for Taxi App ride-sharing platform
baseUrl: https://api.taxiapp.com/api
protocols:
  - https
contact:
  name: API Support
  email: api-support@taxiapp.com
```

### Table of Contents Structure
```
1. Getting Started
   - Authentication
   - Base URL
   - Rate Limiting
   - Error Handling

2. Authentication Endpoints
   - Register
   - Login
   - Refresh Token
   - Logout

3. Ride Endpoints
   - Request Ride
   - Get Ride Details
   - Accept Ride
   - Complete Ride
   - Cancel Ride

4. Driver Endpoints
   - Get Status
   - Update Status
   - Update Location
   - Get Earnings

5. User Endpoints
   - Get Profile
   - Update Profile
   - Update Location

6. Webhooks
   - Payment Webhooks
   - Notification Webhooks
```

---

## Endpoint Documentation Template

### Template Structure

```markdown
## Endpoint Name

### Description
Brief description of what this endpoint does.

### Endpoint
```
METHOD /api/resource/path
```

### Authentication
- [ ] Required
- [ ] Optional
- [ ] Not Required

### Request Parameters

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Resource identifier |

#### Query Parameters
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| page | integer | No | Page number | 1 |
| limit | integer | No | Items per page | 20 |

#### Request Body
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| field1 | string | Yes | Description | Max 50 chars |
| field2 | number | No | Description | Min: 0, Max: 100 |

### Response

#### Success Response (200 OK)
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

#### Error Responses
| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

### Example Request
```bash
curl -X METHOD \
  https://api.taxiapp.com/api/resource/path \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field1": "value1",
    "field2": "value2"
  }'
```

### Example Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Notes
Additional notes, warnings, or important information about this endpoint.
```

---

## Request/Response Examples

### Authentication Endpoints

#### POST /api/auth/register

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "SecurePassword123",
  "role": "passenger"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "role": "passenger",
      "isVerified": false,
      "createdAt": "2025-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 6 characters"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

#### POST /api/auth/login

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "passenger"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "refreshToken": "refresh_token_here"
  }
}
```

### Ride Endpoints

#### POST /api/rides/request

**Request:**
```json
{
  "pickupLocation": {
    "coordinates": [-122.4194, 37.7749],
    "address": "123 Main St, San Francisco, CA 94102"
  },
  "dropoffLocation": {
    "coordinates": [-122.3965, 37.7937],
    "address": "456 Oak Ave, Oakland, CA 94601"
  },
  "distance": 15.5,
  "estimatedDuration": 20,
  "paymentMethod": "card"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Ride requested successfully",
  "data": {
    "ride": {
      "_id": "507f1f77bcf86cd799439012",
      "passenger": "507f1f77bcf86cd799439011",
      "status": "requested",
      "pickupLocation": {
        "type": "Point",
        "coordinates": [-122.4194, 37.7749],
        "address": "123 Main St, San Francisco, CA 94102"
      },
      "dropoffLocation": {
        "type": "Point",
        "coordinates": [-122.3965, 37.7937],
        "address": "456 Oak Ave, Oakland, CA 94601"
      },
      "distance": 15.5,
      "estimatedDuration": 20,
      "fare": {
        "baseFare": 2.0,
        "distanceFare": 15.5,
        "timeFare": 6.0,
        "surgeMultiplier": 1.0,
        "totalFare": 25.50
      },
      "payment": {
        "method": "card",
        "status": "pending"
      },
      "timeline": {
        "requestedAt": "2025-01-15T10:30:00Z"
      },
      "createdAt": "2025-01-15T10:30:00Z"
    },
    "availableDrivers": 5
  }
}
```

#### PUT /api/rides/:id/accept

**Request:**
```
No request body required
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Ride accepted successfully",
  "data": {
    "ride": {
      "_id": "507f1f77bcf86cd799439012",
      "passenger": {
        "_id": "507f1f77bcf86cd799439011",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890"
      },
      "driver": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Mike",
        "lastName": "Johnson",
        "driverProfile": {
          "vehicleInfo": {
            "make": "Toyota",
            "model": "Camry",
            "year": 2020,
            "color": "White",
            "plateNumber": "ABC-123"
          },
          "rating": 4.8
        }
      },
      "status": "accepted",
      "timeline": {
        "requestedAt": "2025-01-15T10:30:00Z",
        "acceptedAt": "2025-01-15T10:31:00Z"
      }
    }
  }
}
```

#### PUT /api/rides/:id/complete

**Request:**
```json
{
  "endLocation": {
    "coordinates": [-122.3965, 37.7937],
    "address": "456 Oak Ave, Oakland, CA 94601"
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Ride completed successfully",
  "data": {
    "ride": {
      "_id": "507f1f77bcf86cd799439012",
      "status": "completed",
      "fare": {
        "totalFare": 25.50
      },
      "payment": {
        "method": "card",
        "status": "completed",
        "paidAt": "2025-01-15T10:50:00Z"
      },
      "timeline": {
        "requestedAt": "2025-01-15T10:30:00Z",
        "acceptedAt": "2025-01-15T10:31:00Z",
        "arrivedAt": "2025-01-15T10:35:00Z",
        "startedAt": "2025-01-15T10:36:00Z",
        "completedAt": "2025-01-15T10:50:00Z"
      }
    }
  }
}
```

### Driver Endpoints

#### GET /api/drivers/status

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "online",
    "isOnline": true,
    "isAvailable": true,
    "currentLocation": {
      "coordinates": [-122.4194, 37.7749],
      "address": "San Francisco, CA",
      "lastUpdated": "2025-01-15T10:30:00Z"
    },
    "driverProfile": {
      "rating": 4.8,
      "totalRides": 150
    }
  }
}
```

#### PUT /api/drivers/status

**Request:**
```json
{
  "status": "online"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Driver status updated successfully",
  "data": {
    "status": "online",
    "isOnline": true,
    "isAvailable": true
  }
}
```

#### PUT /api/drivers/location

**Request:**
```json
{
  "coordinates": [-122.4194, 37.7749],
  "address": "123 Main St, San Francisco, CA"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "location": {
      "type": "Point",
      "coordinates": [-122.4194, 37.7749],
      "address": "123 Main St, San Francisco, CA",
      "lastUpdated": "2025-01-15T10:30:00Z"
    }
  }
}
```

#### GET /api/drivers/earnings

**Query Parameters:**
```
?startDate=2025-01-01&endDate=2025-01-31
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "earnings": {
      "total": 1250.50,
      "totalRides": 50,
      "averagePerRide": 25.01,
      "period": {
        "startDate": "2025-01-01",
        "endDate": "2025-01-31"
      },
      "breakdown": {
        "baseFare": 100.00,
        "distanceFare": 1000.00,
        "timeFare": 150.50
      }
    }
  }
}
```

---

## Error Documentation

### Error Response Format

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

### Error Codes Reference

#### Authentication Errors (401)
```json
{
  "code": "AUTH_REQUIRED",
  "message": "Authentication required"
}

{
  "code": "AUTH_INVALID",
  "message": "Invalid authentication token"
}

{
  "code": "AUTH_EXPIRED",
  "message": "Authentication token expired"
}

{
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

#### Validation Errors (422)
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

#### Resource Errors (404)
```json
{
  "code": "NOT_FOUND",
  "message": "Resource not found",
  "details": {
    "resource": "ride",
    "id": "507f1f77bcf86cd799439012"
  }
}
```

#### Business Logic Errors (400)
```json
{
  "code": "RIDE_ALREADY_ACCEPTED",
  "message": "This ride has already been accepted by another driver"
}

{
  "code": "DRIVER_NOT_AVAILABLE",
  "message": "Driver is not available to accept rides"
}

{
  "code": "INVALID_RIDE_STATUS",
  "message": "Cannot perform this action on a ride with status 'completed'"
}
```

#### Server Errors (500)
```json
{
  "code": "INTERNAL_ERROR",
  "message": "An internal server error occurred",
  "details": {
    "errorId": "err_123456"
  }
}
```

---

## Authentication Documentation

### Authentication Flow

```
1. User registers/logs in
   ↓
2. Server validates credentials
   ↓
3. Server generates JWT token
   ↓
4. Client stores token securely
   ↓
5. Client includes token in subsequent requests
   ↓
6. Server validates token on each request
```

### Token Usage

#### Including Token in Requests
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Token Refresh
```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_access_token",
    "expiresIn": 3600
  }
}
```

---

## Code Examples

### JavaScript (Fetch API)

```javascript
// Register User
async function registerUser(userData) {
  const response = await fetch('https://api.taxiapp.com/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  const data = await response.json();
  return data;
}

// Request Ride
async function requestRide(rideData, token) {
  const response = await fetch('https://api.taxiapp.com/api/rides/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(rideData)
  });
  
  const data = await response.json();
  return data;
}
```

### cURL Examples

```bash
# Register User
curl -X POST https://api.taxiapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "role": "passenger"
  }'

# Login
curl -X POST https://api.taxiapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Request Ride
curl -X POST https://api.taxiapp.com/api/rides/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pickupLocation": {
      "coordinates": [-122.4194, 37.7749],
      "address": "123 Main St, San Francisco, CA"
    },
    "dropoffLocation": {
      "coordinates": [-122.3965, 37.7937],
      "address": "456 Oak Ave, Oakland, CA"
    },
    "distance": 15.5,
    "estimatedDuration": 20,
    "paymentMethod": "card"
  }'
```

### Python Examples

```python
import requests

# Register User
def register_user(user_data):
    url = 'https://api.taxiapp.com/api/auth/register'
    response = requests.post(url, json=user_data)
    return response.json()

# Request Ride
def request_ride(ride_data, token):
    url = 'https://api.taxiapp.com/api/rides/request'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    response = requests.post(url, json=ride_data, headers=headers)
    return response.json()
```

### React Native Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.taxiapp.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register User
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Request Ride
export const requestRide = async (rideData) => {
  try {
    const response = await api.post('/rides/request', rideData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

---

## Postman Collection Template

### Collection Structure

```json
{
  "info": {
    "name": "Taxi App API",
    "description": "Complete API collection for Taxi App",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\",\n  \"email\": \"john@example.com\",\n  \"phone\": \"+1234567890\",\n  \"password\": \"password123\",\n  \"role\": \"passenger\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Rides",
      "item": [
        {
          "name": "Request Ride",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"pickupLocation\": {\n    \"coordinates\": [-122.4194, 37.7749],\n    \"address\": \"123 Main St, San Francisco, CA\"\n  },\n  \"dropoffLocation\": {\n    \"coordinates\": [-122.3965, 37.7937],\n    \"address\": \"456 Oak Ave, Oakland, CA\"\n  },\n  \"distance\": 15.5,\n  \"estimatedDuration\": 20,\n  \"paymentMethod\": \"card\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/rides/request",
              "host": ["{{baseUrl}}"],
              "path": ["rides", "request"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://api.taxiapp.com/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## API Versioning

### Version Strategy
- **URL-based versioning**: `/api/v1/...`
- **Header-based versioning**: `Accept: application/vnd.taxiapp.v1+json`

### Version Lifecycle
1. **Current**: v1 (active)
2. **Deprecated**: v0 (6 months notice)
3. **Retired**: Removed after deprecation period

---

## Rate Limiting Documentation

### Limits
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Ride Requests**: 10 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 900
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: API Documentation Team

