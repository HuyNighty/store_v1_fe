import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

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

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole === 'admin') {
        const isAdmin = user?.roles?.includes('ADMIN') || user?.role === 'ADMIN';
        if (!isAdmin) {
            return <Navigate to="/" replace />;
        }
    }

    if (requiredRole === 'user') {
        const isUser = user?.roles?.includes('USER') || user?.role === 'USER';
        if (!isUser) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
