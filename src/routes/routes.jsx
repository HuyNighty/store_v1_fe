import Books from '~/pages/Books';
import Home from '~/pages/Home';
import Profile from '~/pages/Profile';
import BookItem from '../pages/BookItem';

import HeaderOnly from '../Layouts/HeaderOnly';

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/books', component: Books },
    { path: '/profile', component: Profile, layout: HeaderOnly },
    { path: '/book-item', component: BookItem, layout: null },
];

const privateRoutes = [];

const guestRoutes = [];

const userRoutes = [];

const adminRoutes = [];

export { publicRoutes, privateRoutes, guestRoutes, userRoutes, adminRoutes };
