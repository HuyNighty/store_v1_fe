// src/components/Header/Header.jsx
import { useContext, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import NavLinks from './components/NavLinks/NavLinks';
import SearchBar from './components/SearchBar/SearchBar';
import CartButton from './components/CartButton/CartButton';
import ProfileMenu from './components/ProfileMenu/ProfileMenu';
import Button from '../Button/Button';
import Logo from '../../../components/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const cx = classNames.bind(styles);

function Header() {
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

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
        <header className={cx('wrapper')}>
            <div className={cx('content')}>
                <Logo />
                <NavLinks />
                <div className={cx('actions')}>
                    <SearchBar searchState={searchState} setSearchState={setSearchState} />
                    {isAuthenticated ? (
                        <>
                            <CartButton />
                            <nav className={cx('nav-icons')}>
                                {/* Wishlist button với style giống cartButton */}
                                <div className={cx('wishlist-wrapper')} onClick={() => navigate('/wishlist')}>
                                    <FontAwesomeIcon icon={faHeart} />
                                    {wishlistCount > 0 && (
                                        <span className={cx('badge')}>
                                            {wishlistCount > 99 ? '99+' : wishlistCount}
                                        </span>
                                    )}
                                </div>
                            </nav>
                            <ProfileMenu user={user} onProfileInteract={closeSearch} onLogout={handleLogout} />
                        </>
                    ) : (
                        <Button outline shine onClick={handleLoginClick}>
                            Đăng nhập
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
