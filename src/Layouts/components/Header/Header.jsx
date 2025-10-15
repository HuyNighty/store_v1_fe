import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import Logo from './components/Logo/Logo';
import NavLinks from './components/NavLinks/NavLinks';
import SearchBar from './components/SearchBar/SearchBar';
import CartButton from './components/CartButton/CartButton';
import ProfileMenu from './components/ProfileMenu/ProfileMenu';

const cx = classNames.bind(styles);

function Header() {
    return (
        <header className={cx('wrapper')}>
            <div className={cx('content')}>
                <Logo />
                <NavLinks />
                <div className={cx('actions')}>
                    <SearchBar />
                    <CartButton />
                    <ProfileMenu />
                </div>
            </div>
        </header>
    );
}

export default Header;
