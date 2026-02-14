import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function AdminAuthProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing admin session
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('adminToken');
            if (storedToken) {
                try {
                    const response = await axios.get(`${API_BASE}/admin-auth/me`, {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });
                    setAdmin(response.data.data);
                    setToken(storedToken);
                } catch (error) {
                    console.error('Admin auth check failed:', error);
                    localStorage.removeItem('adminToken');
                    setToken(null);
                    setAdmin(null);
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE}/admin-auth/login`, {
                email,
                password
            });

            const { token: newToken, user } = response.data.data;
            setToken(newToken);
            setAdmin(user);
            localStorage.setItem('adminToken', newToken);
            return { success: true };
        } catch (error) {
            console.error('Admin login failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || '로그인에 실패했습니다'
            };
        }
    };

    const logout = async () => {
        setAdmin(null);
        setToken(null);
        localStorage.removeItem('adminToken');
    };

    const value = {
        admin,
        token,
        isLoading,
        isAuthenticated: !!admin,
        login,
        logout,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}
