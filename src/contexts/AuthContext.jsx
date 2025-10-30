// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import authApi from '../api/authApi';
import { jwtDecode } from 'jwt-decode';

// Tạo context - EXPORT NÀY
export const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    login: async () => {},
    logout: async () => {},
    loading: false,
});

function parseRolesFromDecoded(decoded) {
    if (!decoded) return [];

    if (Array.isArray(decoded.roles) && decoded.roles.length) {
        return decoded.roles.map((r) => String(r).toUpperCase());
    }

    if (typeof decoded.scope === 'string' && decoded.scope.trim()) {
        return decoded.scope.split(/\s+/).map((r) => String(r).toUpperCase());
    }

    if (typeof decoded.role === 'string' && decoded.role.trim()) {
        return [decoded.role.toUpperCase()];
    }

    return [];
}

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('access_token')));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const decodeUserFromToken = (token) => {
        try {
            const decoded = jwtDecode(token);
            console.log('🔍 Decoded token:', decoded);

            const roles = parseRolesFromDecoded(decoded);
            const primaryRole = roles.length ? roles[0] : null;

            return {
                id: decoded.id || decoded.sub || null,
                username: decoded.username || decoded.sub || null,
                roles,
                role: primaryRole,
                raw: decoded,
            };
        } catch (error) {
            console.error('Decode JWT failed:', error);
            return null;
        }
    };

    const fetchUser = useCallback(async () => {
        try {
            const res = await authApi.me();
            const data = res.data?.result;
            if (data) {
                const roles = Array.isArray(data.roles)
                    ? data.roles.map((r) => String(r).toUpperCase())
                    : typeof data.scope === 'string'
                    ? data.scope.split(/\s+/).map((r) => r.toUpperCase())
                    : [];
                const primaryRole = roles.length ? roles[0] : data.role ? String(data.role).toUpperCase() : null;

                setUser({
                    ...data,
                    roles,
                    role: primaryRole,
                });
            }
        } catch (e) {
            console.warn('[AuthContext] fetchUser failed:', e?.response?.status || e.message);

            if (e?.response?.status === 401) {
                localStorage.removeItem('access_token');
                setIsAuthenticated(false);
                setUser(null);
            }
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            const decodedUser = decodeUserFromToken(token);
            if (decodedUser) {
                setUser(decodedUser);
                setIsAuthenticated(true);
                fetchUser().catch(() => {});
            } else {
                localStorage.removeItem('access_token');
                setIsAuthenticated(false);
                setUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
        setLoading(false);
    }, [fetchUser]);

    const login = async ({ identifier, password }) => {
        setLoading(true);
        try {
            const res = await authApi.login({ identifier, password });
            const token =
                res.data?.result?.token || res.data?.result?.accessToken || res.data?.token || res.data?.accessToken;

            if (!token) throw new Error('No token returned from login');

            localStorage.setItem('access_token', token);
            setIsAuthenticated(true);

            const decodedUser = decodeUserFromToken(token);
            if (decodedUser) setUser(decodedUser);

            await fetchUser();
            return true;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authApi.logout();
        } catch (e) {
            console.error('[AuthContext] Logout failed:', e);
        } finally {
            localStorage.removeItem('access_token');
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
        }
    };

    const value = {
        isAuthenticated,
        user,
        login,
        logout,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Tạo custom hook để sử dụng AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export default cho các component cần context trực tiếp
export default AuthContext;
