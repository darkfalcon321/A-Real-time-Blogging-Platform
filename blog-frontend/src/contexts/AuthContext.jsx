import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create axios instance with proper config
const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);       // flag for inspect if user logged in or nae;if true then verification not done

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await api.get('/api/me');
            
            if (response.data && response.data._id) {
                setUser(response.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Authentication check failed:', error.response?.status);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        window.location.href = 'http://localhost:3000/auth/google';
    };

    const logout = async () => {
        try {
            await api.get('/logout');
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            window.location.href = '/';
        }
    };

    const value = {
        user,
        login,
        logout,
        loading,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};