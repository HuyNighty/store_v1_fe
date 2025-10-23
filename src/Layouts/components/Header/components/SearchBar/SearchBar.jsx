import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCircleXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';
import HeadlessTippy from '@tippyjs/react/headless';
import classNames from 'classnames/bind';
import { useState, useEffect, useRef } from 'react';
import styles from './SearchBar.module.scss';
import { useDebounce } from '~/hooks';
import productApi from '~/api/productApi';

const cx = classNames.bind(styles);

function SearchBar({ searchState, setSearchState }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState(null);

    const { showSearch, isExpanded, query } = searchState;

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
        if (!debouncedQuery || !debouncedQuery.trim()) {
            setResults([]);
            setSearched(false);
            setError(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const fetch = async () => {
            try {
                setLoading(true);
                setError(null);

                const resp = await productApi.searchByName(debouncedQuery.trim());
                // axios usually wraps data in resp.data
                const data = resp?.data ?? resp;

                // normalise array payload
                let arr = [];
                if (Array.isArray(data)) arr = data;
                else if (Array.isArray(data.result)) arr = data.result;
                else if (Array.isArray(data.data)) arr = data.data;
                else if (Array.isArray(data.items)) arr = data.items;

                if (!cancelled) {
                    setResults(arr);
                    setSearched(true);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Search error', err);
                    setError('Có lỗi khi tìm kiếm. Thử lại.');
                    setResults([]);
                    setSearched(true);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetch();

        return () => {
            cancelled = true;
        };
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
            offset={[0, 8]}
            render={(attrs) => (
                <div className={cx('search-results')} tabIndex="-1" {...attrs}>
                    {loading ? (
                        <div className={cx('no-results')}>
                            <FontAwesomeIcon icon={faSpinner} spin /> Đang tìm kiếm...
                        </div>
                    ) : error ? (
                        <div className={cx('no-results')}>{error}</div>
                    ) : results.length > 0 ? (
                        results.map((book) => (
                            <div key={book.id ?? book.productId ?? book.productId} className={cx('search-item')}>
                                <img
                                    src={book.url ?? book.image ?? book.thumbnail}
                                    alt={book.productName ?? book.title}
                                    className={cx('book-thumb')}
                                />
                                <div className={cx('book-info')}>
                                    <span className={cx('book-title')}>{book.productName ?? book.title}</span>
                                    {book.price != null && (
                                        <span className={cx('book-price')}>
                                            {Number(book.price).toLocaleString('vi-VN')} đ
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        searched && <div className={cx('no-results')}>Không tìm thấy sách nào</div>
                    )}
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
