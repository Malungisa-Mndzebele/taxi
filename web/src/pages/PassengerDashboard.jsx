import React, { useState, useEffect } from 'react';
import { rides } from '../services/api';

const PassengerDashboard = () => {
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [activeRides, setActiveRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const requestRide = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Mock coordinates for now as the backend expects them
            const rideData = {
                pickupLocation: pickup,
                dropoffLocation: dropoff,
                pickupLat: 40.7128,
                pickupLng: -74.0060,
                dropoffLat: 40.7589,
                dropoffLng: -73.9851
            };

            await rides.request(rideData);
            setSuccess('Ride requested successfully!');
            setPickup('');
            setDropoff('');
            loadActiveRides();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request ride');
        } finally {
            setLoading(false);
        }
    };

    const loadActiveRides = async () => {
        try {
            const response = await rides.getActive();
            setActiveRides(response.data.rides || []);
        } catch (err) {
            console.error(err);
            console.error('Failed to load active rides');
        }
    };

    useEffect(() => {
        loadActiveRides();
        const interval = setInterval(loadActiveRides, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container">
            <div className="glass-card">
                <h2>Request a Ride</h2>
                {error && <div className="status-badge status-error" style={{ display: 'block', marginBottom: '1rem' }}>{error}</div>}
                {success && <div className="status-badge status-success" style={{ display: 'block', marginBottom: '1rem' }}>{success}</div>}

                <form onSubmit={requestRide}>
                    <input
                        placeholder="Pickup Location"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        required
                    />
                    <input
                        placeholder="Dropoff Location"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Requesting...' : 'Request Ride'}
                    </button>
                </form>
            </div>

            <div className="glass-card">
                <h3>Your Active Rides</h3>
                {activeRides.length === 0 ? (
                    <p>No active rides.</p>
                ) : (
                    <div className="grid" style={{ marginTop: '1rem' }}>
                        {activeRides.map((ride) => (
                            <div key={ride._id} className="ride-item" style={{ border: '1px solid var(--glass-border)', borderRadius: '0.5rem', padding: '1rem' }}>
                                <p><strong>From:</strong> {ride.pickupLocation?.address}</p>
                                <p><strong>To:</strong> {ride.dropoffLocation?.address}</p>
                                <p><strong>Status:</strong> <span className="status-badge status-success">{ride.status}</span></p>
                                <p><strong>Driver:</strong> {ride.driver ? `${ride.driver.firstName} ${ride.driver.lastName}` : 'Finding driver...'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PassengerDashboard;
