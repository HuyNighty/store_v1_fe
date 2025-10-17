import classNames from 'classnames/bind';
import styles from './BookItem.module.scss';
import Button from '../../Layouts/components/Button';

const cx = classNames.bind(styles);

function BookItem({ book }) {
    console.log(book);

    if (!book) return null;

    const { productId, productName, productAssets = [], featured, bookAuthors = [], salePrice, price } = book;

    const imageUrl = productAssets[0]?.url || '/images/default-book.jpg';
    const displayPrice = salePrice ?? price;

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
                    <div className={cx('book-item-stars')}>{book.rating} ⭐</div>
                    <span className={cx('book-item-reviews')}>({book.reviews} reviews)</span>
                </div>
                <div className={cx('book-item-footer')}>
                    <p className={cx('book-item-price')}>{displayPrice} đ</p>
                    <Button className={cx('book-item-view-btn')}>Xem chi tiết</Button>
                </div>
            </div>
        </div>
    );
}

export default BookItem;
