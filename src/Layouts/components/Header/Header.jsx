import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faGear, faRightFromBracket, faSearch, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Tippy from '@tippyjs/react/headless';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import { useState, useRef, useEffect } from 'react';
import PopperWrapper from '../../Popper/Wrapper';

const cx = classNames.bind(styles);

function Header() {
    const fakeBooks = [
        {
            id: 1,
            title: 'Clean Code',
            price: 350000,
            image: 'https://img.lazcdn.com/g/p/a0bc826b8fab3318f17974a0a92b04d4.jpg_720x720q80.jpg',
        },
        { id: 2, title: 'Effective Java', price: 420000, image: '/images/effectivejava.jpg' },
        { id: 3, title: 'Spring Boot in Action', price: 390000, image: '/images/springboot.jpg' },
        { id: 4, title: 'Java Concurrency in Practice', price: 460000, image: '/images/java_concurrency.jpg' },
    ];

    const profileMenuItems = [
        { to: '/profile', icon: faUser, label: 'Profile Info' },
        { to: '/orders', icon: faBox, label: 'My Orders' },
        { to: '/settings', icon: faGear, label: 'Settings' },
        { to: '/logout', icon: faRightFromBracket, label: 'Logout' },
    ];

    const [showSearch, setShowSearch] = useState(false);
    const [animateSearch, setAnimateSearch] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setAnimateSearch(false);
                setTimeout(() => setShowSearch(false), 400);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setAnimateSearch(false);
                setTimeout(() => setShowSearch(false), 400);
                setQuery('');
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    useEffect(() => {
        if (showSearch && searchRef.current) {
            const inputEl = searchRef.current.querySelector('input');
            inputEl?.focus();
        }
    }, [showSearch]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        const timeout = setTimeout(() => {
            const filtered = fakeBooks.filter((b) => b.title.toLowerCase().includes(query.toLowerCase()));
            setResults(filtered);
        }, 400);
        return () => clearTimeout(timeout);
    }, [query]);

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

    const renderSearchResults = (attrs) => (
        <div className={cx('search-results')} tabIndex="-1" {...attrs}>
            <PopperWrapper>
                {results.length > 0 ? (
                    results.map((book) => (
                        <Link to={`/book/${book.id}`} key={book.id} className={cx('search-item')}>
                            <img src={book.image} alt={book.title} className={cx('book-thumb')} />
                            <div className={cx('book-info')}>
                                <span className={cx('book-title')}>{book.title}</span>
                                <span className={cx('book-price')}>{book.price.toLocaleString('vi-VN')}₫</span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className={cx('no-results')}>No books found</p>
                )}
            </PopperWrapper>
        </div>
    );

    return (
        <header className={cx('wrapper')}>
            <div className={cx('content')}>
                {/* Logo */}
                <div className={cx('logo')}>
                    <div className={cx('logo-icon')}>
                        <span>B</span>
                    </div>
                    <span className={cx('logo-text')}>BookStore</span>
                </div>

                {/* Navigation */}
                <nav className={cx('nav')}>
                    <button>Home</button>
                    <button>Books</button>
                    <button>Profile</button>
                </nav>

                {/* Actions */}
                <div className={cx('actions')}>
                    {/* Search */}
                    <Tippy
                        visible={showSearch && results.length > 0}
                        offset={[-100, 10]}
                        interactive
                        render={renderSearchResults}
                    >
                        <div className={cx('search-wrapper', { active: animateSearch })} ref={searchRef}>
                            <input
                                type="text"
                                placeholder="Search books..."
                                className={cx('search-input')}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => {
                                    setShowSearch(true);
                                    setTimeout(() => setAnimateSearch(true), 10);
                                }}
                            />
                            <FontAwesomeIcon
                                icon={faSearch}
                                className={cx('icon-btn', 'search-icon')}
                                onClick={() => {
                                    if (!showSearch) {
                                        setShowSearch(true);
                                        setTimeout(() => setAnimateSearch(true), 10);
                                    } else {
                                        setAnimateSearch(false);
                                        setTimeout(() => setShowSearch(false), 400);
                                        setQuery('');
                                    }
                                }}
                            />
                        </div>
                    </Tippy>

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
                        onShow={() => {
                            setAnimateSearch(false);
                            setTimeout(() => setShowSearch(false), 300);
                            setQuery('');
                        }}
                    >
                        <div>
                            <FontAwesomeIcon icon={faUser} className={cx('icon-btn')} />
                        </div>
                    </Tippy>
                </div>
            </div>
        </header>
    );
}

export default Header;
