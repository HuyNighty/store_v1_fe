import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes, adminRoutes, userRoutes } from './routes/routes';
import DefaultLayout from './Layouts/DefaultLayout';
import ProtectedRoute from './routes/components/ProtectedRoute/ProtectedRoute';
import { ToastProvider } from './contexts/Toast/ToastContext';
import { CartProvider } from './contexts/Cart/CartContext';
import { WishlistProvider } from './contexts/Wishlist/WishlistContext';
import ScrollToTop from './utils/ScrollToTop';
import ClickSpark from './components/Animations/ClickSpark';

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
                        <ClickSpark
                            sparkColor="#975d34ff"
                            sparkSize={10}
                            sparkRadius={10}
                            sparkCount={10}
                            duration={400}
                        >
                            <div className="App">
                                <Routes>
                                    {publicRoutes.map((route, index) => (
                                        <Route
                                            key={route.path || index}
                                            path={route.path}
                                            element={renderElement(route)}
                                        />
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
                        </ClickSpark>
                    </Router>
                </WishlistProvider>
            </ToastProvider>
        </CartProvider>
    );
}

export default App;
