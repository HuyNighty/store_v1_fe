import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBox, faGear, faSearch, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Tippy from '@tippyjs/react/headless';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import { useState, useRef, useEffect } from 'react';
import PopperWrapper from '../../Popper/Wrapper';

const cx = classNames.bind(styles);

function Header() {
    const profileMenuItems = [
        { to: '/profile', icon: faUser, label: 'Profile Info' },
        { to: '/orders', icon: faBox, label: 'My Orders' },
        { to: '/settings', icon: faGear, label: 'Settings' },
        { to: '/logout', icon: faArrowRight, label: 'Logout' },
    ];

    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (showSearch && searchRef.current) {
            const inputEl = searchRef.current.querySelector('input');
            inputEl?.focus();
        }
    }, [showSearch]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setShowSearch(false);
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    const renderProfileMenu = (attrs) => (
        <div className={cx('profile-menu-wrapper')} tabIndex="-1" {...attrs}>
            <PopperWrapper>
                <div className={cx('profile-menu')}>
                    {profileMenuItems.map((item) => (
                        <Link key={item.to} to={item.to} className={cx('menu-item')}>
                            <FontAwesomeIcon icon={item.icon} />
                            <span className={cx('text-item')}>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </PopperWrapper>
        </div>
    );

    return (
        <header className={cx('wrapper')}>
            <div className={cx('content')}>
                <div className={cx('logo')}>
                    <div className={cx('logo-icon')}>
                        <span>B</span>
                    </div>
                    <span className={cx('logo-text')}>BookStore</span>
                </div>

                <nav className={cx('nav')}>
                    <button>Home</button>
                    <button>Books</button>
                    <button>Profile</button>
                </nav>

                <div className={cx('actions')}>
                    {/* Search */}
                    <div className={cx('search-wrapper', { active: showSearch })} ref={searchRef}>
                        <input
                            type="text"
                            placeholder="Search books..."
                            className={cx('search-input')}
                            onFocus={() => setShowSearch(true)}
                        />
                        <FontAwesomeIcon
                            icon={faSearch}
                            className={cx('icon-btn', 'search-icon')}
                            onClick={() => setShowSearch((prev) => !prev)}
                        />
                    </div>

                    {/* Cart */}
                    <div className={cx('cart-wrapper')}>
                        <FontAwesomeIcon icon={faShoppingCart} className={cx('icon-btn')} />
                        <span className={cx('badge')}>1</span>
                    </div>

                    {/* Profile */}
                    <Tippy
                        render={renderProfileMenu}
                        placement="bottom-end"
                        hideOnClick={false}
                        interactive
                        delay={[100, 200]}
                    >
                        <div onMouseEnter={() => setShowSearch(false)} onMouseLeave={() => setShowSearch(false)}>
                            <FontAwesomeIcon icon={faUser} className={cx('icon-btn')} />
                        </div>
                    </Tippy>
                </div>
            </div>
        </header>
    );
}

export default Header;
