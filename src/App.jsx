import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Fragment } from 'react';

import { publicRoutes, adminRoutes } from './routes/routes';
import DefaultLayout from './Layouts/DefaultLayout';

function App() {
    const allRoutes = [...publicRoutes, ...adminRoutes];

    return (
        <>
            <Router>
                <Routes>
                    {allRoutes.map((route, key) => {
                        const Page = route.component;

                        let Layout = DefaultLayout;
                        if (route.layout) {
                            Layout = route.layout;
                        } else if (route.layout === null) {
                            Layout = Fragment;
                        }

                        return (
                            <Route
                                key={key}
                                path={route.path}
                                element={
                                    <Layout>
                                        <Page />
                                    </Layout>
                                }
                            />
                        );
                    })}
                </Routes>
            </Router>
        </>
    );
}

export default App;
