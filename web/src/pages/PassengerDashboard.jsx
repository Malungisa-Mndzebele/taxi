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
            // Format data according to backend API requirements
            const rideData = {
                pickupLocation: {
                    coordinates: [-74.0060, 40.7128], // [longitude, latitude]
                    address: pickup
                },
                dropoffLocation: {
                    coordinates: [-73.9851, 40.7589], // [longitude, latitude]
                    address: dropoff
                },
                distance: 5.2, // Mock distance in km
                estimatedDuration: 15, // Mock duration in minutes
                paymentMethod: 'cash'
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
        <div className="container animate-fade-in">
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', alignItems: 'start' }}>

                {/* Request Ride Section */}
                <div className="glass-card">
                    <div className="mb-4">
                        <h2>Request a Ride</h2>
                        <p>Where do you want to go today?</p>
                    </div>

                    {error && <div className="status-badge status-error w-full mb-4">{error}</div>}
                    {success && <div className="status-badge status-success w-full mb-4">{success}</div>}

                    <form onSubmit={requestRide}>
                        <div className="mb-4">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Pickup Location</label>
                            <input
                                placeholder="e.g. 123 Main St"
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Destination</label>
                            <input
                                placeholder="e.g. Central Park"
                                value={dropoff}
                                onChange={(e) => setDropoff(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full" style={{ padding: '1rem' }}>
                            {loading ? 'Finding Drivers...' : 'Request Ride Now'}
                        </button>
                    </form>
                </div>

                {/* Active Rides Section */}
                <div>
                    <h3 className="mb-4">Your Active Rides</h3>
                    {activeRides.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
                            <p>No active rides currently.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {activeRides.map((ride) => (
                                <div key={ride._id} className="glass-card" style={{ padding: '1.5rem' }}>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="status-badge status-success">{ride.status}</span>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>#{ride._id.slice(-6)}</span>
                                    </div>

                                    <div className="mb-4" style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--glass-border)' }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '50%', position: 'absolute', left: '-6px', top: '5px' }}></div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>From</div>
                                            <div>{ride.pickupLocation?.address}</div>
                                        </div>
                                        <div>
                                            <div style={{ width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%', position: 'absolute', left: '-6px', top: 'auto', bottom: '5px' }}></div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>To</div>
                                            <div>{ride.dropoffLocation?.address}</div>
                                        </div>
                                    </div>

                                    <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                                            👤
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Driver</div>
                                            <div style={{ fontWeight: '600' }}>
                                                {ride.driver ? `${ride.driver.firstName} ${ride.driver.lastName}` : 'Finding driver...'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PassengerDashboard;
