import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCircleXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';
import HeadlessTippy from '@tippyjs/react/headless';
import classNames from 'classnames/bind';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.scss';
import { useDebounce } from '~/hooks';
import productApi from '~/api/productApi';
import Button from '../../../Button';

const cx = classNames.bind(styles);

function SearchBar({ searchState, setSearchState, isTransparent, ...props }) {
    const navigate = useNavigate();
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
                const data = resp?.data ?? resp;

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

    const getMainImage = (book) => {
        if (book.productAssets && book.productAssets.length > 0) {
            return book.productAssets[0].url;
        }
        return '/images/default-book.jpg';
    };

    const getDiscountPercent = (book) => {
        if (book.salePrice && book.price && book.salePrice < book.price) {
            return Math.round((1 - book.salePrice / book.price) * 100);
        }
        return 0;
    };

    const handleBookClick = (book) => {
        closeSearch();
        navigate('/book-item', {
            state: {
                book: {
                    productId: book.productId,
                    productName: book.productName,
                    productAssets: book.productAssets || [],
                    featured: book.featured,
                    bookAuthors: book.bookAuthors || [],
                    salePrice: book.salePrice,
                    price: book.price,
                    rating: book.rating,
                    reviews: book.reviews,
                    stockQuantity: book.stockQuantity,
                    weightG: book.weightG,
                    sku: book.sku,
                    slug: book.slug,
                    imageUrl: getMainImage(book),
                },
            },
        });
    };

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
        if (!showSearch) openSearch();
    };

    const toggleSearch = () => {
        if (!showSearch) openSearch();
        else closeSearch();
    };

    return (
        <HeadlessTippy
            appendTo={() => wrapperRef.current || document.body}
            visible={showSearch && (loading || results.length > 0 || (searched && results.length === 0))}
            interactive
            placement="bottom-end"
            offset={[0, 8]}
            render={(attrs) => (
                <div
                    className={cx('search-results', {
                        transparent: isTransparent,
                        solid: !isTransparent,
                    })}
                    tabIndex="-1"
                    {...attrs}
                >
                    {loading ? (
                        <div className={cx('no-results')}>
                            <FontAwesomeIcon icon={faSpinner} spin /> Đang tìm kiếm...
                        </div>
                    ) : error ? (
                        <div className={cx('no-results')}>{error}</div>
                    ) : results.length > 0 ? (
                        <div className={cx('results-list')}>
                            {results.map((book) => {
                                const discountPercent = getDiscountPercent(book);
                                const hasDiscount = discountPercent > 0;

                                return (
                                    <div
                                        key={book.productId || book.id}
                                        className={cx('search-item')}
                                        onClick={() => handleBookClick(book)}
                                    >
                                        <img
                                            src={getMainImage(book)}
                                            alt={book.productName}
                                            className={cx('book-thumb')}
                                            onError={(e) => {
                                                e.target.src = '/images/default-book.jpg';
                                            }}
                                        />
                                        <div className={cx('book-info')}>
                                            <span className={cx('book-title')}>{book.productName}</span>

                                            {book.bookAuthors && book.bookAuthors.length > 0 && (
                                                <span className={cx('book-author')}>
                                                    {book.bookAuthors[0].authorName}
                                                </span>
                                            )}

                                            <div className={cx('price-section')}>
                                                {hasDiscount ? (
                                                    <div className={cx('sale-price-container')}>
                                                        <div className={cx('price-row')}>
                                                            <span className={cx('sale-price')}>
                                                                {book.salePrice?.toLocaleString('vi-VN')} đ
                                                            </span>
                                                            <span className={cx('discount-badge')}>
                                                                -{discountPercent}%
                                                            </span>
                                                        </div>
                                                        <div className={cx('price-row')}>
                                                            <span className={cx('original-price')}>
                                                                {book.price?.toLocaleString('vi-VN')} đ
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className={cx('normal-price')}>
                                                        {book.price?.toLocaleString('vi-VN')} đ
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        searched && <div className={cx('no-results')}>Không tìm thấy sách nào</div>
                    )}
                </div>
            )}
        >
            <div
                className={cx('search-wrapper', {
                    active: isExpanded,
                    transparent: isTransparent,
                    solid: !isTransparent,
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
                    <button type="button" className={cx('clear')} onClick={handleClear}>
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
