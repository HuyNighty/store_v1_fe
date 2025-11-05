// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import authApi from '../api/authApi';
import customerApi from '../api/customerApi';
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
            console.log('Decoded token:', decoded);

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
            // Thử lấy thông tin từ customer API trước (có profileImage)
            const customerRes = await customerApi.getMyProfile();
            const customerData = customerRes.data?.result;

            if (customerData) {
                const roles = Array.isArray(customerData.roles)
                    ? customerData.roles.map((r) => String(r).toUpperCase())
                    : typeof customerData.scope === 'string'
                    ? customerData.scope.split(/\s+/).map((r) => r.toUpperCase())
                    : [];
                const primaryRole = roles.length
                    ? roles[0]
                    : customerData.role
                    ? String(customerData.role).toUpperCase()
                    : null;

                setUser({
                    ...customerData,
                    roles,
                    role: primaryRole,
                    profileImage: customerData.profileImage || null,
                    firstName: customerData.firstName,
                    lastName: customerData.lastName,
                    email: customerData.email,
                });
            } else {
                const authRes = await authApi.me();
                const authData = authRes.data?.result;
                if (authData) {
                    const roles = Array.isArray(authData.roles)
                        ? authData.roles.map((r) => String(r).toUpperCase())
                        : typeof authData.scope === 'string'
                        ? authData.scope.split(/\s+/).map((r) => r.toUpperCase())
                        : [];
                    const primaryRole = roles.length
                        ? roles[0]
                        : authData.role
                        ? String(authData.role).toUpperCase()
                        : null;

                    setUser({
                        ...authData,
                        roles,
                        role: primaryRole,
                        profileImage: authData.profileImage || null,
                        firstName: authData.firstName,
                        lastName: authData.lastName,
                        email: authData.email,
                    });
                }
            }
        } catch (e) {
            console.warn('[AuthContext] fetchUser failed:', e?.response?.status || e.message);

            if (e?.response?.status === 404 || e?.response?.status === 400) {
                try {
                    const authRes = await authApi.me();
                    const authData = authRes.data?.result;
                    if (authData) {
                        const roles = Array.isArray(authData.roles)
                            ? authData.roles.map((r) => String(r).toUpperCase())
                            : typeof authData.scope === 'string'
                            ? authData.scope.split(/\s+/).map((r) => r.toUpperCase())
                            : [];
                        const primaryRole = roles.length
                            ? roles[0]
                            : authData.role
                            ? String(authData.role).toUpperCase()
                            : null;

                        setUser({
                            ...authData,
                            roles,
                            role: primaryRole,
                            profileImage: authData.profileImage || null,
                            firstName: authData.firstName,
                            lastName: authData.lastName,
                            email: authData.email,
                        });
                        return;
                    }
                } catch (authError) {
                    console.warn('[AuthContext] authApi.me also failed:', authError);
                }
            }

            if (e?.response?.status === 401) {
                localStorage.removeItem('access_token');
                setIsAuthenticated(false);
                setUser(null);
            }
        }
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                const decodedUser = decodeUserFromToken(token);
                if (decodedUser) {
                    setUser(decodedUser);
                    setIsAuthenticated(true);
                    await fetchUser();
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
        };

        initializeAuth();
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
        } catch (error) {
            console.error('[AuthContext] Login failed:', error);
            throw error;
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

    const refreshUserData = async () => {
        if (isAuthenticated) {
            await fetchUser();
        }
    };

    const value = {
        isAuthenticated,
        user,
        login,
        logout,
        loading,
        refreshUserData,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export default cho các component cần context trực tiếp
export default AuthContext;
