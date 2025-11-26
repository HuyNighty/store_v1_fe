import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './RelatedBooks.module.scss';
import productApi from '../../../../api/productApi';
import BookItem from '../../../../components/BookItem/BookItem';

const cx = classNames.bind(styles);

function RelatedBooks({ currentBook, navigate }) {
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelatedBooks = async () => {
            if (!currentBook) return;

            try {
                setLoading(true);

                const categoryId = currentBook.categories?.[0]?.categoryId;
                let books = [];

                if (categoryId) {
                    const response = await productApi.getByCategory(categoryId);
                    books = response.data || response || [];
                } else {
                    const response = await productApi.getAll();
                    books = response.data || response || [];
                }

                const filteredBooks = books.filter((book) => book.productId !== currentBook.productId).slice(0, 8);

                setRelatedBooks(filteredBooks);
            } catch (error) {
                console.error('Error fetching related books:', error);
                setRelatedBooks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedBooks();
    }, [currentBook]);

    if (loading) {
        return (
            <div className={cx('related-books')}>
                <h2 className={cx('title')}>Sách liên quan</h2>
                <div className={cx('loading')}>Đang tải sách liên quan...</div>
            </div>
        );
    }

    if (relatedBooks.length === 0) {
        return null;
    }

    return (
        <div className={cx('related-books')}>
            <h2 className={cx('title')}>Có thể bạn quan tâm</h2>
            <div className={cx('books-grid')}>
                {relatedBooks.map((book) => (
                    <BookItem
                        key={book.productId}
                        book={book}
                        onClick={() => navigate('/book-item', { state: { book } })}
                    />
                ))}
            </div>
        </div>
    );
}

export default RelatedBooks;
