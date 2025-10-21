import React, { createContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    login: async () => {},
    logout: async () => {},
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
    }, [fetchUser]);

    const login = async ({ identifier, password }) => {
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
