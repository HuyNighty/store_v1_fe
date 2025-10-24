import classNames from 'classnames/bind';
import styles from './BookItem.module.scss';
import Button from '../../Layouts/components/Button';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function BookItem({ book }) {
    const navigate = useNavigate();

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
        rating,
        reviews,
        stockQuantity,
        weightG,
        sku,
        slug,
    } = book;

    const imageUrl = productAssets[0]?.url || '/images/default-book.jpg';
    const displayPrice = salePrice ?? price;

    const handleViewDetails = () => {
        // Chuyển hướng đến trang chi tiết và truyền toàn bộ dữ liệu book
        navigate('/book-item', {
            state: {
                book: {
                    productId,
                    productName,
                    productAssets,
                    featured,
                    bookAuthors,
                    salePrice,
                    price,
                    rating,
                    reviews,
                    stockQuantity,
                    weightG,
                    sku,
                    slug,
                    imageUrl,
                },
            },
        });
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
                    <div className={cx('book-item-stars')}>{rating || 0} ⭐</div>
                    <span className={cx('book-item-reviews')}>({reviews || 0} reviews)</span>
                </div>
                <div className={cx('book-item-footer')}>
                    <p className={cx('book-item-price')}>{displayPrice / 1000}.000 đ</p>
                    <Button small outline className={cx('book-item-view-btn')} onClick={handleViewDetails}>
                        Xem chi tiết
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default BookItem;
