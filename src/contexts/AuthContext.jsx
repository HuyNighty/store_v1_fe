// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import authApi from '../api/authApi';
import customerApi from '../api/customerApi';
import * as jwtDecodeLib from 'jwt-decode';

// Context mặc định
export const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    login: async () => {},
    logout: async () => {},
    loading: false,
});

// --- Utility: safe JWT decode (thích ứng với nhiều dạng export của package) ---
const safeJwtDecode = (token) => {
    if (!token) return null;

    const possibleFn =
        (jwtDecodeLib && (jwtDecodeLib.default || jwtDecodeLib.jwtDecode || jwtDecodeLib.jwt_decode)) ||
        (typeof jwtDecodeLib === 'function' ? jwtDecodeLib : null);

    if (typeof possibleFn === 'function') {
        try {
            return possibleFn(token);
        } catch (err) {
            console.warn('[Auth] jwt-decode lib failed, falling back to manual decode', err);
        }
    }

    // Fallback: decode payload bằng base64url (chỉ giải mã payload, KHÔNG verify signature)
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        let payload = parts[1];
        payload = payload.replace(/-/g, '+').replace(/_/g, '/');
        const pad = payload.length % 4;
        if (pad) payload += '='.repeat(4 - pad);
        const decodedStr = atob(payload);
        const json = decodeURIComponent(
            decodedStr
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
        );
        return JSON.parse(json);
    } catch (e) {
        console.error('[Auth] manual JWT decode failed:', e);
        return null;
    }
};

// --- Utility: normalize/parse roles từ nhiều cấu trúc token/API khác nhau ---
function parseRolesFromDecoded(decoded) {
    if (!decoded) return [];

    const rolesSet = new Set();

    if (Array.isArray(decoded.roles)) {
        decoded.roles.forEach((r) => {
            if (typeof r === 'string') rolesSet.add(r.toUpperCase());
            else if (r && typeof r === 'object') {
                const val = r.name || r.role || r.authority || r?.authority || r?.name;
                if (val) rolesSet.add(String(val).toUpperCase());
            }
        });
    }

    if (Array.isArray(decoded.authorities)) {
        decoded.authorities.forEach((a) => {
            if (typeof a === 'string') rolesSet.add(a.toUpperCase());
            else if (a && typeof a === 'object') {
                const val = a.authority || a.name || a.role;
                if (val) rolesSet.add(String(val).toUpperCase());
            }
        });
    }

    if (decoded.realm_access && Array.isArray(decoded.realm_access.roles)) {
        decoded.realm_access.roles.forEach((r) => rolesSet.add(String(r).toUpperCase()));
    }

    if (typeof decoded.scope === 'string' && decoded.scope.trim()) {
        decoded.scope.split(/\s+/).forEach((s) => rolesSet.add(s.toUpperCase()));
    }

    if (typeof decoded.role === 'string' && decoded.role.trim()) rolesSet.add(decoded.role.toUpperCase());
    if (typeof decoded.authority === 'string') rolesSet.add(decoded.authority.toUpperCase());

    return Array.from(rolesSet);
}

// --- Provider ---
export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('access_token')));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // decode từ token -> user minimal (chỉ dùng làm fallback & initial)
    const decodeUserFromToken = (token) => {
        try {
            const decoded = safeJwtDecode(token);
            if (!decoded) return null;

            const roles = parseRolesFromDecoded(decoded);
            const primaryRole = roles.length ? roles[0] : null;

            return {
                id: decoded.id || decoded.sub || null,
                username: decoded.username || decoded.preferred_username || decoded.sub || null,
                roles,
                role: primaryRole,
                raw: decoded,
            };
        } catch (error) {
            console.error('[Auth] Decode JWT failed:', error);
            return null;
        }
    };

    /**
     * fetchUser(decodedFromToken)
     * - decodedFromToken: optional object returned from decodeUserFromToken(token)
     * - nếu API profile trả về roles rỗng -> fallback dùng roles từ decodedFromToken
     */
    const fetchUser = useCallback(async (decodedFromToken = null) => {
        try {
            const customerRes = await customerApi.getMyProfile();
            const customerData = customerRes.data?.result;

            if (customerData) {
                // normalize roles từ customerData
                let roles =
                    Array.isArray(customerData.roles) && customerData.roles.length
                        ? customerData.roles
                              .map((r) => {
                                  if (typeof r === 'string') return r.toUpperCase();
                                  if (r && typeof r === 'object')
                                      return String(r.name || r.role || r.authority || '').toUpperCase();
                                  return '';
                              })
                              .filter(Boolean)
                        : typeof customerData.scope === 'string'
                        ? customerData.scope.split(/\s+/).map((r) => r.toUpperCase())
                        : [];

                // fallback: nếu API trả rỗng thì dùng token decode (nếu có)
                if ((!roles || roles.length === 0) && decodedFromToken?.roles?.length) {
                    roles = decodedFromToken.roles;
                }

                const primaryRole =
                    roles && roles.length
                        ? roles[0]
                        : customerData.role
                        ? String(customerData.role).toUpperCase()
                        : decodedFromToken?.role || null;

                const mergedUser = {
                    ...customerData,
                    roles,
                    role: primaryRole,
                    profileImage: customerData.profileImage || null,
                    firstName: customerData.firstName,
                    lastName: customerData.lastName,
                    email: customerData.email,
                };

                console.log('[Auth] fetchUser -> customer profile (merged):', mergedUser);
                setUser(mergedUser);
                return;
            }

            // fallback to authApi.me()
            const authRes = await authApi.me();
            const authData = authRes.data?.result;
            if (authData) {
                let roles =
                    Array.isArray(authData.roles) && authData.roles.length
                        ? authData.roles
                              .map((r) => {
                                  if (typeof r === 'string') return r.toUpperCase();
                                  if (r && typeof r === 'object')
                                      return String(r.name || r.role || r.authority || '').toUpperCase();
                                  return '';
                              })
                              .filter(Boolean)
                        : typeof authData.scope === 'string'
                        ? authData.scope.split(/\s+/).map((r) => r.toUpperCase())
                        : [];

                if ((!roles || roles.length === 0) && decodedFromToken?.roles?.length) {
                    roles = decodedFromToken.roles;
                }

                const primaryRole =
                    roles && roles.length
                        ? roles[0]
                        : authData.role
                        ? String(authData.role).toUpperCase()
                        : decodedFromToken?.role || null;

                const mergedUser = {
                    ...authData,
                    roles,
                    role: primaryRole,
                    profileImage: authData.profileImage || null,
                    firstName: authData.firstName,
                    lastName: authData.lastName,
                    email: authData.email,
                };

                console.log('[Auth] fetchUser -> auth profile (merged):', mergedUser);
                setUser(mergedUser);
                return;
            }

            // nếu cả 2 API đều không trả user, dùng decoded token (nếu có) như fallback cuối cùng
            if (decodedFromToken) {
                console.log('[Auth] fetchUser -> using decoded token as fallback user:', decodedFromToken);
                setUser(decodedFromToken);
            }
        } catch (e) {
            console.warn('[AuthContext] fetchUser failed:', e?.response?.status || e.message);

            // Nếu customer API 404/400 thử fallback authApi.me một lần nữa
            if (e?.response?.status === 404 || e?.response?.status === 400) {
                try {
                    const authRes = await authApi.me();
                    const authData = authRes.data?.result;
                    if (authData) {
                        let roles =
                            Array.isArray(authData.roles) && authData.roles.length
                                ? authData.roles
                                      .map((r) => {
                                          if (typeof r === 'string') return r.toUpperCase();
                                          if (r && typeof r === 'object')
                                              return String(r.name || r.role || r.authority || '').toUpperCase();
                                          return '';
                                      })
                                      .filter(Boolean)
                                : typeof authData.scope === 'string'
                                ? authData.scope.split(/\s+/).map((r) => r.toUpperCase())
                                : [];

                        if ((!roles || roles.length === 0) && decodedFromToken?.roles?.length) {
                            roles = decodedFromToken.roles;
                        }

                        const primaryRole =
                            roles && roles.length
                                ? roles[0]
                                : authData.role
                                ? String(authData.role).toUpperCase()
                                : decodedFromToken?.role || null;

                        const mergedUser = {
                            ...authData,
                            roles,
                            role: primaryRole,
                            profileImage: authData.profileImage || null,
                            firstName: authData.firstName,
                            lastName: authData.lastName,
                            email: authData.email,
                        };

                        console.log('[Auth] fetchUser (fallback auth) merged:', mergedUser);
                        setUser(mergedUser);
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
                    // set tạm user từ token để UI phản hồi nhanh
                    setUser(decodedUser);
                    setIsAuthenticated(true);

                    // fetch profile từ server, truyền decoded token để fallback roles nếu cần
                    await fetchUser(decodedUser);
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
            if (decodedUser) {
                setUser(decodedUser); // set tạm user
            }

            // fetch server-side profile and merge roles using decodedUser as fallback
            await fetchUser(decodedUser);
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
            // nếu có token, decode để cung cấp fallback roles
            const token = localStorage.getItem('access_token');
            const decoded = token ? decodeUserFromToken(token) : null;
            await fetchUser(decoded);
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

// Hook tiện lợi
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
