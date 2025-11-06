// src/components/Header/Header.jsx
import { useContext, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import NavLinks from './components/NavLinks/NavLinks';
import SearchBar from './components/SearchBar/SearchBar';
import CartButton from './components/CartButton/CartButton';
import ProfileMenu from './components/ProfileMenu/ProfileMenu';
import Button from '../Button/Button';
import Logo from '../../../components/Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const cx = classNames.bind(styles);

function Header({
    mode = 'auto',
    scrollThreshold = 50,
    routeModeMap = null, // optional: if provided, takes precedence over mode when mapping exists
}) {
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // internal scrolled state only used when effectiveMode === 'auto'
    const [scrolled, setScrolled] = useState(false);

    // Determine effective mode: if routeModeMap has entry for pathname, use it.
    const effectiveMode = (() => {
        if (routeModeMap && routeModeMap[location.pathname]) return routeModeMap[location.pathname];
        return mode;
    })();

    // boolean: whether header should be considered "scrolled/solid"
    const isSolid = (() => {
        if (effectiveMode === 'solid') return true;
        if (effectiveMode === 'transparent') return false;
        // 'auto' -> depends on scrolled state
        return scrolled;
    })();

    const headerRef = useRef(null);

    // hiệu ứng set CSS var --header-height
    useEffect(() => {
        if (!headerRef.current) return;

        const updateHeight = () => {
            const h = headerRef.current.offsetHeight || 0;
            // set CSS var trên root để toàn app có thể dùng
            document.documentElement.style.setProperty('--header-height', `${h}px`);
        };

        // update ngay
        updateHeight();

        // ResizeObserver tốt để bắt mọi thay đổi kích thước (bao gồm khi .scrolled thay đổi padding)
        let ro;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(updateHeight);
            ro.observe(headerRef.current);
        }

        // also update on window resize just in case
        window.addEventListener('resize', updateHeight);

        // cleanup
        return () => {
            if (ro) ro.disconnect();
            window.removeEventListener('resize', updateHeight);
        };
    }, [isSolid]);

    // Thay thế useEffect(...) hiện tại bằng đoạn này
    useEffect(() => {
        // nếu mode khác 'auto' thì không cần lắng nghe sự kiện
        if (effectiveMode !== 'auto') {
            setScrolled(
                window?.scrollY > scrollThreshold || (document.scrollingElement?.scrollTop ?? 0) > scrollThreshold,
            );
            return;
        }

        // Helper: lấy giá trị scroll top từ nhiều nguồn
        const getScrollTop = () => {
            // document.scrollingElement is the <html> element in modern browsers
            const docEl = document.scrollingElement || document.documentElement || document.body;
            // prefer docEl.scrollTop, fallback to window.scrollY
            return docEl?.scrollTop ?? window.scrollY ?? 0;
        };

        // Primary handler
        const handleScroll = () => {
            const top = getScrollTop();
            setScrolled(top > scrollThreshold);
        };

        // Call once to set initial state
        handleScroll();

        // Add listeners to both window and document.scrollingElement (if present and different)
        window.addEventListener('scroll', handleScroll, { passive: true });

        const docEl = document.scrollingElement;
        if (docEl && docEl !== window) {
            docEl.addEventListener('scroll', handleScroll, { passive: true });
        }
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (docEl && docEl !== window) docEl.removeEventListener('scroll', handleScroll);
            // if (possible) possible.removeEventListener('scroll', handleScroll);
        };
    }, [effectiveMode, scrollThreshold, location.pathname]);

    // Search state
    const [searchState, setSearchState] = useState({
        showSearch: false,
        isExpanded: false,
        query: '',
    });

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
            ref={headerRef}
            className={cx('wrapper', { scrolled: isSolid })}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className={cx('content')}>
                <motion.div className={cx('logo-wrapper')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {/* isTransparent = !isSolid */}
                    <Logo className={cx('logo')} isTransparent={!isSolid} />
                </motion.div>

                <motion.div
                    className={cx('nav-links-container')}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <NavLinks />
                </motion.div>

                <div className={cx('actions')}>
                    <motion.div
                        className={cx('search-bar-wrapper', 'action-item')}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <SearchBar searchState={searchState} setSearchState={setSearchState} isTransparent={!isSolid} />
                    </motion.div>

                    {isAuthenticated ? (
                        <>
                            <motion.div
                                className={cx('cart-button-wrapper', 'action-item')}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <CartButton isTransparent={!isSolid} />
                            </motion.div>

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
                                    isTransparent={!isSolid}
                                />
                            </motion.div>
                        </>
                    ) : (
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
