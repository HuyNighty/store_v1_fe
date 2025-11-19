// src/components/BookItem/BookCarousel.jsx
import React, { useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames/bind';
import styles from './BookCarousel.module.scss';
import BookItem from './BookItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import productApi from '../../api/productApi';
import AnimatedContent from '../Animations/AnimatedContent';

const cx = classNames.bind(styles);

function chunkArray(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

const isTruthyFlag = (v) => {
    if (typeof v === 'boolean') return v === true;
    if (typeof v === 'number') return v === 1;
    if (typeof v === 'string') return ['true', '1', 'yes'].includes(v.toLowerCase());
    return false;
};

const normalizeText = (s) =>
    (s ?? '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

const BESTSELLER_KEYWORDS = [
    'ban chay',
    'banchay',
    'ban-chay',
    'bestseller',
    'best-seller',
    'best',
    'best seller',
    'banchạy',
    'bán chạy',
];

const BookCarousel = forwardRef(function BookCarousel(
    {
        id = undefined, // id prop để ImageGrid / anchor scroll tới
        categoryId = null,
        categorySlug = '',
        categoryName = '',
        title = 'Sách nổi bật',
        limit = 12,
        booksPerPage = 4,
    },
    ref,
) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Expose imperative API: scrollToProduct(productId)
    useImperativeHandle(
        ref,
        () => ({
            scrollToProduct(productId) {
                const pageIndex = pages.findIndex((page) =>
                    page.some((b) => String(b.productId) === String(productId)),
                );
                if (pageIndex >= 0) {
                    setCurrentIndex(pageIndex);
                } else {
                    console.warn('[BookCarousel] Không tìm thấy productId trong pages:', productId);
                }
            },
        }),
        // pages is defined below; keep ESLint quiet by listing booksPerPage (pages derived from books)
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    useEffect(() => {
        let mounted = true;

        const fetchBooks = async () => {
            try {
                console.debug('[BookCarousel] fetchBooks start', { categoryId, categorySlug, categoryName, limit });
                setLoading(true);
                setError(null);
                let resp = null;

                // 1) Thử getByCategoryName (nếu backend có)
                if (categoryName && productApi.getByCategoryName) {
                    try {
                        resp = await productApi.getByCategoryName(categoryName);
                        console.debug('[BookCarousel] resp from getByCategoryName', resp?.data ?? resp);
                    } catch (e) {
                        console.warn('[BookCarousel] getByCategoryName failed', e);
                        resp = resp ?? null;
                    }
                }

                // 2) Thử getByCategory (id)
                if ((!resp || (Array.isArray(resp) && resp.length === 0)) && categoryId && productApi.getByCategory) {
                    try {
                        resp = await productApi.getByCategory(categoryId);
                        console.debug('[BookCarousel] resp from getByCategory', resp?.data ?? resp);
                    } catch (e) {
                        console.warn('[BookCarousel] getByCategory failed', e);
                        resp = resp ?? null;
                    }
                }

                // 3) Thử filterProducts
                if (
                    (!resp || (Array.isArray(resp) && resp.length === 0)) &&
                    productApi.filterProducts &&
                    (categoryId || categorySlug || categoryName)
                ) {
                    try {
                        const filters = {};
                        if (categoryId) filters.categoryId = categoryId;
                        if (categorySlug) filters.categorySlug = categorySlug;
                        if (categoryName) filters.categoryName = categoryName;
                        resp = await productApi.filterProducts(filters);
                        console.debug('[BookCarousel] resp from filterProducts', resp?.data ?? resp);
                    } catch (e) {
                        console.warn('[BookCarousel] filterProducts failed', e);
                        resp = resp ?? null;
                    }
                }

                // 4) Fallback getAll
                if (!resp || resp == null) {
                    resp = await productApi.getAll();
                    console.debug(
                        '[BookCarousel] resp from getAll (fallback) length',
                        (resp?.data ?? resp)?.length ?? null,
                    );
                }

                // normalize to array
                const data = resp?.data ?? resp;
                let list = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.result)
                    ? data.result
                    : Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data?.items)
                    ? data.items
                    : [];

                if (!Array.isArray(list)) list = [];

                // filter active
                let filtered = list.filter((b) => {
                    const val = b.isActive ?? b.active ?? b.is_active ?? b.activeFlag;
                    return isTruthyFlag(val);
                });

                // decide if wants bestseller (feature flag)
                const normalizedCategory = normalizeText(categoryName);
                const wantsBestseller = BESTSELLER_KEYWORDS.some((kw) => normalizedCategory.includes(kw));

                if (wantsBestseller) {
                    // filter by feature flags on product
                    filtered = filtered.filter((b) =>
                        isTruthyFlag(b.feature ?? b.featured ?? b.isFeatured ?? b.bestSeller ?? b.bestseller),
                    );
                    console.debug('[BookCarousel] Applied bestseller filter, remaining:', filtered.length);
                } else if (categoryName) {
                    // client-side category name contains
                    const lowerName = normalizeText(categoryName);
                    filtered = filtered.filter((book) => {
                        const names = [
                            ...(book.categories?.map((c) => c.categoryName ?? c.name) ?? []),
                            book.categoryName ?? book.category ?? '',
                            ...(book.productCategory?.map((pc) => pc.category?.categoryName ?? '') ?? []),
                        ]
                            .filter(Boolean)
                            .map((s) => normalizeText(s));
                        return names.some((n) => n.includes(lowerName));
                    });
                    console.debug(
                        '[BookCarousel] Applied categoryName client-side filter, remaining:',
                        filtered.length,
                    );
                }

                // sort by popularity/soldCount fallback
                filtered.sort(
                    (a, b) => (Number(b.popularity ?? b.soldCount) || 0) - (Number(a.popularity ?? a.soldCount) || 0),
                );

                if (limit && filtered.length > limit) filtered = filtered.slice(0, limit);

                if (mounted) {
                    setBooks(filtered);
                    setCurrentIndex(0);
                }
            } catch (err) {
                console.error('[BookCarousel] fetchBooks error', err);
                if (mounted) {
                    setError('Không thể tải sách.');
                    setBooks([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchBooks();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId, categorySlug, categoryName, limit]);

    const pages = useMemo(() => {
        const p = chunkArray(books, booksPerPage);
        return p;
    }, [books, booksPerPage]);

    const maxIndex = Math.max(0, pages.length - 1);

    useEffect(() => {
        if (currentIndex > maxIndex) setCurrentIndex(maxIndex);
    }, [maxIndex, currentIndex]);

    const handleNext = () => {
        if (pages.length <= 1 || isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => {
            const next = prev + 1 > maxIndex ? 0 : prev + 1;
            setTimeout(() => setIsTransitioning(false), 480);
            return next;
        });
    };

    const handlePrev = () => {
        if (pages.length <= 1 || isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => {
            const next = prev - 1 < 0 ? maxIndex : prev - 1;
            setTimeout(() => setIsTransitioning(false), 480);
            return next;
        });
    };

    return (
        // gắn id trực tiếp lên wrapper để ImageGrid có thể document.getElementById('best-seller') và scroll
        <div id={id} className={cx('carousel-wrapper')} aria-roledescription="carousel">
            <div className={cx('header')}>
                <div className={cx('nav-buttons')}>
                    <button
                        className={cx('nav-btn')}
                        onClick={handlePrev}
                        aria-label="Previous"
                        disabled={pages.length <= 1 || isTransitioning}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>

                    <AnimatedContent>
                        <div className={cx('fea-text')}>{title}</div>
                    </AnimatedContent>

                    <button
                        className={cx('nav-btn')}
                        onClick={handleNext}
                        aria-label="Next"
                        disabled={pages.length <= 1 || isTransitioning}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>

            <div className={cx('text')}>
                {loading && <div className={cx('loading')}>Đang tải sách...</div>}
                {error && <div className={cx('error')}>{error}</div>}
                {!books.length && !loading && <div className={cx('empty')}>Không có sách để hiển thị</div>}
            </div>

            <div className={cx('book-list-container')}>
                <motion.div
                    className={cx('book-list-track')}
                    animate={{ x: `-${currentIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                >
                    {pages.length > 0 ? (
                        pages.map((page, pIdx) => (
                            <div className={cx('book-page')} key={`page-${pIdx}`}>
                                {page.map((book) => (
                                    <BookItem
                                        key={book.productId ?? book.slug ?? `${pIdx}-${book.productName}`}
                                        book={book}
                                    />
                                ))}
                            </div>
                        ))
                    ) : (
                        <div className={cx('book-page', 'empty-page')} />
                    )}
                </motion.div>
            </div>
        </div>
    );
});

export default BookCarousel;
