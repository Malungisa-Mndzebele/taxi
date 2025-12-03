# API Compatibility Notes

This document describes backward compatibility features in the API.

## Authentication Token Formats

The authentication middleware supports two JWT token formats for backward compatibility:

### Format 1: Nested User Object (Current)
```json
{
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "isDriver": false
  }
}
```

### Format 2: Direct userId (Legacy)
```json
{
  "userId": "userId"
}
```

Both formats are accepted by the `auth` middleware. New tokens are generated in Format 1.

## Ride Status Endpoints

Several ride endpoints support both PUT and POST methods for backward compatibility:

- `PUT/POST /api/rides/:rideId/accept` - Accept a ride
- `PUT/POST /api/rides/:rideId/start` - Start a ride
- `PUT/POST /api/rides/:rideId/complete` - Complete a ride
- `PUT/POST /api/rides/:rideId/cancel` - Cancel a ride

**Recommendation**: Use PUT for updates (RESTful standard).

## Location Update Formats

The `/api/users/location` endpoint accepts two coordinate formats:

### Format 1: Coordinates Array (Preferred)
```json
{
  "coordinates": [longitude, latitude],
  "address": "123 Main St"
}
```

### Format 2: Separate Fields (Legacy)
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

Both formats are converted to GeoJSON Point internally: `[longitude, latitude]`

## Driver Status Updates

The `/api/drivers/status` endpoint accepts two formats:

### Format 1: Status String (Legacy)
```json
{
  "status": "online"
}
```

### Format 2: Boolean Flags (Preferred)
```json
{
  "isOnline": true,
  "isAvailable": true
}
```

Both formats update the same underlying fields in the driver profile.

## Migration Path

For new integrations, prefer:
- Token Format 1 (nested user object)
- PUT methods for updates
- Coordinates array format for locations
- Boolean flags for driver status

Legacy formats will be maintained for backward compatibility but may be deprecated in future major versions.
