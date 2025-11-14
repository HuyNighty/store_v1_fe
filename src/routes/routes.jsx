import Books from '~/pages/Books';
import Home from '~/pages/Home';
import Profile from '~/pages/Profile';
import BookItemDetail from '../pages/BookItemDetail';
import HeaderOnly from '../Layouts/HeaderOnly';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Admin from '../pages/Admin';
import Products from '../pages/Admin/components/Product';
// import FooterOnly from '../Layouts/FooterOnly';
// import Footer from '../Layouts/DefaultLayout/Footer';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import UserOrders from '../pages/UserOrders';
import AdminOrders from '../pages/Admin/components/AdminOrders';
import OrderDetail from '../pages/OrderDetail';
import UserOrderDetail from '../pages/UserOrderDetail';
import Wishlist from '../Layouts/Wishlist';
import Author from '../pages/Author';
import FAQ from '../pages/FAQ';
import CreateBook from '../pages/Admin/components/Books/CreateBook';
import EditBook from '../pages/Admin/components/Books/EditBook';

const publicRoutes = [
    { path: '/', component: Home, headerMode: 'auto' },
    { path: '/books', component: Books, headerMode: 'solid' },
    { path: '/profile', component: Profile, headerMode: 'solid' },
    { path: '/book-item', component: BookItemDetail, headerMode: 'solid' },
    { path: '/login', component: Login, layout: null },
    { path: '/register', component: Register, layout: null },
    { path: '/cart', component: Cart, layout: HeaderOnly, headerMode: 'solid' },
    { path: '/authors/:authorId', component: Author, headerMode: 'solid' },
    { path: '/author/:authorId', component: Author, headerMode: 'solid' },
    { path: '/faq', component: FAQ, headerMode: 'solid' },
];
const privateRoutes = [];

const guestRoutes = [];

const userRoutes = [
    { path: '/orders/:orderId', component: UserOrderDetail, headerMode: 'solid' },
    { path: '/checkout', component: Checkout, layout: null },
    { path: '/orders', component: UserOrders, layout: HeaderOnly, headerMode: 'solid' },
    { path: '/wishlist', component: Wishlist, layout: HeaderOnly, headerMode: 'solid' },
];

const adminRoutes = [
    { path: '/admin', component: Admin, layout: HeaderOnly, headerMode: 'solid' },
    { path: '/admin-products', component: Products, layout: null },
    { path: '/admin/books/create', component: CreateBook, layout: null },
    { path: '/admin/books/edit/:productId', component: EditBook, layout: null },
    { path: '/admin-orders', component: AdminOrders, layout: null },
    { path: '/admin/orders/:orderId', component: OrderDetail, layout: null },
];

export { publicRoutes, privateRoutes, guestRoutes, userRoutes, adminRoutes };
