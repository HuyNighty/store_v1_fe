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
// import FooterOnly from '../Layouts/FooterOnly';
// import Footer from '../Layouts/DefaultLayout/Footer';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import UserOrders from '../pages/UserOrders';
import AdminOrders from '../pages/Admin/components/AdminOrders';
import OrderDetail from '../pages/OrderDetail';
import UserOrderDetail from '../pages/UserOrderDetail';
import Wishlist from '../pages/Wishlist';
import Author from '../pages/Author';
import FAQ from '../pages/FAQ';

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/books', component: Books },
    { path: '/profile', component: Profile },
    { path: '/book-item', component: BookItemDetail },
    { path: '/login', component: Login, layout: null },
    { path: '/register', component: Register, layout: null },
    { path: '/cart', component: Cart, layout: HeaderOnly },
    { path: '/authors/:authorId', component: Author },
    { path: '/author/:authorId', component: Author },
    { path: '/faq', component: FAQ },
];
const privateRoutes = [];

const guestRoutes = [];

const userRoutes = [
    { path: '/orders/:orderId', component: UserOrderDetail },
    { path: '/checkout', component: Checkout, layout: null },
    { path: '/orders', component: UserOrders, layout: HeaderOnly },
    { path: '/wishlist', component: Wishlist, layout: HeaderOnly },
];

const adminRoutes = [
    { path: '/admin', component: Admin, layout: HeaderOnly },
    { path: '/admin-products', component: Products, layout: null },
    { path: '/admin-books', component: CreateBookForm, layout: null },
    { path: '/admin-orders', component: AdminOrders, layout: null },
    { path: '/admin/orders/:orderId', component: OrderDetail, layout: null },
];

export { publicRoutes, privateRoutes, guestRoutes, userRoutes, adminRoutes };
