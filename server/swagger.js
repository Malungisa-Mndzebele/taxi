const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Taxi App API',
      version: '1.0.0',
      description: 'A comprehensive ride-sharing application API similar to Uber',
      contact: {
        name: 'API Support',
        email: 'support@taxiapp.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.taxiapp.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['passenger', 'driver'] },
            isDriver: { type: 'boolean' },
            driverStatus: { type: 'string', enum: ['online', 'offline'] },
            isVerified: { type: 'boolean' },
            isActive: { type: 'boolean' },
            profilePicture: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Ride: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            passenger: { type: 'string' },
            driver: { type: 'string' },
            status: { 
              type: 'string', 
              enum: ['pending', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'] 
            },
            pickupLocation: {
              type: 'object',
              properties: {
                type: { type: 'string', default: 'Point' },
                coordinates: { type: 'array', items: { type: 'number' } },
                address: { type: 'string' }
              }
            },
            dropoffLocation: {
              type: 'object',
              properties: {
                type: { type: 'string', default: 'Point' },
                coordinates: { type: 'array', items: { type: 'number' } },
                address: { type: 'string' }
              }
            },
            distance: { type: 'number' },
            estimatedDuration: { type: 'number' },
            actualDuration: { type: 'number' },
            fare: { type: 'number' },
            fareBreakdown: { type: 'object' },
            paymentMethod: { type: 'string', enum: ['cash', 'card', 'wallet'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Rides', description: 'Ride management endpoints' },
      { name: 'Drivers', description: 'Driver-specific endpoints' }
    ]
  },
  apis: ['./routes/*.js', './index.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
