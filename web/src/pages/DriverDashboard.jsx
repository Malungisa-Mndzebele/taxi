import React, { useState, useEffect } from 'react';
import { rides, drivers } from '../services/api';

const DriverDashboard = () => {
    const [availableRides, setAvailableRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOnline, setIsOnline] = useState(false);

    const loadRides = async () => {
        setLoading(true);
        try {
            const response = await rides.getAvailable();
            setAvailableRides(response.data.rides || []);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load rides');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async () => {
        try {
            await drivers.setStatus(!isOnline);
            setIsOnline(!isOnline);
            if (!isOnline) loadRides();
        } catch (err) {
            console.error(err);
            console.error('Failed to update status');
        }
    };

    const acceptRide = async (rideId) => {
        try {
            await rides.accept(rideId);
            loadRides(); // Refresh list
        } catch (err) {
            console.error(err);
            setError('Failed to accept ride');
        }
    };

    useEffect(() => {
        if (isOnline) {
            loadRides();
            const interval = setInterval(loadRides, 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [isOnline]);

    return (
        <div className="container">
            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>Driver Dashboard</h2>
                    <button
                        className={isOnline ? 'secondary' : ''}
                        onClick={toggleStatus}
                    >
                        {isOnline ? 'Go Offline' : 'Go Online'}
                    </button>
                </div>

                {error && <div className="status-badge status-error">{error}</div>}

                {!isOnline ? (
                    <p>You are currently offline. Go online to see available rides.</p>
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Available Rides</h3>
                            <button className="secondary" onClick={loadRides} disabled={loading}>
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>

                        <div className="grid">
                            {availableRides.length === 0 ? (
                                <p>No rides available at the moment.</p>
                            ) : (
                                availableRides.map((ride) => (
                                    <div key={ride._id} className="glass-card ride-item">
                                        <h4>Ride Request</h4>
                                        <p><strong>From:</strong> {ride.pickupLocation?.address || 'Unknown'}</p>
                                        <p><strong>To:</strong> {ride.dropoffLocation?.address || 'Unknown'}</p>
                                        <p><strong>Fare:</strong> ${ride.fare?.totalFare || 'TBD'}</p>
                                        <button onClick={() => acceptRide(ride._id)}>Accept Ride</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverDashboard;
