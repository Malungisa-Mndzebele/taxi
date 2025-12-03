const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['passenger', 'driver'],
    default: 'passenger'
  },
  driverStatus: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  isDriver: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    required: false
  },
  verificationCodeExpires: {
    type: Date,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: false,
      validate: {
        validator: function(v) {
          // Allow undefined or null (field is not required)
          if (!v || v.length === 0) return true;
          if (!Array.isArray(v)) return false;
          if (v.length !== 2) return false;
          if (v[0] < -180 || v[0] > 180) return false;
          if (v[1] < -90 || v[1] > 90) return false;
          return true;
        },
        message: props => `${props.value} is not a valid coordinate pair`
      }
    },
    address: {
      type: String,
      required: false
    },
    lastUpdated: {
      type: Date,
      required: false
    }
  },
  driverProfile: {
    licenseNumber: {
      type: String,
      required: false
    },
    vehicleInfo: {
      make: { type: String },
      model: { type: String },
      year: { type: Number },
      color: { type: String },
      plateNumber: { type: String }
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    isAvailable: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    totalRides: {
      type: Number,
      default: 0
    }
  },
  passengerProfile: {
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    totalRides: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    type: Map,
    of: String,
    default: new Map()
  },
  deviceTokens: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

userSchema.pre('save', async function(next) {
  const user = this;

  if (user.isModified('role')) {
    user.isDriver = user.role === 'driver';
  }

  // Initialize passengerProfile if it doesn't exist
  if (!user.passengerProfile || !user.passengerProfile.rating) {
    if (!user.passengerProfile) {
      user.passengerProfile = {};
    }
    if (user.passengerProfile.rating === undefined) {
      user.passengerProfile.rating = 5.0;
    }
    if (user.passengerProfile.totalRides === undefined) {
      user.passengerProfile.totalRides = 0;
    }
  }

  // Initialize driverProfile if it doesn't exist and user is a driver
  if (user.role === 'driver') {
    if (!user.driverProfile) {
      user.driverProfile = {};
    }
    if (user.driverProfile.isOnline === undefined) {
      user.driverProfile.isOnline = false;
    }
    if (user.driverProfile.isAvailable === undefined) {
      user.driverProfile.isAvailable = false;
    }
    if (user.driverProfile.rating === undefined) {
      user.driverProfile.rating = 5.0;
    }
    if (user.driverProfile.totalRides === undefined) {
      user.driverProfile.totalRides = 0;
    }
  }

  if (user.isModified('password')) {
    // Use 1 round in test environment for speed, 10 rounds in production
    const saltRounds = process.env.NODE_ENV === 'test' ? 1 : 10;
    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(user.password, salt);
  }

  if (user.isModified()) {
    user.updatedAt = Date.now();
  }

  next();
});

userSchema.pre('save', function(next) {
  if (this.isModified('currentLocation.coordinates')) {
    if (this.currentLocation.coordinates.some(coord => typeof coord !== 'number')) {
      next(new Error('Location coordinates must be numbers'));
      return;
    }
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ 'currentLocation.coordinates': '2dsphere' }); // Geospatial index for nearby driver queries

const User = mongoose.model('User', userSchema);

module.exports = User;