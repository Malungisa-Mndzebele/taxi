const request = require('supertest');
const { app } = require('../../test-server');
const User = require('../../models/User');
const Ride = require('../../models/Ride');

describe('Complete Ride Journey E2E Test', () => {
  let passengerToken, driverToken;
  let passengerId, driverId;
  let rideId;

  // Test data
  const passengerData = {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: `passenger.${Date.now()}@example.com`,
    phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    password: 'SecurePass123!',
    role: 'passenger'
  };

  const driverData = {
    firstName: 'Bob',
    lastName: 'Smith',
    email: `driver.${Date.now()}@example.com`,
    phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    password: 'SecurePass456!',
    role: 'driver',
    licenseNumber: 'DL987654',
    vehicleInfo: {
      make: 'Honda',
      model: 'Accord',
      year: 2022,
      color: 'Silver',
      plateNumber: 'XYZ-789'
    }
  };

  describe('Complete Ride Flow: From Registration to Completion', () => {
    it('should complete entire ride journey successfully', async () => {
      // ========================================
      // STEP 1: Register Passenger Account
      // ========================================
      console.log('\n📝 Step 1: Registering passenger account...');
      const passengerRegResponse = await request(app)
        .post('/api/auth/register')
        .send(passengerData)
        .expect(201);

      expect(passengerRegResponse.body.message).toBe('User registered successfully');
      expect(passengerRegResponse.body.user.email).toBe(passengerData.email);
      expect(passengerRegResponse.body.user.role).toBe('passenger');
      passengerId = passengerRegResponse.body.user.id;
      console.log(`✅ Passenger registered: ${passengerData.firstName} ${passengerData.lastName} (ID: ${passengerId})`);

      // ========================================
      // STEP 2: Register Driver Account
      // ========================================
      console.log('\n📝 Step 2: Registering driver account...');
      const driverRegResponse = await request(app)
        .post('/api/auth/register')
        .send(driverData)
        .expect(201);

      expect(driverRegResponse.body.message).toBe('User registered successfully');
      expect(driverRegResponse.body.user.email).toBe(driverData.email);
      expect(driverRegResponse.body.user.role).toBe('driver');
      driverId = driverRegResponse.body.user.id;
      console.log(`✅ Driver registered: ${driverData.firstName} ${driverData.lastName} (ID: ${driverId})`);

      // ========================================
      // STEP 3: Passenger Login
      // ========================================
      console.log('\n🔐 Step 3: Passenger logging in...');
      const passengerLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: passengerData.email,
          password: passengerData.password
        })
        .expect(200);

      expect(passengerLoginResponse.body.token).toBeDefined();
      passengerToken = passengerLoginResponse.body.token;
      console.log('✅ Passenger logged in successfully');

      // ========================================
      // STEP 4: Driver Login
      // ========================================
      console.log('\n🔐 Step 4: Driver logging in...');
      const driverLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: driverData.email,
          password: driverData.password
        })
        .expect(200);

      expect(driverLoginResponse.body.token).toBeDefined();
      driverToken = driverLoginResponse.body.token;
      console.log('✅ Driver logged in successfully');

      // ========================================
      // STEP 5: Update Driver Profile
      // ========================================
      console.log('\n🚗 Step 5: Updating driver profile with vehicle info...');
      await request(app)
        .put('/api/drivers/profile')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          licenseNumber: driverData.licenseNumber,
          vehicleInfo: driverData.vehicleInfo
        })
        .expect(200);

      console.log(`✅ Driver profile updated: ${driverData.vehicleInfo.make} ${driverData.vehicleInfo.model}`);

      // ========================================
      // STEP 6: Driver Goes Online
      // ========================================
      console.log('\n🟢 Step 6: Driver going online...');
      const driverStatusResponse = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ isOnline: true, isAvailable: true })
        .expect(200);

      expect(driverStatusResponse.body.status.isOnline).toBe(true);
      expect(driverStatusResponse.body.status.isAvailable).toBe(true);
      console.log('✅ Driver is now online and available');

      // ========================================
      // STEP 7: Update Driver Location
      // ========================================
      console.log('\n📍 Step 7: Updating driver location...');
      await request(app)
        .put('/api/drivers/location')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          coordinates: [-122.4300, 37.7900],
          address: 'Near San Francisco, CA'
        })
        .expect(200);

      console.log('✅ Driver location updated');

      // ========================================
      // STEP 8: Passenger Requests a Ride
      // ========================================
      console.log('\n🚕 Step 8: Passenger requesting a ride...');
      const rideRequestData = {
        pickupLocation: {
          coordinates: [-122.4324, 37.78825],
          address: '123 Market St, San Francisco, CA'
        },
        dropoffLocation: {
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco International Airport, CA'
        },
        distance: 15.5,
        estimatedDuration: 25,
        paymentMethod: 'card'
      };

      const rideRequestResponse = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(rideRequestData)
        .expect(201);

      expect(rideRequestResponse.body.ride.status).toBe('requested');
      rideId = rideRequestResponse.body.ride._id || rideRequestResponse.body.ride.id;
      console.log(`✅ Ride requested (ID: ${rideId})`);
      console.log(`   Pickup: ${rideRequestData.pickupLocation.address}`);
      console.log(`   Dropoff: ${rideRequestData.dropoffLocation.address}`);
      console.log(`   Estimated fare: $${rideRequestResponse.body.ride.fare.totalFare.toFixed(2)}`);

      // ========================================
      // STEP 9: Driver Views Available Rides
      // ========================================
      console.log('\n👀 Step 9: Driver checking available rides...');
      const availableRidesResponse = await request(app)
        .get('/api/rides/available')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(availableRidesResponse.body.rides.length).toBeGreaterThan(0);
      const requestedRide = availableRidesResponse.body.rides.find(
        r => (r._id || r.id) === rideId
      );
      expect(requestedRide).toBeDefined();
      console.log(`✅ Driver found ${availableRidesResponse.body.rides.length} available ride(s)`);

      // ========================================
      // STEP 10: Driver Accepts the Ride
      // ========================================
      console.log('\n✋ Step 10: Driver accepting the ride...');
      const acceptResponse = await request(app)
        .post(`/api/rides/${rideId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(acceptResponse.body.ride.status).toBe('accepted');
      console.log('✅ Ride accepted by driver');

      // Verify driver is no longer available
      const driverAfterAccept = await User.findById(driverId);
      expect(driverAfterAccept.driverProfile.isAvailable).toBe(false);
      console.log('   Driver is now marked as unavailable');

      // ========================================
      // STEP 11: Passenger Views Active Ride
      // ========================================
      console.log('\n📱 Step 11: Passenger checking active ride status...');
      const passengerActiveRides = await request(app)
        .get('/api/rides/active')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(passengerActiveRides.body.rides.length).toBe(1);
      expect(passengerActiveRides.body.rides[0].status).toBe('accepted');
      console.log('✅ Passenger can see accepted ride');

      // ========================================
      // STEP 12: Driver Arrives at Pickup
      // ========================================
      console.log('\n🚗 Step 12: Driver arriving at pickup location...');
      const arriveResponse = await request(app)
        .post(`/api/rides/${rideId}/arrive`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(arriveResponse.body.ride.status).toBe('arrived');
      console.log('✅ Driver has arrived at pickup location');

      // ========================================
      // STEP 13: Driver Starts the Ride
      // ========================================
      console.log('\n🏁 Step 13: Starting the ride...');
      const startResponse = await request(app)
        .post(`/api/rides/${rideId}/start`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(startResponse.body.ride.status).toBe('started');
      console.log('✅ Ride has started - passenger is on board');

      // ========================================
      // STEP 14: Driver Completes the Ride
      // ========================================
      console.log('\n🎯 Step 14: Completing the ride...');
      const completeResponse = await request(app)
        .post(`/api/rides/${rideId}/complete`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(completeResponse.body.ride.status).toBe('completed');
      expect(completeResponse.body.ride.payment.status).toBe('completed');
      console.log('✅ Ride completed successfully');
      console.log(`   Final fare: $${completeResponse.body.ride.payment ? 'Paid' : 'Pending'}`);

      // Verify driver is available again
      const driverAfterComplete = await User.findById(driverId);
      expect(driverAfterComplete.driverProfile.isAvailable).toBe(true);
      console.log('   Driver is now available for new rides');

      // ========================================
      // STEP 15: Passenger Rates the Driver
      // ========================================
      console.log('\n⭐ Step 15: Passenger rating the driver...');
      const passengerRatingResponse = await request(app)
        .post('/api/users/rating')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          rideId: rideId,
          rating: 5,
          review: 'Excellent driver! Very professional and safe.'
        });

      if (passengerRatingResponse.status !== 200) {
        console.log('Rating error:', passengerRatingResponse.status, passengerRatingResponse.body);
      }
      expect(passengerRatingResponse.status).toBe(200);
      expect(passengerRatingResponse.body.message).toBe('Rating submitted successfully');
      console.log('✅ Passenger rated driver: 5 stars');

      // ========================================
      // STEP 16: Driver Rates the Passenger
      // ========================================
      console.log('\n⭐ Step 16: Driver rating the passenger...');
      const driverRatingResponse = await request(app)
        .post('/api/users/rating')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          rideId: rideId,
          rating: 5,
          review: 'Great passenger! Friendly and on time.'
        })
        .expect(200);

      expect(driverRatingResponse.body.message).toBe('Rating submitted successfully');
      console.log('✅ Driver rated passenger: 5 stars');

      // ========================================
      // STEP 17: Verify Ride in History
      // ========================================
      console.log('\n📜 Step 17: Verifying ride appears in history...');
      
      // Passenger history
      const passengerHistory = await request(app)
        .get('/api/rides/history')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(passengerHistory.body.rides.length).toBeGreaterThan(0);
      const passengerRide = passengerHistory.body.rides.find(
        r => (r._id || r.id).toString() === rideId.toString()
      );
      expect(passengerRide).toBeDefined();
      expect(passengerRide.status).toBe('completed');
      console.log('✅ Ride appears in passenger history');

      // Driver history
      const driverHistory = await request(app)
        .get('/api/drivers/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(driverHistory.body.rides.length).toBeGreaterThan(0);
      const driverRide = driverHistory.body.rides.find(
        r => (r._id || r.id).toString() === rideId.toString()
      );
      expect(driverRide).toBeDefined();
      expect(driverRide.status).toBe('completed');
      console.log('✅ Ride appears in driver history');

      // ========================================
      // STEP 18: Check Driver Earnings
      // ========================================
      console.log('\n💰 Step 18: Checking driver earnings...');
      const earningsResponse = await request(app)
        .get('/api/drivers/earnings')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(earningsResponse.body.earnings.totalRides).toBeGreaterThan(0);
      expect(earningsResponse.body.earnings).toBeDefined();
      console.log(`✅ Driver earnings tracked`);
      console.log(`   Total rides: ${earningsResponse.body.earnings.totalRides}`);

      // ========================================
      // STEP 19: Verify Final Ride Details
      // ========================================
      console.log('\n🔍 Step 19: Verifying final ride details...');
      const finalRide = await Ride.findById(rideId)
        .populate('passenger', 'firstName lastName')
        .populate('driver', 'firstName lastName');

      expect(finalRide.status).toBe('completed');
      expect(finalRide.rating.passengerRating).toBe(5);
      expect(finalRide.rating.driverRating).toBe(5);
      expect(finalRide.timeline.completedAt).toBeDefined();
      console.log('✅ All ride details verified');
      console.log(`   Passenger: ${finalRide.passenger.firstName} ${finalRide.passenger.lastName}`);
      console.log(`   Driver: ${finalRide.driver.firstName} ${finalRide.driver.lastName}`);
      console.log(`   Duration: ${Math.round((finalRide.timeline.completedAt - finalRide.timeline.requestedAt) / 1000)}s`);

      // ========================================
      // STEP 20: Driver Goes Offline
      // ========================================
      console.log('\n🔴 Step 20: Driver going offline...');
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ isOnline: false, isAvailable: false })
        .expect(200);

      console.log('✅ Driver is now offline');

      // ========================================
      // FINAL SUMMARY
      // ========================================
      console.log('\n' + '='.repeat(60));
      console.log('🎉 COMPLETE RIDE JOURNEY TEST PASSED! 🎉');
      console.log('='.repeat(60));
      console.log(`Passenger: ${passengerData.firstName} ${passengerData.lastName}`);
      console.log(`Driver: ${driverData.firstName} ${driverData.lastName}`);
      console.log(`Vehicle: ${driverData.vehicleInfo.make} ${driverData.vehicleInfo.model}`);
      console.log(`Ride ID: ${rideId}`);
      console.log(`Status: ✅ Completed`);
      console.log(`Ratings: ⭐⭐⭐⭐⭐ (Both 5 stars)`);
      console.log('='.repeat(60) + '\n');
    });
  });

  // Cleanup after test
  afterAll(async () => {
    if (passengerId) {
      await User.findByIdAndDelete(passengerId);
    }
    if (driverId) {
      await User.findByIdAndDelete(driverId);
    }
    if (rideId) {
      await Ride.findByIdAndDelete(rideId);
    }
  });
});
