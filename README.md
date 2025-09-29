# 🚗 Taxi App - Uber-like Ride Sharing Application

A full-stack ride-sharing application similar to Uber, built with React Native for mobile clients, Node.js/Express for the backend, and a web interface for easy access.

## 🚀 Quick Start

### 🌐 **Use the App Right Now!**

#### **🎯 One-Click Access:**
**[🚀 Open Taxi App](download.html)** - Works on any device, no installation needed!

#### **Super Simple Steps:**
1. **Start Backend Server**: Run `npm start` in your terminal
2. **Click the link above** to open the app
3. **Register** as a passenger or driver
4. **Start using** - request rides or accept them!

#### **📱 Works on Everything:**
- **💻 Desktop**: Open in any web browser
- **📱 Mobile**: Works perfectly on phones and tablets
- **🍎 iOS**: Add to home screen for app-like experience
- **🤖 Android**: Add to home screen for app-like experience

#### **✨ No Installation Required:**
- No downloads
- No app stores
- No complex setup
- Just click and use!

### 🔧 Alternative Access Methods

#### **Direct Web Access:**
- **Web App**: Open `web/index.html` in any browser
- **Download Page**: Open `download.html` for the full experience

#### **Mobile Apps (Coming Soon):**
- **Android APK**: Native Android app (in development)
- **iOS IPA**: Native iOS app (in development)

### 🔧 Build from Source (Optional)
```bash
# Build Android APK
npm run build-android

# Build iOS App (requires macOS + Xcode)
npm run build-ios

# Build both platforms
npm run build-all

# Open download page
npm run download
```

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

## 📁 Project Structure

```
taxi-app/
├── server/                 # Backend API
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── tests/             # Backend tests
│   ├── index.js          # Server entry point
│   └── package.json      # Backend dependencies
├── client/                # React Native app
│   ├── src/
│   │   ├── screens/      # App screens
│   │   ├── context/      # React context providers
│   │   ├── services/     # API services
│   │   └── config/       # App configuration
│   ├── ios/              # iOS configuration
│   ├── android/          # Android configuration
│   ├── App.js            # App entry point
│   └── package.json      # Frontend dependencies
├── web/                   # Web interface
│   ├── index.html        # Web app
│   ├── tests/            # Web tests
│   └── package.json      # Web dependencies
├── build-apps.js         # Build script
├── download.html         # Download page
├── BUILD_INSTRUCTIONS.md # Detailed build guide
├── DOWNLOAD_README.md    # Download guide
└── package.json          # Root package.json
```

## 🛠️ Installation & Setup

### Prerequisites

#### For Development:
- Node.js (v16 or higher)
- MongoDB
- React Native development environment
- Google Maps API key
- Stripe account (for payments)

#### For Building Apps:
- **Android**: Android Studio, Android SDK, JDK 11+
- **iOS**: macOS with Xcode 12.0+, Apple Developer Account, CocoaPods
- **Both**: React Native CLI (`npm install -g @react-native-community/cli`)

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

#### Quick Build Commands:
```bash
# Build Android APK
npm run build-android

# Build iOS App (requires macOS + Xcode)
npm run build-ios

# Build both platforms
npm run build-all

# Open download page
npm run download
```

#### Manual Build Process:
```bash
# Android
cd client
npm install
cd android
./gradlew assembleRelease

# iOS (macOS only)
cd client
npm install
cd ios
pod install
cd ..
npx react-native run-ios
```

#### Generated Files:
- **Android APK**: `client/android/app/build/outputs/apk/release/app-release.apk`
- **Android AAB**: `client/android/app/build/outputs/bundle/release/app-release.aab`
- **iOS Build**: `client/ios/build/` (requires Xcode for IPA creation)
- **Download Page**: `download.html`

## 🌐 Web Interface

The app includes a fully functional web interface that works in any browser:

### Features:
- **User Registration & Login**: Create accounts for passengers and drivers
- **Ride Requests**: Passengers can request rides with pickup/dropoff locations
- **Driver Dashboard**: Drivers can view and accept available rides
- **Real-time Updates**: Live ride status updates and notifications
- **Responsive Design**: Works on desktop, tablet, and mobile browsers

### Access:
- **Direct**: Open `web/index.html` in any browser
- **Download Page**: Visit `download.html` for app downloads and web access
- **No Installation**: Works immediately without any setup

## 🧪 Testing

### Backend Tests:
```bash
cd server
npm test
```

### Web Interface Tests:
```bash
cd web
npm test
```

### Manual Testing:
- **Web Interface**: Open `web/index.html` and test all features
- **API Testing**: Use the provided test scripts in the root directory
- **Mobile Apps**: Build and test on actual devices

## 📱 App Distribution

### Android:
- **APK**: Direct installation on Android devices
- **AAB**: Upload to Google Play Store
- **Requirements**: Enable "Install from unknown sources"

### iOS:
- **Development**: Install via Xcode for testing
- **TestFlight**: Beta testing with multiple users
- **App Store**: Submit for review and public release

### Web:
- **Direct Access**: No installation required
- **PWA**: Can be installed as a web app on mobile devices
- **Deployment**: Upload to any web server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Test on both web and mobile platforms
6. Submit a pull request

## License

This project is licensed under the MIT License.

## 📋 Available Scripts

### Root Level Commands:
```bash
# Start backend server
npm start

# Development mode
npm run dev

# Install all dependencies
npm run install-all

# Build Android APK
npm run build-android

# Build iOS App
npm run build-ios

# Build both platforms
npm run build-all

# Open download page
npm run download
```

### Server Commands:
```bash
cd server
npm start          # Start server
npm run dev        # Development mode with nodemon
npm test           # Run backend tests
```

### Client Commands:
```bash
cd client
npm start          # Start React Native
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm test           # Run client tests
```

### Web Commands:
```bash
cd web
npm test           # Run web tests
# Open index.html in browser for web interface
```

## 🆘 Support & Troubleshooting

### Common Issues:

#### Build Issues:
- **Android**: Run `cd client/android && ./gradlew clean`
- **iOS**: Run `cd client/ios && pod deintegrate && pod install`
- **Dependencies**: Delete `node_modules` and run `npm install`

#### Server Issues:
- **Port conflicts**: Kill processes on port 5000
- **MongoDB**: Ensure MongoDB is running on port 27017
- **CORS**: Check CORS configuration in `server/index.js`

#### Web Interface Issues:
- **CORS errors**: Ensure backend server is running
- **Login issues**: Check JWT secret configuration
- **Real-time updates**: Verify Socket.io connection

### Getting Help:
- **Documentation**: Check `BUILD_INSTRUCTIONS.md` and `DOWNLOAD_README.md`
- **Issues**: Create an issue in the repository
- **Testing**: Use the provided test scripts to verify functionality

## 🗺️ Roadmap

### ✅ Completed Features:
- [x] User registration and authentication
- [x] Real-time ride requests and acceptance
- [x] Driver and passenger dashboards
- [x] Web interface with full functionality
- [x] Mobile app builds for iOS and Android
- [x] Real-time communication with Socket.io
- [x] Comprehensive testing suite
- [x] Download and distribution system

### 🚧 In Progress:
- [ ] Enhanced UI/UX improvements
- [ ] Performance optimizations
- [ ] Additional test coverage

### 📋 Planned Features:
- [ ] Push notifications
- [ ] In-app chat
- [ ] Multiple vehicle types
- [ ] Scheduled rides
- [ ] Driver earnings withdrawal
- [ ] Admin dashboard
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Offline mode support
- [ ] Advanced payment methods
- [ ] Ride sharing (multiple passengers)
- [ ] Driver verification system
