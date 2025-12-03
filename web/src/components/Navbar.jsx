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
            <div className="nav-brand">
                <span style={{ fontSize: '1.5rem' }}>🚖</span>
                <span>Taxi App</span>
            </div>
            <div className="nav-user">
                <div className="flex items-center gap-2">
                    <span>{user?.firstName}</span>
                    <span className="status-badge status-success">{user?.role}</span>
                </div>
                <button className="secondary" onClick={handleLogout} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
