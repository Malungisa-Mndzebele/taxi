const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const dotenv = require('dotenv');
const http = require('http');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import routes
const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');
const driverRoutes = require('./routes/drivers');
const userRoutes = require('./routes/users');

// Import error handling middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:19006', 'http://localhost:8080'];

const corsOptions = {
  origin: (origin, callback) => {
    if (process.env.NODE_ENV === 'development' || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Taxi App API Documentation'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Taxi App API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/users', userRoutes);

// Serve static files from the React app
const path = require('path');
// Check if we are in production or if the web build exists
// We assume the build is in ../web/dist relative to server/index.js or ./public if copied
const webBuildPath = process.env.WEB_BUILD_PATH || path.join(__dirname, '../web/dist');
app.use(express.static(webBuildPath));

// Root endpoint - API Info (only if not requesting HTML)
app.get('/api', (req, res) => {
  res.json({
    message: '🚗 Taxi App API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      rides: '/api/rides',
      drivers: '/api/drivers',
      users: '/api/users'
    }
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res, next) => {
  // If request is for API, don't serve HTML, pass to 404 handler
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(webBuildPath, 'index.html'), (err) => {
    if (err) {
      // If index.html is missing (e.g. during dev without build), pass to next (404)
      next();
    }
  });
});

// 404 handler for undefined routes (must be before error handler)
app.use(notFoundHandler);

// Comprehensive error handling middleware (must be last)
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// MongoDB connection (optional - will work without it for testing)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taxi-app';

if (process.env.MONGODB_URI || process.env.NODE_ENV === 'production') {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => {
      console.log('✅ MongoDB connected successfully');
    })
    .catch((err) => {
      console.log('⚠️  MongoDB connection failed:', err.message);
      console.log('📝 Server will run without database (API endpoints may have limited functionality)');
    });
} else {
  console.log('📝 Running without MongoDB (set MONGODB_URI in .env to enable database)');
}

// Socket.io setup for real-time features
const socketIO = require('socket.io');
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Join room by user ID
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Driver location update
  socket.on('driver-location', (data) => {
    socket.broadcast.emit('driver-location-update', data);
  });

  // Ride status updates
  socket.on('ride-status', (data) => {
    io.to(data.userId).emit('ride-status-update', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚗 Taxi App Server');
    console.log('='.repeat(50));
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 API: http://localhost:${PORT}`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(50) + '\n');
  });
}

module.exports = { app, server, io };
