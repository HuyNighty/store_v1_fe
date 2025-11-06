import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes, adminRoutes, userRoutes } from './routes/routes';
import DefaultLayout from './Layouts/DefaultLayout';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/Toast/ToastContext';
import ProtectedRoute from './routes/components/ProtectedRoute/ProtectedRoute';
import { WishlistProvider } from './contexts/WishlistContext';

function App() {
    // trong App.js: thay renderElement bằng phiên bản này
    const renderElement = (route, isProtected = false, requiredRole = null) => {
        const PageComponent = route.component;
        let Layout = route.layout || DefaultLayout;

        if (route.layout === null) {
            Layout = React.Fragment;
        }

        if (!PageComponent) {
            console.error(`Component for route ${route.path} is undefined`);
            return <div>Error: Component not found</div>;
        }

        // Chỉ forward headerMode nếu Layout không phải Fragment
        const layoutProps = {};
        if (Layout !== React.Fragment) {
            // fallback default to 'auto' nếu không truyền
            layoutProps.headerMode = route.headerMode ?? 'auto';
        }

        const element = (
            <Layout {...layoutProps}>
                <PageComponent />
            </Layout>
        );

        if (isProtected && requiredRole) {
            return <ProtectedRoute requiredRole={requiredRole}>{element}</ProtectedRoute>;
        }

        return element;
    };

    return (
        <CartProvider>
            <ToastProvider>
                <WishlistProvider>
                    <Router>
                        <div className="App">
                            <Routes>
                                {/* Public Routes - Ai cũng truy cập được */}
                                {publicRoutes.map((route, index) => (
                                    <Route key={route.path || index} path={route.path} element={renderElement(route)} />
                                ))}

                                {/* Private Routes - Cần đăng nhập (chưa dùng trong code hiện tại) */}
                                {privateRoutes.map((route, index) => (
                                    <Route
                                        key={route.path || index}
                                        path={route.path}
                                        element={renderElement(route, true)}
                                    />
                                ))}

                                {/* Admin Routes - Chỉ ADMIN truy cập được */}
                                {adminRoutes.map((route, index) => (
                                    <Route
                                        key={route.path || index}
                                        path={route.path}
                                        element={renderElement(route, true, 'admin')}
                                    />
                                ))}

                                {/* User Routes - Chỉ USER truy cập được */}
                                {userRoutes.map((route, index) => (
                                    <Route
                                        key={route.path || index}
                                        path={route.path}
                                        element={renderElement(route, true, 'user')}
                                    />
                                ))}
                            </Routes>
                        </div>
                    </Router>
                </WishlistProvider>
            </ToastProvider>
        </CartProvider>
    );
}

export default App;
