import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="nav animate-fade-in">
            <div className="nav-brand">🚖 Taxi App</div>
            <div className="nav-user">
                <span>Welcome, {user?.firstName}</span>
                <span className="status-badge status-success">{user?.role}</span>
                <button className="secondary" onClick={handleLogout}>Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
