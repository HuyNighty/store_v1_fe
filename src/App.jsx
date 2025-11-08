import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes, adminRoutes, userRoutes } from './routes/routes';
import DefaultLayout from './Layouts/DefaultLayout';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/Toast/ToastContext';
import ProtectedRoute from './routes/components/ProtectedRoute/ProtectedRoute';
import { WishlistProvider } from './contexts/WishlistContext';
import ScrollToTop from './utils/ScrollToTop';

function App() {
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

        if (isProtected) {
            return <ProtectedRoute requiredRole={requiredRole}>{element}</ProtectedRoute>;
        }

        return element;
    };

    return (
        <CartProvider>
            <ToastProvider>
                <WishlistProvider>
                    <Router>
                        <ScrollToTop />

                        <div className="App">
                            <Routes>
                                {publicRoutes.map((route, index) => (
                                    <Route key={route.path || index} path={route.path} element={renderElement(route)} />
                                ))}

                                {privateRoutes.map((route, index) => (
                                    <Route
                                        key={route.path || index}
                                        path={route.path}
                                        element={renderElement(route, true)}
                                    />
                                ))}

                                {adminRoutes.map((route, index) => (
                                    <Route
                                        key={route.path || index}
                                        path={route.path}
                                        element={renderElement(route, true, 'admin')}
                                    />
                                ))}

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
