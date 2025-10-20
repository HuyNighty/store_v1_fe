import React, { createContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';

export const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    login: async () => {},
    logout: async () => {},
});

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('access_token')));
    const [user, setUser] = useState(null);

    const fetchUser = useCallback(async () => {
        try {
            const res = await authApi.me();
            const data = res.data?.result;
            if (data) setUser(data);
        } catch (e) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('access_token');
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUser();
        }
    }, [isAuthenticated, fetchUser]);

    const login = async ({ identifier, password }) => {
        const res = await authApi.login({ identifier, password });
        const token =
            res.data?.result?.token || res.data?.result?.accessToken || res.data?.token || res.data?.accessToken;
        if (!token) throw new Error('No token returned from login');

        localStorage.setItem('access_token', token);
        setIsAuthenticated(true);

        await fetchUser();
        return true;
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (e) {
            console.error('[AuthContext] Logout failed:', e);
        } finally {
            localStorage.removeItem('access_token');
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    return <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>{children}</AuthContext.Provider>;
}
