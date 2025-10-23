// src/components/BookCarousel/BookCarousel.jsx
import React, { useState, useMemo, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './BookCarousel.module.scss';
import BookItem from './BookItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import productApi from '../../api/productApi';

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

    const booksPerPage = 4;

    useEffect(() => {
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
        if (pages.length <= 1) return;
        setCurrentIndex((prev) => (prev + 1 > maxIndex ? 0 : prev + 1));
    };

    const handlePrev = () => {
        if (pages.length <= 1) return;
        setCurrentIndex((prev) => (prev - 1 < 0 ? maxIndex : prev - 1));
    };

    return (
        <div className={cx('carousel-wrapper')}>
            <div className={cx('header')}>
                <div className={cx('nav-buttons')}>
                    <button
                        className={cx('nav-btn')}
                        onClick={handlePrev}
                        aria-label="Previous"
                        disabled={pages.length <= 1}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>

                    <div className={cx('fea-text')}>Featured Books</div>

                    <button
                        className={cx('nav-btn')}
                        onClick={handleNext}
                        aria-label="Next"
                        disabled={pages.length <= 1}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>

            <div className={cx('text')}>
                {loading && <div className={cx('loading')}>Đang tải sách...</div>}
                {error && <div className={cx('error')}>{error}</div>}
                {!books.length && !loading && <div className={cx('empty')}>Không có sách nào để hiển thị</div>}
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
        </div>
    );
}

export default BookCarousel;
