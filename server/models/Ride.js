const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled'],
    default: 'requested'
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  dropoffLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  distance: {
    type: Number, // in kilometers
    required: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  fare: {
    baseFare: {
      type: Number,
      required: true
    },
    distanceFare: {
      type: Number,
      required: true
    },
    timeFare: {
      type: Number,
      required: true
    },
    surgeMultiplier: {
      type: Number,
      default: 1.0
    },
    totalFare: {
      type: Number,
      required: true
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'cash', 'wallet'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  rating: {
    passengerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    driverRating: {
      type: Number,
      min: 1,
      max: 5
    },
    passengerReview: String,
    driverReview: String
  },
  timeline: {
    requestedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: Date,
    arrivedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date
  },
  cancellationReason: String,
  notes: String
}, {
  timestamps: true
});

// Index for geospatial queries
rideSchema.index({ 'pickupLocation': '2dsphere' });
rideSchema.index({ 'dropoffLocation': '2dsphere' });

// Index for status and user queries
rideSchema.index({ status: 1 });
rideSchema.index({ passenger: 1, status: 1 });
rideSchema.index({ driver: 1, status: 1 });

// Calculate total fare
rideSchema.methods.calculateFare = function() {
  const { baseFare, distanceFare, timeFare, surgeMultiplier } = this.fare;
  this.fare.totalFare = (baseFare + distanceFare + timeFare) * surgeMultiplier;
  return this.fare.totalFare;
};

// Update ride status
rideSchema.methods.updateStatus = function(newStatus, additionalData = {}) {
  this.status = newStatus;
  
  // Update timeline
  const now = new Date();
  switch (newStatus) {
    case 'accepted':
      this.timeline.acceptedAt = now;
      break;
    case 'arrived':
      this.timeline.arrivedAt = now;
      break;
    case 'started':
      this.timeline.startedAt = now;
      break;
    case 'completed':
      this.timeline.completedAt = now;
      break;
    case 'cancelled':
      this.timeline.cancelledAt = now;
      this.cancellationReason = additionalData.reason;
      break;
  }
  
  return this.save();
};

// Get ride duration
rideSchema.virtual('duration').get(function() {
  if (this.timeline.startedAt && this.timeline.completedAt) {
    return Math.round((this.timeline.completedAt - this.timeline.startedAt) / 60000); // minutes
  }
  return null;
});

module.exports = mongoose.model('Ride', rideSchema);
