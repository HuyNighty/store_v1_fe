import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes, adminRoutes, userRoutes } from './routes/routes';
import DefaultLayout from './Layouts/DefaultLayout';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/Toast/ToastContext';

function App() {
    const renderElement = (route) => {
        const PageComponent = route.component;
        let Layout = route.layout || DefaultLayout;

        if (route.layout === null) {
            Layout = React.Fragment;
        }

        if (!PageComponent) {
            console.error(`Component for route ${route.path} is undefined`);
            return <div>Error: Component not found</div>;
        }

        return (
            <Layout>
                <PageComponent />
            </Layout>
        );
    };

    return (
        <CartProvider>
            <ToastProvider>
                <Router>
                    <div className="App">
                        <Routes>
                            {publicRoutes.map((route, index) => (
                                <Route key={route.path || index} path={route.path} element={renderElement(route)} />
                            ))}

                            {privateRoutes.map((route, index) => (
                                <Route key={route.path || index} path={route.path} element={renderElement(route)} />
                            ))}

                            {adminRoutes.map((route, index) => (
                                <Route key={route.path || index} path={route.path} element={renderElement(route)} />
                            ))}

                            {userRoutes.map((route, index) => (
                                <Route key={route.path || index} path={route.path} element={renderElement(route)} />
                            ))}
                        </Routes>
                    </div>
                </Router>
            </ToastProvider>
        </CartProvider>
    );
}

export default App;
