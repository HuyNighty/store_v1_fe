import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import NavLinks from './components/NavLinks/NavLinks';
import SearchBar from './components/SearchBar/SearchBar';
import CartButton from './components/CartButton/CartButton';
import ProfileMenu from './components/ProfileMenu/ProfileMenu';
import Button from '../Button/Button';
import Logo from '../../../components/Logo';

const cx = classNames.bind(styles);

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [searchState, setSearchState] = useState({
        showSearch: false,
        isExpanded: false,
        query: '',
    });

    const closeSearch = () => {
        setSearchState({
            showSearch: false,
            isExpanded: false,
            query: '',
        });
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    return (
        <header className={cx('wrapper')}>
            <div className={cx('content')}>
                <Logo />
                <NavLinks />
                <div className={cx('actions')}>
                    <SearchBar searchState={searchState} setSearchState={setSearchState} />
                    {isLoggedIn ? (
                        <>
                            <CartButton />
                            <ProfileMenu onProfileInteract={closeSearch} onLogout={handleLogout} />
                        </>
                    ) : (
                        <Button primary onClick={handleLogin}>
                            Đăng nhập
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
