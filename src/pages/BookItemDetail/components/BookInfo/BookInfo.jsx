import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './BookInfo.module.scss';
import Button from '../../../../Layouts/components/Button';
import QuantityInput from '../../../../Layouts/components/QuantityInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faShoppingCart,
    faTruck,
    faBook,
    faTags,
    faLayerGroup,
    faHeart as faHeartSolid,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

const cx = classNames.bind(styles);

function formatVND(value) {
    if (value === null || value === undefined || isNaN(Number(value))) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(Number(value)) + ' ₫';
}

function formatDate(value) {
    if (!value) return '-';
    try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value?.toString() ?? '-';
        return d.toLocaleDateString('vi-VN');
    } catch {
        return value?.toString() ?? '-';
    }
}

function ensureArr(input) {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    return [input];
}

function BookInfo({
    productName = '',
    sku = '',
    categories = [],
    bookAuthors = [],
    navigate,
    averageRating = 0,
    renderStars,
    reviewCount = 0,
    reviews = [],
    setActiveTab = () => {},
    displayPrice = null,
    salePrice = null,
    price = null,
    discountPercent = 0,
    publisher = '',
    publishedDate = '',
    pages = null,
    language = '',
    isbn = '',
    weightG = null,
    stockQuantity = 0,
    quantity = 1,
    setQuantity = () => {},
    isInCart = false,
    cartQuantity = 0,
    addingToCart = false,
    handleAddToCart = () => {},
    handleUpdateCart = () => {},
    handleBuyNow = (e) => {
        e.preventDefault();
        navigate('/cart');
    },
    isWishlisted = false,
    handleWishlistToggle = () => {},
    handleShare = () => {},
}) {
    const cats = useMemo(() => ensureArr(categories), [categories]);
    const authors = useMemo(() => ensureArr(bookAuthors), [bookAuthors]);

    const handleViewReviews = () => {
        setActiveTab('reviews');
        setTimeout(() => {
            const el = document.getElementById('reviews-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const goToAuthor = (author) => {
        const id = author?.authorId ?? author?.id;
        const slugOrPath = id
            ? `/authors/${id}`
            : author?.authorName
            ? `/search?author=${encodeURIComponent(author.authorName)}`
            : '/authors';
        if (typeof navigate === 'function') navigate(slugOrPath);
        else window.location.href = slugOrPath;
    };

    const priceToShow = displayPrice ?? salePrice ?? price;
    const showDiscount = salePrice && price && salePrice < price;

    return (
        <div className={cx('info-section')}>
            <h1 className={cx('product-title')}>{productName || 'Tên sách chưa có'}</h1>

            <div className={cx('meta-info')}>
                <div className={cx('meta-item')}>
                    <FontAwesomeIcon icon={faTags} />
                    <span>SKU: {sku || 'N/A'}</span>
                </div>

                {cats.length > 0 && (
                    <div className={cx('meta-item')}>
                        <FontAwesomeIcon icon={faLayerGroup} />
                        <span>
                            Thể loại:{' '}
                            {cats
                                .map((c) => (typeof c === 'string' ? c : c?.categoryName ?? c?.name ?? '—'))
                                .filter(Boolean)
                                .join(', ')}
                        </span>
                    </div>
                )}
            </div>

            <div className={cx('authors-section')}>
                <h3>
                    <FontAwesomeIcon icon={faBook} />
                    &nbsp;Tác giả
                </h3>

                {authors.length > 0 ? (
                    <div className={cx('authors-list')}>
                        {authors.map((author, idx) => {
                            const idKey = author?.authorId ?? author?.id ?? idx;
                            const name =
                                typeof author === 'string'
                                    ? author
                                    : author?.authorName ?? author?.name ?? 'Tên tác giả';
                            return (
                                <div key={idKey} className={cx('author')}>
                                    <Button
                                        text
                                        className={cx('author-name-btn')}
                                        onClick={() => goToAuthor(author)}
                                        aria-label={`Xem tác giả ${name}`}
                                    >
                                        <strong>{name}</strong>
                                    </Button>
                                    {typeof author !== 'string' && author?.authorBio && <p>{author.authorBio}</p>}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>Đang cập nhật thông tin tác giả</p>
                )}
            </div>

            <div className={cx('rating-section')}>
                <div className={cx('rating-stars')}>
                    {typeof renderStars === 'function' ? (
                        renderStars(averageRating)
                    ) : (
                        <span className={cx('rating-value')}>{averageRating.toFixed(1)}</span>
                    )}
                    <span className={cx('rating-value')}>{Number(averageRating || 0).toFixed(1)} / 5.0</span>
                </div>

                <span className={cx('reviews')}>({(reviewCount || reviews.length).toLocaleString()} đánh giá)</span>

                <Button
                    text
                    className={cx('view-reviews-btn')}
                    onClick={handleViewReviews}
                    aria-controls="reviews-section"
                >
                    Xem đánh giá
                </Button>
            </div>

            <div className={cx('price-section')}>
                <div className={cx('price')}>
                    <span className={cx('current-price')}>{formatVND(priceToShow)}</span>

                    {showDiscount && (
                        <>
                            <span className={cx('original-price')}>{formatVND(price)}</span>
                            <span className={cx('discount')}>-{discountPercent}%</span>
                        </>
                    )}
                </div>
            </div>

            <div className={cx('book-details')}>
                <h3>Thông tin sách</h3>
                <div className={cx('details-grid')}>
                    {publisher && (
                        <div className={cx('detail-item')}>
                            <strong>Nhà xuất bản:</strong>
                            <span>{publisher}</span>
                        </div>
                    )}

                    {publishedDate && (
                        <div className={cx('detail-item')}>
                            <strong>Ngày xuất bản:</strong>
                            <span>{formatDate(publishedDate)}</span>
                        </div>
                    )}

                    {pages != null && (
                        <div className={cx('detail-item')}>
                            <strong>Số trang:</strong>
                            <span>{pages}</span>
                        </div>
                    )}

                    {language && (
                        <div className={cx('detail-item')}>
                            <strong>Ngôn ngữ:</strong>
                            <span>{language}</span>
                        </div>
                    )}

                    {isbn && (
                        <div className={cx('detail-item')}>
                            <strong>ISBN:</strong>
                            <span>{isbn}</span>
                        </div>
                    )}

                    <div className={cx('detail-item')}>
                        <strong>Trọng lượng:</strong>
                        <span>{weightG ? `${weightG} g` : '-'}</span>
                    </div>
                </div>
            </div>

            <div className={cx('wishlist-wrapper')}>
                <div className={cx('quantity-section')}>
                    <label htmlFor="qty-input">Số lượng: </label>
                    <QuantityInput
                        id="qty-input"
                        value={quantity}
                        onChange={setQuantity}
                        min={1}
                        max={stockQuantity}
                        size="medium"
                    />
                    {isInCart && <p className={cx('cart-notice')}>Đã có {cartQuantity} sản phẩm trong giỏ hàng</p>}
                </div>

                <Button
                    shine
                    outline
                    type="button"
                    onClick={handleWishlistToggle}
                    className={cx('wishlist-btn', { wishlisted: isWishlisted })}
                    aria-pressed={!!isWishlisted}
                    aria-label={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                    title={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                >
                    <FontAwesomeIcon icon={isWishlisted ? faHeartSolid : faHeartRegular} />
                    <span className={cx('wishlist-text')}>{isWishlisted ? 'Yêu thích' : 'Thêm yêu thích'}</span>
                </Button>
            </div>

            <div className={cx('stock-section')}>
                <div
                    className={cx('stock-status', {
                        'in-stock': Number(stockQuantity) > 0,
                        'out-of-stock': Number(stockQuantity) === 0,
                    })}
                    role="status"
                    aria-live="polite"
                >
                    <FontAwesomeIcon icon={faTruck} />
                    <span>{Number(stockQuantity) > 0 ? ` Còn hàng (${stockQuantity})` : ' Tạm hết hàng'}</span>
                </div>
            </div>

            <div className={cx('action-buttons')}>
                {isInCart ? (
                    <Button
                        height={5}
                        shine
                        primary
                        large
                        onClick={handleUpdateCart}
                        disabled={Number(stockQuantity) === 0 || addingToCart}
                        className={cx('update-cart-btn')}
                        aria-disabled={Number(stockQuantity) === 0 || addingToCart}
                    >
                        <FontAwesomeIcon icon={faShoppingCart} />
                        &nbsp;{addingToCart ? 'Đang cập nhật...' : 'Cập nhật giỏ hàng'}
                    </Button>
                ) : (
                    <Button
                        height={5}
                        shine
                        primary
                        large
                        onClick={handleAddToCart}
                        disabled={Number(stockQuantity) === 0 || addingToCart}
                        className={cx('add-to-cart-btn')}
                        aria-disabled={Number(stockQuantity) === 0 || addingToCart}
                    >
                        <FontAwesomeIcon icon={faShoppingCart} />
                        &nbsp;
                        {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                    </Button>
                )}

                <Button
                    height={5}
                    shine
                    outline
                    large
                    onClick={handleBuyNow}
                    disabled={Number(stockQuantity) === 0}
                    className={cx('buy-now-btn')}
                >
                    Mua ngay
                </Button>
            </div>
        </div>
    );
}

BookInfo.propTypes = {
    productName: PropTypes.string,
    sku: PropTypes.string,
    categories: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
    bookAuthors: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
    navigate: PropTypes.func,
    averageRating: PropTypes.number,
    renderStars: PropTypes.func,
    reviewCount: PropTypes.number,
    reviews: PropTypes.array,
    setActiveTab: PropTypes.func,
    displayPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    salePrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    discountPercent: PropTypes.number,
    publisher: PropTypes.string,
    publishedDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    pages: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    language: PropTypes.string,
    isbn: PropTypes.string,
    weightG: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    stockQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    quantity: PropTypes.number,
    setQuantity: PropTypes.func,
    isInCart: PropTypes.bool,
    cartQuantity: PropTypes.number,
    addingToCart: PropTypes.bool,
    handleAddToCart: PropTypes.func,
    handleUpdateCart: PropTypes.func,
    handleBuyNow: PropTypes.func,
    isWishlisted: PropTypes.bool,
    handleWishlistToggle: PropTypes.func,
    handleShare: PropTypes.func,
};

export default BookInfo;
