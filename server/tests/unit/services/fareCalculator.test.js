/**
 * Unit Tests for FareCalculator Service
 * Tests fare calculation logic in isolation
 */

const fareCalculator = require('../../../services/fareCalculator');

describe('FareCalculator Service', () => {
  describe('calculateFare', () => {
    it('should calculate fare correctly', () => {
      const fare = fareCalculator.calculateFare(10, 15, 1.0);
      
      expect(fare).toBeDefined();
      expect(fare.baseFare).toBe(2.0);
      expect(fare.distanceFare).toBeGreaterThan(0);
      expect(fare.timeFare).toBeGreaterThan(0);
      expect(fare.surgeMultiplier).toBe(1.0);
      expect(fare.totalFare).toBeGreaterThan(0);
      expect(typeof fare.totalFare).toBe('number');
    });

    it('should calculate base fare correctly', () => {
      const fare = fareCalculator.calculateFare(0, 0, 1.0);
      
      expect(fare.baseFare).toBe(2.0);
      expect(fare.totalFare).toBeGreaterThanOrEqual(5.0); // Minimum fare
    });

    it('should calculate distance fare correctly', () => {
      const fare = fareCalculator.calculateFare(10, 0, 1.0);
      
      expect(fare.distanceFare).toBeCloseTo(15.0, 1); // 10 km * 1.5 per km
      expect(fare.timeFare).toBe(0);
    });

    it('should calculate time fare correctly', () => {
      const fare = fareCalculator.calculateFare(0, 15, 1.0);
      
      expect(fare.distanceFare).toBe(0);
      expect(fare.timeFare).toBeCloseTo(4.5, 1); // 15 min * 0.3 per min
    });

    it('should apply surge multiplier correctly', () => {
      const fare = fareCalculator.calculateFare(10, 15, 2.0);
      
      expect(fare.surgeMultiplier).toBe(2.0);
      const baseTotal = (fare.baseFare + fare.distanceFare + fare.timeFare);
      expect(fare.totalFare).toBeCloseTo(baseTotal * 2.0, 2);
    });

    it('should calculate total fare correctly', () => {
      const fare = fareCalculator.calculateFare(10, 15, 1.0);
      
      const expectedTotal = (fare.baseFare + fare.distanceFare + fare.timeFare) * fare.surgeMultiplier;
      expect(fare.totalFare).toBeCloseTo(expectedTotal, 2);
    });

    it('should handle zero distance', () => {
      const fare = fareCalculator.calculateFare(0, 5, 1.0);
      
      expect(fare.distanceFare).toBe(0);
      expect(fare.totalFare).toBeGreaterThan(0);
    });

    it('should handle zero duration', () => {
      const fare = fareCalculator.calculateFare(10, 0, 1.0);
      
      expect(fare.timeFare).toBe(0);
      expect(fare.totalFare).toBeGreaterThan(0);
    });

    it('should cap surge multiplier at 5.0', () => {
      const fare = fareCalculator.calculateFare(10, 15, 10.0);
      
      expect(fare.surgeMultiplier).toBeLessThanOrEqual(5.0);
    });

    it('should enforce minimum fare', () => {
      const fare = fareCalculator.calculateFare(0.1, 1, 1.0);
      
      expect(fare.totalFare).toBeGreaterThanOrEqual(5.0);
    });

    it('should return all required fare fields', () => {
      const fare = fareCalculator.calculateFare(10, 15, 1.0);
      
      expect(fare).toHaveProperty('baseFare');
      expect(fare).toHaveProperty('distanceFare');
      expect(fare).toHaveProperty('timeFare');
      expect(fare).toHaveProperty('surgeMultiplier');
      expect(fare).toHaveProperty('totalFare');
      
      expect(typeof fare.baseFare).toBe('number');
      expect(typeof fare.distanceFare).toBe('number');
      expect(typeof fare.timeFare).toBe('number');
      expect(typeof fare.surgeMultiplier).toBe('number');
      expect(typeof fare.totalFare).toBe('number');
    });
  });

  describe('calculateSurgeMultiplier', () => {
    it('should return 1.0 for normal demand', () => {
      const multiplier = fareCalculator.calculateSurgeMultiplier({
        demand: 10,
        supply: 20,
        timeOfDay: 'afternoon'
      });
      
      expect(multiplier).toBe(1.0);
    });

    it('should increase multiplier for high demand', () => {
      const multiplier = fareCalculator.calculateSurgeMultiplier({
        demand: 50,
        supply: 10,
        timeOfDay: 'evening'
      });
      
      expect(multiplier).toBeGreaterThan(1.0);
      expect(multiplier).toBeLessThanOrEqual(5.0);
    });

    it('should consider time of day', () => {
      const rushHour = fareCalculator.calculateSurgeMultiplier({
        demand: 30,
        supply: 20,
        timeOfDay: 'rush-hour'
      });
      
      const normal = fareCalculator.calculateSurgeMultiplier({
        demand: 30,
        supply: 20,
        timeOfDay: 'afternoon'
      });
      
      expect(rushHour).toBeGreaterThanOrEqual(normal);
    });

    it('should cap multiplier at 5.0', () => {
      const multiplier = fareCalculator.calculateSurgeMultiplier({
        demand: 100,
        supply: 1,
        timeOfDay: 'rush-hour'
      });
      
      expect(multiplier).toBeLessThanOrEqual(5.0);
    });
  });

  describe('estimateFare', () => {
    it('should estimate fare for given distance and duration', () => {
      const estimate = fareCalculator.estimateFare(10, 15);
      
      expect(estimate).toBeGreaterThan(0);
      expect(estimate).toBeLessThan(100); // Reasonable upper bound
      expect(typeof estimate).toBe('number');
    });

    it('should return estimate without surge by default', () => {
      const estimate = fareCalculator.estimateFare(10, 15, { includeSurge: false });
      
      expect(estimate).toBeGreaterThan(0);
    });
  });
});
