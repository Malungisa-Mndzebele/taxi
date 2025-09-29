# Taxi App - Uber-like Ride Sharing Application

A full-stack ride-sharing application similar to Uber, built with React Native for mobile clients and Node.js/Express for the backend.

## Features

### For Passengers
- User registration and authentication
- Real-time location tracking
- Request rides with pickup and dropoff locations
- View nearby available drivers
- Real-time ride tracking
- Ride history and details
- Rating and review system
- Multiple payment methods

### For Drivers
- Driver registration and profile management
- Vehicle information management
- Online/offline status toggle
- Receive ride requests from nearby passengers
- Accept/decline ride requests
- Real-time navigation to pickup and dropoff locations
- Ride status management (arrived, started, completed)
- Earnings tracking and statistics
- Rating and review system

### Technical Features
- Real-time communication using Socket.io
- GPS location tracking
- Google Maps integration
- JWT authentication
- MongoDB database
- RESTful API
- Cross-platform mobile app (iOS/Android)

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Stripe** - Payment processing (ready for integration)

### Frontend
- **React Native** - Cross-platform mobile framework
- **React Navigation** - Navigation library
- **React Native Maps** - Maps integration
- **React Native Paper** - UI components
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **AsyncStorage** - Local storage

## Project Structure

```
taxi-app/
├── server/                 # Backend API
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── index.js          # Server entry point
│   └── package.json      # Backend dependencies
├── client/                # React Native app
│   ├── src/
│   │   ├── screens/      # App screens
│   │   ├── context/      # React context providers
│   │   ├── services/     # API services
│   │   └── config/       # App configuration
│   ├── App.js            # App entry point
│   └── package.json      # Frontend dependencies
├── package.json          # Root package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- React Native development environment
- Google Maps API key
- Stripe account (for payments)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
MONGODB_URI=mongodb://localhost:27017/taxi-app
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
CLIENT_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. For iOS, install pods:
```bash
cd ios && pod install && cd ..
```

4. Update the API configuration in `src/config/index.js`:
```javascript
export const API_BASE_URL = 'http://localhost:5000';
export const GOOGLE_MAPS_API_KEY = 'your-google-maps-api-key';
```

5. Start the React Native app:
```bash
# For iOS
npm run ios

# For Android
npm run android
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-phone` - Verify phone number

### Users
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/location` - Update user location
- `GET /api/users/nearby-drivers` - Get nearby drivers
- `POST /api/users/rating` - Rate user after ride

### Rides
- `POST /api/rides/request` - Request a ride
- `POST /api/rides/:id/accept` - Accept ride (driver)
- `POST /api/rides/:id/arrive` - Mark as arrived
- `POST /api/rides/:id/start` - Start ride
- `POST /api/rides/:id/complete` - Complete ride
- `POST /api/rides/:id/cancel` - Cancel ride
- `GET /api/rides/active` - Get active rides
- `GET /api/rides/history` - Get ride history

### Drivers
- `PUT /api/drivers/profile` - Update driver profile
- `PUT /api/drivers/status` - Update online/availability status
- `GET /api/drivers/stats` - Get driver statistics
- `GET /api/drivers/earnings` - Get earnings history
- `GET /api/drivers/requests` - Get ride requests

## Real-time Events

### Socket.io Events
- `new-ride-request` - New ride request available
- `ride-accepted` - Ride request accepted
- `driver-arrived` - Driver arrived at pickup
- `ride-started` - Ride started
- `ride-completed` - Ride completed
- `ride-cancelled` - Ride cancelled
- `driver-location` - Driver location update

## Database Schema

### User Model
- Personal information (name, email, phone)
- Role (passenger/driver)
- Location data
- Driver profile (license, vehicle info, ratings)
- Passenger profile (ratings, payment methods)

### Ride Model
- Passenger and driver references
- Pickup and dropoff locations
- Status and timeline
- Fare calculation
- Payment information
- Ratings and reviews

## Configuration

### Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port
- `CLIENT_URL` - Frontend URL for CORS
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### App Configuration
- Default radius for driver search
- Fare calculation rates
- Location update intervals
- Map zoom levels

## Development

### Running in Development Mode
```bash
# Start backend
cd server && npm run dev

# Start frontend
cd client && npm start
```

### Building for Production
```bash
# Build Android
cd client && npm run build:android

# Build iOS
cd client && npm run build:ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@taxiapp.com or create an issue in the repository.

## Roadmap

- [ ] Push notifications
- [ ] In-app chat
- [ ] Multiple vehicle types
- [ ] Scheduled rides
- [ ] Driver earnings withdrawal
- [ ] Admin dashboard
- [ ] Advanced analytics
- [ ] Multi-language support
