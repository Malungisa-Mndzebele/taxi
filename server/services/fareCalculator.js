/**
 * Fare Calculator Service
 * Calculates ride fares based on distance, duration, and surge pricing
 */

class FareCalculator {
  constructor() {
    // Base fare configuration
    this.baseFare = 2.0;
    this.perKmRate = 1.5;
    this.perMinuteRate = 0.3;
    this.minimumFare = 5.0;
    this.maxSurgeMultiplier = 5.0;
  }

  /**
   * Calculate fare for a ride
   * @param {Number} distance - Distance in kilometers
   * @param {Number} duration - Duration in minutes
   * @param {Number} surgeMultiplier - Surge multiplier (default: 1.0)
   * @returns {Object} Fare breakdown
   */
  calculateFare(distance, duration, surgeMultiplier = 1.0) {
    // Validate inputs
    if (distance < 0) distance = 0;
    if (duration < 0) duration = 0;
    if (surgeMultiplier < 1.0) surgeMultiplier = 1.0;
    if (surgeMultiplier > this.maxSurgeMultiplier) surgeMultiplier = this.maxSurgeMultiplier;

    // Calculate fare components
    const baseFare = this.baseFare;
    let distanceFare = distance * this.perKmRate;
    let timeFare = duration * this.perMinuteRate;
    
    // Calculate subtotal
    const subtotal = baseFare + distanceFare + timeFare;
    
    // Apply surge multiplier
    let totalFare = subtotal * surgeMultiplier;
    
    // Apply minimum fare
    if (totalFare < this.minimumFare) {
      totalFare = this.minimumFare;
    }

    // Round to 2 decimal places
    totalFare = Math.round(totalFare * 100) / 100;
    distanceFare = Math.round(distanceFare * 100) / 100;
    timeFare = Math.round(timeFare * 100) / 100;

    return {
      baseFare,
      distanceFare,
      timeFare,
      surgeMultiplier,
      totalFare
    };
  }

  /**
   * Calculate surge multiplier based on demand and supply
   * @param {Object} params - Surge calculation parameters
   * @param {Number} params.demand - Number of ride requests
   * @param {Number} params.supply - Number of available drivers
   * @param {String} params.timeOfDay - Time of day (optional)
   * @returns {Number} Surge multiplier
   */
  calculateSurgeMultiplier({ demand = 0, supply = 1, timeOfDay = 'normal' }) {
    if (supply === 0) supply = 1; // Prevent division by zero
    
    // Base multiplier from demand/supply ratio
    const ratio = demand / supply;
    let multiplier = 1.0;

    // Apply surge based on ratio
    if (ratio > 3) {
      multiplier = 2.0;
    } else if (ratio > 2) {
      multiplier = 1.5;
    } else if (ratio > 1.5) {
      multiplier = 1.2;
    }

    // Apply time-of-day multiplier
    const timeMultipliers = {
      'rush-hour': 1.3,
      'evening': 1.2,
      'night': 1.1,
      'normal': 1.0,
      'afternoon': 1.0
    };

    const timeMultiplier = timeMultipliers[timeOfDay] || 1.0;
    multiplier = multiplier * timeMultiplier;

    // Cap at maximum
    if (multiplier > this.maxSurgeMultiplier) {
      multiplier = this.maxSurgeMultiplier;
    }

    // Round to 1 decimal place
    return Math.round(multiplier * 10) / 10;
  }

  /**
   * Estimate fare for a ride (without surge)
   * @param {Number} distance - Distance in kilometers
   * @param {Number} duration - Duration in minutes
   * @param {Object} options - Additional options
   * @param {Boolean} options.includeSurge - Include surge pricing (default: false)
   * @returns {Number} Estimated fare
   */
  estimateFare(distance, duration, options = {}) {
    const { includeSurge = false } = options;
    const surgeMultiplier = includeSurge ? this.calculateSurgeMultiplier({ demand: 10, supply: 5 }) : 1.0;
    const fare = this.calculateFare(distance, duration, surgeMultiplier);
    return fare.totalFare;
  }
}

// Export singleton instance
module.exports = new FareCalculator();

