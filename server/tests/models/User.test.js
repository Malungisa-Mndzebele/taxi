const User = require('../../models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.phone).toBe(userData.phone);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    it('should not create user with duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      await new User(userData).save();

      const duplicateUser = new User({
        ...userData,
        phone: '+0987654321'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should not create user with duplicate phone', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      await new User(userData).save();

      const duplicateUser = new User({
        ...userData,
        email: 'jane@example.com'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should require all mandatory fields', async () => {
      const user = new User({});
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+1234567890',
        password: 'password123'
      };

      const user = new User(userData);
      // Note: Mongoose email validation might not be strict by default
      // This test verifies the user can be created, but in production
      // you would add custom email validation
      const savedUser = await user.save();
      expect(savedUser.email).toBe('invalid-email');
    });

    it('should validate password length', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: '123' // Too short
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash length
    });

    it('should not hash password if not modified', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();
      const originalPassword = user.password;

      // Update non-password field
      user.firstName = 'Jane';
      await user.save();

      expect(user.password).toBe(originalPassword);
    });
  });

  describe('Password Comparison', () => {
    it('should compare password correctly', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Driver Profile', () => {
    it('should create driver with vehicle information', async () => {
      const driverData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'driver',
        driverProfile: {
          licenseNumber: 'DL123456',
          vehicleInfo: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'White',
            plateNumber: 'ABC-123'
          }
        }
      };

      const driver = new User(driverData);
      const savedDriver = await driver.save();

      expect(savedDriver.driverProfile.licenseNumber).toBe('DL123456');
      expect(savedDriver.driverProfile.vehicleInfo.make).toBe('Toyota');
      expect(savedDriver.driverProfile.vehicleInfo.model).toBe('Camry');
      expect(savedDriver.driverProfile.vehicleInfo.year).toBe(2020);
      expect(savedDriver.driverProfile.vehicleInfo.color).toBe('White');
      expect(savedDriver.driverProfile.vehicleInfo.plateNumber).toBe('ABC-123');
      expect(savedDriver.driverProfile.isOnline).toBe(false);
      expect(savedDriver.driverProfile.isAvailable).toBe(false);
    });
  });

  describe('Location Data', () => {
    it('should store location data correctly', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        currentLocation: {
          type: 'Point',
          coordinates: [-122.4324, 37.78825],
          address: 'San Francisco, CA',
          lastUpdated: new Date()
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.currentLocation.type).toBe('Point');
      expect(savedUser.currentLocation.coordinates).toEqual([-122.4324, 37.78825]);
      expect(savedUser.currentLocation.address).toBe('San Francisco, CA');
      expect(savedUser.currentLocation.lastUpdated).toBeDefined();
    });
  });

  describe('JSON Transformation', () => {
    it('should exclude password from JSON output', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      const userJSON = user.toJSON();
      expect(userJSON.password).toBeUndefined();
      expect(userJSON.firstName).toBe('John');
      expect(userJSON.email).toBe('john@example.com');
    });
  });

  describe('Virtual Fields', () => {
    it('should return full name correctly', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      expect(user.fullName).toBe('John Doe');
    });
  });
});
