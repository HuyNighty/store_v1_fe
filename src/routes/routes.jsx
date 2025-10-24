import Books from '~/pages/Books';
import Home from '~/pages/Home';
import Profile from '~/pages/Profile';
import BookItemDetail from '../pages/BookItemDetail';
import HeaderOnly from '../Layouts/HeaderOnly';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Admin from '../pages/Admin';
import Products from '../pages/Admin/components/Product';
import CreateBookForm from '../pages/Admin/components/CreateBookForm';
import FooterOnly from '../Layouts/FooterOnly';
// import Footer from '../Layouts/DefaultLayout/Footer';

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/books', component: Books },
    { path: '/profile', component: Profile, layout: HeaderOnly },
    { path: '/book-item', component: BookItemDetail, layout: FooterOnly },
    { path: '/login', component: Login, layout: null },
    { path: '/register', component: Register, layout: null },
    { path: '/admin', component: Admin, layout: HeaderOnly },
];

const privateRoutes = [];

const guestRoutes = [];

const userRoutes = [];

const adminRoutes = [
    { path: '/admin-products', component: Products, layout: null },
    { path: '/admin-books', component: CreateBookForm, layout: null },
];

export { publicRoutes, privateRoutes, guestRoutes, userRoutes, adminRoutes };
