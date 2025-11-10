// src/components/BookCarousel/BookCarousel.jsx
import React, { useState, useMemo, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './BookCarousel.module.scss';
import BookItem from './BookItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import productApi from '../../api/productApi';
import Button from '../../Layouts/components/Button';
import AnimatedContent from '../Animations/AnimatedContent';

const cx = classNames.bind(styles);

function chunkArray(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

function BookCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const booksPerPage = 4;

    useEffect(() => {
        const isActiveTrue = (v) => {
            if (v === true) return true;
            if (v === false) return false;
            if (typeof v === 'number') return v === 1;
            if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
            return Boolean(v);
        };

        const fetchBooks = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await productApi.getAll();

                let booksData = [];
                if (Array.isArray(data)) {
                    booksData = data;
                } else if (Array.isArray(data?.result)) {
                    booksData = data.result;
                } else if (Array.isArray(data?.data)) {
                    booksData = data.data;
                } else if (Array.isArray(data?.items)) {
                    booksData = data.items;
                }

                // FILTER: chỉ giữ product active
                booksData = booksData.filter((b) => {
                    const val = b.isActive ?? b.active ?? b.is_active ?? b.activeFlag;
                    return isActiveTrue(val);
                });

                setBooks(booksData);
                setCurrentIndex(0);
            } catch (err) {
                console.error('Lỗi khi tải sách:', err);
                setError('Không thể tải danh sách sách.');
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const pages = useMemo(() => chunkArray(books, booksPerPage), [books, booksPerPage]);
    const maxIndex = Math.max(0, pages.length - 1);

    useEffect(() => {
        if (currentIndex > maxIndex) setCurrentIndex(maxIndex);
    }, [maxIndex, currentIndex]);

    const handleNext = () => {
        if (pages.length <= 1 || isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1 > maxIndex ? 0 : prev + 1));
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const handlePrev = () => {
        if (pages.length <= 1 || isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 < 0 ? maxIndex : prev - 1));
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const goToPage = (index) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    return (
        <div className={cx('carousel-wrapper')}>
            {/* Header với navigation buttons */}
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
                        <div className={cx('fea-text')}>Featured Books</div>
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
            {/* Status messages */}
            <div className={cx('text')}>
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div
                            className={cx('loading')}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            Đang tải sách...
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            className={cx('error')}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}
                    {!books.length && !loading && (
                        <motion.div
                            className={cx('empty')}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            Không có sách nào để hiển thị
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {/* Book list với smooth animation */}
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
                                        key={book.productId ?? book.id ?? `${pIdx}-${book.productName}`}
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
            {/* Progress indicators */}
            {/* {pages.length > 1 && (
                <div className={cx('carousel-progress')}>
                    {pages.map((_, index) => (
                        <button
                            key={index}
                            className={cx('progress-dot', { active: currentIndex === index })}
                            onClick={() => goToPage(index)}
                            aria-label={`Go to page ${index + 1}`}
                            disabled={isTransitioning}
                        />
                    ))}
                </div>
            )}
            Auto-play indicator
            {pages.length > 1 && (
                <div className={cx('auto-play-indicator')}>
                    <div className={cx('indicator-dot', { active: true })} />
                    <div className={cx('indicator-dot', { active: false })} />
                    <div className={cx('indicator-dot', { active: false })} />
                </div>
            )} */}
        </div>
    );
}

export default BookCarousel;
