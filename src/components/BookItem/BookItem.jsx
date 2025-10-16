import classNames from 'classnames/bind';
import styles from './BookItem.module.scss';

import Button from '../../Layouts/components/Button';

const cx = classNames.bind(styles);

function BookItem({ book }) {
    return (
        <div key={book.id} className={cx('book-item')}>
            <div className={cx('book-item-image')}>
                <img src={book.image} alt={book.title} className={cx('book-item-img')} />
                {book.isBestseller && <span className={cx('bestseller')}>Bestseller</span>}
            </div>

            <div className={cx('book-item-details')}>
                <p className={cx('book-item-title')}>{book.title}</p>
                <p className={cx('book-item-author')}>{book.author}</p>

                <div className={cx('book-item-rating')}>
                    <div className={cx('book-item-stars')}>{book.rating} ⭐</div>
                    <span className={cx('book-item-reviews')}>({book.reviews} reviews)</span>
                </div>

                <div className={cx('book-item-footer')}>
                    <p className={cx('book-item-price')}>${book.price}</p>
                    <Button className={cx('book-item-view-btn')}>Xem chi tiết</Button>
                </div>
            </div>
        </div>
    );
}

export default BookItem;
