import React from 'react';
import { useAuth } from '../context/AuthContext';
import DriverDashboard from './DriverDashboard';
import PassengerDashboard from './PassengerDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="animate-fade-in">
            {user.role === 'driver' ? <DriverDashboard /> : <PassengerDashboard />}
        </div>
    );
};

export default Dashboard;
