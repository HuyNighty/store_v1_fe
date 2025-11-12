import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/Auth/AuthContext';

const normalizeRoles = (user) => {
    if (!user) return [];
    if (Array.isArray(user.roles)) {
        return user.roles
            .map((r) => {
                if (typeof r === 'string') return r.toUpperCase();
                if (r && typeof r === 'object') return (r.name || r.role || '').toString().toUpperCase();
                return '';
            })
            .filter(Boolean);
    }
    if (typeof user.role === 'string') return [user.role.toUpperCase()];
    return [];
};

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <div>Đang kiểm tra quyền truy cập...</div>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    console.log('ProtectedRoute user:', user);

    if (requiredRole) {
        const roles = normalizeRoles(user); // e.g. ["ROLE_USER", "ROLE_ADMIN", "USER"]
        const expected = requiredRole.toString().toUpperCase();
        const expectedVariants = [expected, `ROLE_${expected}`]; // e.g. 'USER' & 'ROLE_USER'
        const has = roles.some((r) => expectedVariants.includes(r));
        if (!has) return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
