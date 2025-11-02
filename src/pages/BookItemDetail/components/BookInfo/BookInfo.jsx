import React from 'react';
import classNames from 'classnames/bind';
import styles from './BookInfo.module.scss';
import Button from '../../../../Layouts/components/Button';
import QuantityInput from '../../../../Layouts/components/QuantityInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faTruck, faBook, faTags, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function BookInfo({
    productName,
    sku,
    categories,
    bookAuthors,
    navigate,
    averageRating,
    renderStars,
    reviewCount,
    reviews,
    setActiveTab,
    displayPrice,
    salePrice,
    price,
    discountPercent,
    publisher,
    publishedDate,
    pages,
    language,
    isbn,
    weightG,
    stockQuantity,
    quantity,
    setQuantity,
    isInCart,
    cartQuantity,
    addingToCart,
    handleAddToCart,
    handleUpdateCart,
    handleBuyNow,
    isWishlisted,
    handleWishlistToggle,
    handleShare,
}) {
    return (
        <div className={cx('info-section')}>
            <h1 className={cx('product-title')}>{productName}</h1>

            {/* SKU & Categories */}
            <div className={cx('meta-info')}>
                <div className={cx('meta-item')}>
                    <FontAwesomeIcon icon={faTags} />
                    <span>SKU: {sku || 'N/A'}</span>
                </div>
                {categories.length > 0 && (
                    <div className={cx('meta-item')}>
                        <FontAwesomeIcon icon={faLayerGroup} />
                        <span>Thể loại: {categories.map((cat) => cat.categoryName).join(', ')}</span>
                    </div>
                )}
            </div>

            {/* Authors */}
            <div className={cx('authors-section')}>
                <h3>
                    <FontAwesomeIcon icon={faBook} />
                    Tác giả
                </h3>
                {bookAuthors.length > 0 ? (
                    <div className={cx('authors-list')}>
                        {bookAuthors.map((author) => (
                            <div key={author.authorId} className={cx('author')}>
                                <Button
                                    text
                                    className={cx('author-name-btn')}
                                    onClick={() => navigate(`/authors/${author.authorId}`)}
                                >
                                    <strong>{author.authorName}</strong>
                                </Button>
                                {author.authorBio && <p>{author.authorBio}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Đang cập nhật thông tin tác giả</p>
                )}
            </div>

            {/* Rating */}
            <div className={cx('rating-section')}>
                <div className={cx('rating-stars')}>
                    {renderStars(averageRating)}
                    <span className={cx('rating-value')}>{averageRating.toFixed(1)}/5</span>
                </div>
                <span className={cx('reviews')}>({reviewCount || reviews.length} đánh giá)</span>
                <Button text className={cx('view-reviews-btn')} onClick={() => setActiveTab('reviews')}>
                    Xem đánh giá
                </Button>
            </div>

            {/* Price */}
            <div className={cx('price-section')}>
                <div className={cx('price')}>
                    <span className={cx('current-price')}>{(displayPrice / 1000).toLocaleString()}.000 đ</span>
                    {salePrice && price && salePrice < price && (
                        <>
                            <span className={cx('original-price')}>{(price / 1000).toLocaleString()}.000 đ</span>
                            <span className={cx('discount')}>-{discountPercent}%</span>
                        </>
                    )}
                </div>
            </div>

            {/* Book Details */}
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
                            <span>{new Date(publishedDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                    )}
                    {pages && (
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
                        <span>{weightG}g</span>
                    </div>
                </div>
            </div>

            {/* Quantity Selector */}
            <div className={cx('quantity-section')}>
                <label>Số lượng: </label>
                <QuantityInput value={quantity} onChange={setQuantity} min={1} max={stockQuantity} size="medium" />
                {isInCart && <p className={cx('cart-notice')}>Đã có {cartQuantity} sản phẩm trong giỏ hàng</p>}
            </div>

            {/* Stock Status */}
            <div className={cx('stock-section')}>
                <div
                    className={cx('stock-status', {
                        'in-stock': stockQuantity > 0,
                        'out-of-stock': stockQuantity === 0,
                    })}
                >
                    {stockQuantity > 0 ? (
                        <>
                            <FontAwesomeIcon icon={faTruck} />
                            <span>Còn hàng ({stockQuantity} sản phẩm)</span>
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faTruck} />
                            <span>Tạm hết hàng</span>
                        </>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className={cx('action-buttons')}>
                {isInCart ? (
                    <Button
                        shine
                        primary
                        large
                        onClick={handleUpdateCart}
                        disabled={stockQuantity === 0 || addingToCart}
                        className={cx('update-cart-btn')}
                    >
                        <FontAwesomeIcon icon={faShoppingCart} />
                        {addingToCart ? 'Đang cập nhật...' : 'Cập nhật giỏ hàng'}
                    </Button>
                ) : (
                    <Button
                        shine
                        primary
                        large
                        onClick={handleAddToCart}
                        disabled={stockQuantity === 0 || addingToCart}
                        className={cx('add-to-cart-btn')}
                    >
                        <FontAwesomeIcon icon={faShoppingCart} />
                        {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                    </Button>
                )}
                <Button
                    shine
                    outline
                    large
                    onClick={handleBuyNow}
                    disabled={stockQuantity === 0}
                    className={cx('buy-now-btn')}
                >
                    Mua ngay
                </Button>
            </div>
        </div>
    );
}

export default BookInfo;
