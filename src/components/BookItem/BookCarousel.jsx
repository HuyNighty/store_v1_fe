import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './BookCarousel.module.scss';
import BookItem from './BookItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import productApi from '../../api/productApi';

const cx = classNames.bind(styles);

function BookCarousel() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [error, setError] = useState(null);

    const booksPerPage = 4;
    const maxIndex = Math.max(1, Math.ceil(books.length / booksPerPage));

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                const response = await productApi.getAll();
                const booksData = Array.isArray(response?.data) ? response.data : response?.result || [];

                setBooks(booksData);
            } catch (err) {
                console.error('Lỗi khi tải sách:', err);
                setError('Không thể tải danh sách sách.');
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const handleNext = () => {
        if (books.length <= booksPerPage) return;
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % maxIndex);
    };

    const handlePrev = () => {
        if (books.length <= booksPerPage) return;
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + maxIndex) % maxIndex);
    };

    const startIndex = currentIndex * booksPerPage;
    const visibleBooks = books.slice(startIndex, startIndex + booksPerPage);

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 200 : -200,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            x: direction > 0 ? -200 : 200,
            opacity: 0,
        }),
    };

    return (
        <div className={cx('carousel-wrapper')}>
            <div className={cx('header')}>
                <div className={cx('nav-buttons')}>
                    <button className={cx('nav-btn')} onClick={handlePrev}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <div className={cx('fea-text')}>Featured Books</div>
                    <button className={cx('nav-btn')} onClick={handleNext}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>
            <div className={cx('text')}>
                {loading && <div className={cx('loading')}>Đang tải sách...</div>}
                {error && <div className={cx('error')}>{error}</div>}
                {!books.length && <div className={cx('empty')}>Không có sách nào để hiển thị</div>}
            </div>

            <div className={cx('book-list-container')}>
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 100, damping: 20 },
                            opacity: { duration: 0.2 },
                        }}
                        className={cx('book-list')}
                    >
                        {visibleBooks.map((book) => (
                            <BookItem key={book.productId} book={book} />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default BookCarousel;
