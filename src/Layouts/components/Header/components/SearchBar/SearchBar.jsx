import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCircleXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';
import HeadlessTippy from '@tippyjs/react/headless';
import classNames from 'classnames/bind';
import { useState, useEffect, useRef } from 'react';
import { Wrapper as PopperWrapper } from '../../../../Popper';
import styles from './SearchBar.module.scss';
import { useDebounce } from '~/hooks';

const cx = classNames.bind(styles);

function SearchBar() {
    const [searchState, setSearchState] = useState({
        showSearch: false,
        isExpanded: false,
        query: '',
    });

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const { showSearch, isExpanded, query } = searchState;

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

    const debouncedQuery = useDebounce(query, 400);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                closeSearch();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') closeSearch();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    useEffect(() => {
        if (showSearch && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showSearch]);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            setSearched(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(() => {
            const filtered = fakeBooks.filter((b) => b.title.toLowerCase().includes(debouncedQuery.toLowerCase()));
            setResults(filtered);
            setLoading(false);
            setSearched(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [debouncedQuery]);

    const closeSearch = () => {
        setSearchState({
            showSearch: false,
            isExpanded: false,
            query: '',
        });
        setSearched(false);
    };

    const openSearch = () => {
        setSearchState((prev) => ({
            ...prev,
            showSearch: true,
            isExpanded: true,
        }));
    };

    const handleClear = () => {
        setSearchState((prev) => ({ ...prev, query: '' }));
        setResults([]);
        setSearched(false);
        inputRef.current?.focus();
    };

    const handleInputChange = (e) => {
        setSearchState((prev) => ({ ...prev, query: e.target.value }));
    };

    const handleInputFocus = () => {
        if (!showSearch) {
            openSearch();
        }
    };

    const toggleSearch = () => {
        if (!showSearch) {
            openSearch();
        } else {
            closeSearch();
        }
    };

    return (
        <HeadlessTippy
            appendTo={() => wrapperRef.current}
            visible={showSearch && (loading || results.length > 0 || (searched && results.length === 0))}
            interactive
            placement="bottom-end"
            offset={[50, 10]}
            render={(attrs) => (
                <div className={cx('search-results')} tabIndex="-1" {...attrs}>
                    <PopperWrapper>
                        {loading ? (
                            <div className={cx('no-results')}>Đang tìm kiếm...</div>
                        ) : results.length > 0 ? (
                            results.map((book) => (
                                <div key={book.id} className={cx('search-item')}>
                                    <img src={book.image} alt={book.title} className={cx('book-thumb')} />
                                    <div className={cx('book-info')}>
                                        <span className={cx('book-title')}>{book.title}</span>
                                        <span className={cx('book-price')}>{book.price.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            searched && <div className={cx('no-results')}>Không tìm thấy sách nào</div>
                        )}
                    </PopperWrapper>
                </div>
            )}
        >
            <div
                className={cx('search-wrapper', {
                    active: isExpanded,
                })}
                ref={wrapperRef}
            >
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Tìm kiếm sách..."
                    className={cx('search-input')}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                />

                {!!query && !loading && (
                    <button className={cx('clear')} onClick={handleClear}>
                        <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                )}

                {loading && <FontAwesomeIcon className={cx('loading')} icon={faSpinner} />}

                <FontAwesomeIcon icon={faSearch} className={cx('search-icon', 'search-btn')} onClick={toggleSearch} />
            </div>
        </HeadlessTippy>
    );
}

export default SearchBar;
