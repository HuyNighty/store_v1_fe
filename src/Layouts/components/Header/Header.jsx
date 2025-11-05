// src/components/Header/Header.jsx
import { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import NavLinks from './components/NavLinks/NavLinks';
import SearchBar from './components/SearchBar/SearchBar';
import CartButton from './components/CartButton/CartButton';
import ProfileMenu from './components/ProfileMenu/ProfileMenu';
import Button from '../Button/Button';
import Logo from '../../../components/Logo';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const cx = classNames.bind(styles);

function Header() {
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    const [searchState, setSearchState] = useState({
        showSearch: false,
        isExpanded: false,
        query: '',
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeSearch = () => {
        setSearchState({ showSearch: false, isExpanded: false, query: '' });
    };

    const handleLoginClick = () => navigate('/login');

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const { getWishlistCount } = useWishlist();
    const wishlistCount = getWishlistCount();

    return (
        <motion.header
            className={cx('wrapper', { scrolled })}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className={cx('content')}>
                {/* Logo với animation và điều chỉnh màu */}
                <motion.div className={cx('logo-wrapper')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Logo className={cx('logo')} />
                </motion.div>

                {/* Navigation Links với animation và điều chỉnh màu */}
                <motion.div
                    className={cx('nav-links-container')}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <NavLinks />
                </motion.div>

                <div className={cx('actions')}>
                    {/* Search Bar */}
                    <motion.div
                        className={cx('search-bar-wrapper', 'action-item')}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <SearchBar
                            searchState={searchState}
                            setSearchState={setSearchState}
                            isTransparent={!scrolled} // Truyền prop để SearchBar biết trạng thái
                        />
                    </motion.div>

                    {isAuthenticated ? (
                        <>
                            {/* Cart Button với animation và điều chỉnh màu */}
                            <motion.div
                                className={cx('cart-button-wrapper', 'action-item')}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <CartButton isTransparent={!scrolled} />
                            </motion.div>

                            {/* Wishlist với animation và điều chỉnh màu */}
                            <motion.div
                                className={cx('action-item')}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <motion.div
                                    className={cx('wishlist-wrapper')}
                                    onClick={() => navigate('/wishlist')}
                                    whileHover={{ scale: 1.1, background: 'transparent' }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <FontAwesomeIcon icon={faHeart} />
                                    {wishlistCount > 0 && (
                                        <motion.span
                                            className={cx('badge')}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                        >
                                            {wishlistCount > 99 ? '99+' : wishlistCount}
                                        </motion.span>
                                    )}
                                </motion.div>
                            </motion.div>

                            {/* Profile Menu với animation và điều chỉnh màu */}
                            <motion.div
                                className={cx('profile-menu-wrapper', 'action-item')}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <ProfileMenu
                                    user={user}
                                    onProfileInteract={closeSearch}
                                    onLogout={handleLogout}
                                    isTransparent={!scrolled}
                                />
                            </motion.div>
                        </>
                    ) : (
                        /* Login Button với animation và điều chỉnh màu */
                        <motion.div
                            className={cx('login-button-wrapper', 'action-item')}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button outline shine onClick={handleLoginClick}>
                                Đăng nhập
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.header>
    );
}

export default Header;
