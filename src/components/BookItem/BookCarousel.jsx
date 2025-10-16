import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './BookCarousel.module.scss';
import BookItem from './BookItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const cx = classNames.bind(styles);

function BookCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const books = [
        {
            id: 1,
            title: 'The Midnight Library',
            author: 'Matt Haig',
            price: 24.99,
            image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
            rating: 4.5,
            reviews: 2847,
            isBestseller: true,
        },
        {
            id: 2,
            title: 'Atomic Habits',
            author: 'James Clear',
            price: 18.99,
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            rating: 4.8,
            reviews: 15234,
            isBestseller: true,
        },
        {
            id: 3,
            title: 'The Alchemist',
            author: 'Paulo Coelho',
            price: 15.5,
            image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
            rating: 4.7,
            reviews: 8921,
            isBestseller: false,
        },
        {
            id: 4,
            title: 'Educated',
            author: 'Tara Westover',
            price: 22.99,
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
            rating: 4.6,
            reviews: 5678,
            isBestseller: true,
        },
        {
            id: 5,
            title: 'Where the Crawdads Sing',
            author: 'Delia Owens',
            price: 19.99,
            image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
            rating: 4.4,
            reviews: 12345,
            isBestseller: false,
        },
        {
            id: 6,
            title: 'The Silent Patient',
            author: 'Alex Michaelides',
            price: 16.75,
            image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
            rating: 4.2,
            reviews: 8765,
            isBestseller: true,
        },
        {
            id: 7,
            title: 'Dune',
            author: 'Frank Herbert',
            price: 29.99,
            image: 'https://images.unsplash.com/photo-1554757380-2fb69b9b940c?w=400',
            rating: 4.9,
            reviews: 23456,
            isBestseller: true,
        },
        {
            id: 8,
            title: '1984',
            author: 'George Orwell',
            price: 14.99,
            image: 'https://images.unsplash.com/photo-1531346680769-a1d79b57de2b?w=400',
            rating: 4.8,
            reviews: 18976,
            isBestseller: false,
        },
        {
            id: 9,
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            price: 17.5,
            image: 'https://images.unsplash.com/photo-1529651737248-dad5e287768e?w=400',
            rating: 4.3,
            reviews: 12000,
            isBestseller: true,
        },
        {
            id: 10,
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            price: 21.0,
            image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
            rating: 4.9,
            reviews: 18765,
            isBestseller: true,
        },
    ];

    const booksPerPage = 4;
    const maxIndex = Math.ceil(books.length / booksPerPage);

    const handleNext = () => {
        {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % maxIndex);
        }
    };

    const handlePrev = () => {
        {
            setDirection(-1);
            setCurrentIndex((prev) => (prev - 1 + maxIndex) % maxIndex);
        }
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

            <div className={cx('book-list-container')}>
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
                        <BookItem key={book.id} book={book} />
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

export default BookCarousel;
