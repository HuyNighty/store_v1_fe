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
import { AuthContext } from '../../../contexts/Auth/AuthContext';
import { useWishlist } from '../../../contexts/Wishlist/WishlistContext';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const cx = classNames.bind(styles);

function Header({ mode = 'auto', scrollThreshold = 50, routeModeMap = null }) {
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [scrolled, setScrolled] = useState(false);

    const effectiveMode = (() => {
        if (routeModeMap && routeModeMap[location.pathname]) return routeModeMap[location.pathname];
        return mode;
    })();

    const isSolid = (() => {
        if (effectiveMode === 'solid') return true;
        if (effectiveMode === 'transparent') return false;
        return scrolled;
    })();

    const headerRef = useRef(null);

    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;

        const updateHeight = (entries) => {
            const target = entries && entries.length ? entries[0].target : headerRef.current || el;
            if (!target) return;

            const h = target.offsetHeight || 0;
            document.documentElement.style.setProperty('--header-height', `${h}px`);
        };

        updateHeight([{ target: el }]);

        let ro;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver((entries) => {
                try {
                    updateHeight(entries);
                } catch (err) {
                    console.warn('ResizeObserver update error', err);
                }
            });
            ro.observe(el);
        }

        const handleResize = () => {
            const target = headerRef.current || el;
            if (!target) return;
            document.documentElement.style.setProperty('--header-height', `${target.offsetHeight || 0}px`);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (ro) ro.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [isSolid]);

    useEffect(() => {
        if (effectiveMode !== 'auto') {
            setScrolled(
                window?.scrollY > scrollThreshold || (document.scrollingElement?.scrollTop ?? 0) > scrollThreshold,
            );
            return;
        }

        const getScrollTop = () => {
            const docEl = document.scrollingElement || document.documentElement || document.body;

            return docEl?.scrollTop ?? window.scrollY ?? 0;
        };

        const handleScroll = () => {
            const top = getScrollTop();
            setScrolled(top > scrollThreshold);
        };

        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });

        const docEl = document.scrollingElement;
        if (docEl && docEl !== window) {
            docEl.addEventListener('scroll', handleScroll, { passive: true });
        }
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (docEl && docEl !== window) docEl.removeEventListener('scroll', handleScroll);
        };
    }, [effectiveMode, scrollThreshold, location.pathname]);

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
                            <Button outline shine scale onClick={handleLoginClick}>
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
