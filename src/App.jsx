import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes, adminRoutes, userRoutes } from './routes/routes';
import DefaultLayout from './Layouts/DefaultLayout';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/Toast/ToastContext';

function App() {
    return (
        <CartProvider>
            <ToastProvider>
                <Router>
                    <div className="App">
                        <Routes>
                            {publicRoutes.map((route, index) => {
                                const Page = route.component;
                                let Layout = DefaultLayout;

                                if (route.layout) {
                                    Layout = route.layout;
                                } else if (route.layout === null) {
                                    Layout = React.Fragment;
                                }

                                return (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        element={
                                            <Layout>
                                                <Page />
                                            </Layout>
                                        }
                                    />
                                );
                            })}

                            {privateRoutes.map((route, index) => (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <route.layout>
                                            <route.component />
                                        </route.layout>
                                    }
                                />
                            ))}

                            {adminRoutes.map((route, index) => (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <route.layout>
                                            <route.component />
                                        </route.layout>
                                    }
                                />
                            ))}

                            {userRoutes.map((route, index) => (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <route.layout>
                                            <route.component />
                                        </route.layout>
                                    }
                                />
                            ))}
                        </Routes>
                    </div>
                </Router>
            </ToastProvider>
        </CartProvider>
    );
}

export default App;
