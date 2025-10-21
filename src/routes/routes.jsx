import Books from '~/pages/Books';
import Home from '~/pages/Home';
import Profile from '~/pages/Profile';
import BookItem from '../pages/BookItem';
import HeaderOnly from '../Layouts/HeaderOnly';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Admin from '../pages/Admin';

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/books', component: Books },
    { path: '/profile', component: Profile, layout: HeaderOnly },
    { path: '/book-item', component: BookItem, layout: null },
    { path: '/login', component: Login, layout: null },
    { path: '/register', component: Register, layout: null },
    { path: '/admin', component: Admin, layout: HeaderOnly },
];

const privateRoutes = [];

const guestRoutes = [];

const userRoutes = [];

const adminRoutes = [];

export { publicRoutes, privateRoutes, guestRoutes, userRoutes, adminRoutes };
