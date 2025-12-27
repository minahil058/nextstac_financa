import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDataService } from '../services/mockDataService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Use Environment Variable or default to relative path (Vercel) or localhost
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for persisted user session
        const storedUser = localStorage.getItem('erp_user_session');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse user session', error);
                localStorage.removeItem('erp_user_session');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Invalid credentials' };
            }

            const sessionUser = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                permissions: ['all'],
                avatar: data.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=random`
            };

            setUser(sessionUser);
            localStorage.setItem('erp_user_session', JSON.stringify(sessionUser));
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Connection error' };
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Registration failed' };
            }

            const sessionUser = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                permissions: ['all'],
                avatar: data.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=random`
            };

            setUser(sessionUser);
            localStorage.setItem('erp_user_session', JSON.stringify(sessionUser));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('erp_user_session');
        window.location.href = '/login';
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
