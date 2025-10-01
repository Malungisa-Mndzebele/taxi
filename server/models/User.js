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
          if (!v || !Array.isArray(v)) return false;
          if (v.length !== 2) return false;
          if (v[0] < -180 || v[0] > 180) return false;
          if (v[1] < -90 || v[1] > 90) return false;
          return true;
        },
        message: props => `${props.value} is not a valid coordinate pair`
      }
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

  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
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

const User = mongoose.model('User', userSchema);

module.exports = User;