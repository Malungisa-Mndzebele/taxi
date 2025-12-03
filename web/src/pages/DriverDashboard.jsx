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
        <div className="container animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2>Driver Dashboard</h2>
                    <p>Manage your status and accept rides</p>
                </div>
                <button
                    className={isOnline ? 'secondary' : ''}
                    onClick={toggleStatus}
                    style={{ minWidth: '140px' }}
                >
                    <span style={{ marginRight: '0.5rem' }}>{isOnline ? '🔴' : '🟢'}</span>
                    {isOnline ? 'Go Offline' : 'Go Online'}
                </button>
            </div>

            {error && <div className="status-badge status-error mb-4">{error}</div>}

            {!isOnline ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>😴</div>
                    <h3>You are currently offline</h3>
                    <p>Go online to start receiving ride requests in your area.</p>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3>Available Rides</h3>
                        <button className="secondary" onClick={loadRides} disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                            {loading ? 'Refreshing...' : 'Refresh List'}
                        </button>
                    </div>

                    <div className="grid">
                        {availableRides.length === 0 ? (
                            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                                <p>No rides available at the moment. Waiting for requests...</p>
                            </div>
                        ) : (
                            availableRides.map((ride) => (
                                <div key={ride._id} className="glass-card ride-item" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="status-badge status-warning">New Request</span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>
                                            ${ride.fare?.totalFare || 'TBD'}
                                        </span>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div className="mb-4">
                                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Pickup</div>
                                            <div style={{ fontWeight: '500' }}>{ride.pickupLocation?.address || 'Unknown'}</div>
                                        </div>
                                        <div className="mb-4">
                                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Dropoff</div>
                                            <div style={{ fontWeight: '500' }}>{ride.dropoffLocation?.address || 'Unknown'}</div>
                                        </div>
                                    </div>

                                    <button onClick={() => acceptRide(ride._id)} className="w-full mt-4">
                                        Accept Ride
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
