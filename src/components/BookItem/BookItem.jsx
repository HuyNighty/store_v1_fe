import classNames from 'classnames/bind';
import styles from './BookItem.module.scss';
import Button from '../../Layouts/components/Button';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import reviewApi from '../../api/reviewApi';
import Magnet from '../Animations/Magnet';

const cx = classNames.bind(styles);

function BookItem({ book }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    console.log(book);

    if (!book) return null;

    const {
        productId,
        productName,
        productAssets = [],
        featured,
        bookAuthors = [],
        salePrice,
        price,
        stockQuantity,
        weightG,
        sku,
        slug,
    } = book;

    const imageUrl = productAssets[0]?.url || '/images/default-book.jpg';
    const displayPrice = salePrice ?? price;

    // Load reviews khi component mount
    useEffect(() => {
        const loadReviews = async () => {
            if (!productId) return;

            setLoading(true);
            try {
                const response = await reviewApi.getReviewsByProduct(productId);
                let reviewsData = [];

                if (response.data && response.data.result !== undefined) {
                    if (Array.isArray(response.data.result)) {
                        reviewsData = response.data.result;
                    }
                } else if (Array.isArray(response.data)) {
                    reviewsData = response.data;
                }

                setReviews(reviewsData);
            } catch (error) {
                console.error('Error loading reviews for book item:', error);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        loadReviews();
    }, [productId]);

    const averageRating =
        reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

    const displayRating = Math.round(averageRating * 10) / 10;
    const reviewCount = reviews.length;

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<FaStar key={i} style={{ color: 'var(--star-color)', fontSize: '1.6rem' }} />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<FaStarHalfAlt key="half" style={{ color: 'var(--star-color)', fontSize: '1.6rem' }} />);
            } else {
                stars.push(<FaRegStar key={i} style={{ color: '#e0e0e0', fontSize: '1.6rem' }} />);
            }
        }

        return stars;
    };

    return (
        <div key={productId} className={cx('book-item')}>
            <div className={cx('book-item-image')}>
                <img src={imageUrl} alt={productName} className={cx('book-item-img')} />
                {featured && <span className={cx('bestseller')}>Bestseller</span>}
            </div>

            <div className={cx('book-item-details')}>
                <p className={cx('book-item-title')}>{productName}</p>

                {bookAuthors.length > 0 ? (
                    bookAuthors.map((author) => (
                        <p key={author.authorId} className={cx('book-item-author')}>
                            {author.authorName}
                        </p>
                    ))
                ) : (
                    <p className={cx('book-item-author')}>Tác giả: Đang cập nhật</p>
                )}

                <div className={cx('book-item-rating')}>
                    {loading ? (
                        <div className={cx('book-item-loading')}>Đang tải đánh giá...</div>
                    ) : (
                        <>
                            <div className={cx('book-item-stars')}>
                                {renderStars(displayRating)}
                                <span className={cx('book-item-rating-number')}>({displayRating})</span>
                            </div>
                            <span className={cx('book-item-reviews')}>({reviewCount} reviews)</span>
                        </>
                    )}
                </div>

                <div className={cx('book-item-footer')}>
                    <p className={cx('book-item-price')}>{displayPrice / 1000}.000 đ</p>
                    <Magnet magnetStrength={10}>
                        <Button
                            small
                            outline
                            shine
                            className={cx('book-item-view-btn')}
                            to="/book-item"
                            state={{
                                book: {
                                    productId,
                                    productName,
                                    productAssets,
                                    featured,
                                    bookAuthors,
                                    salePrice,
                                    price,
                                    rating: displayRating,
                                    reviews,
                                    stockQuantity,
                                    weightG,
                                    sku,
                                    slug,
                                    imageUrl,
                                },
                            }}
                            scrollToTop
                        >
                            Xem chi tiết
                        </Button>
                    </Magnet>
                </div>
            </div>
        </div>
    );
}

export default BookItem;
