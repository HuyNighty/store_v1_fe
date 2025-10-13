import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Fragment } from 'react';

import { publicRoutes } from './routes/routes';
import DefaultLayout from './Layout/DefaultLayout';

function App() {
    return (
        <>
            <Router>
                <Routes>
                    {publicRoutes.map((route, key) => {
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
