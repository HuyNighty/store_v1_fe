import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './BookItemDetail.module.scss';
import Button from '../../Layouts/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingCart, faHeart, faShare } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function BookItemDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { book } = location.state || {};

    // Nếu không có dữ liệu book, chuyển hướng về trang chủ
    if (!book) {
        return (
            <div className={cx('container')}>
                <div className={cx('error')}>
                    <h2>Không tìm thấy thông tin sách</h2>
                    <Button primary onClick={() => navigate('/')}>
                        Quay về trang chủ
                    </Button>
                </div>
            </div>
        );
    }

    const {
        productId,
        productName,
        productAssets = [],
        featured,
        bookAuthors = [],
        salePrice,
        price,
        rating = 0,
        reviews = 0,
        stockQuantity = 0,
        weightG = 0,
        imageUrl,
    } = book;

    const displayPrice = salePrice ?? price;
    const mainImage = productAssets[0]?.url || imageUrl || '/images/default-book.jpg';
    const additionalImages = productAssets.slice(1);

    const handleBack = () => {
        navigate(-1);
    };

    const handleAddToCart = () => {
        console.log('Thêm vào giỏ hàng:', productId);
        alert('Đã thêm vào giỏ hàng!');
    };

    const handleBuyNow = () => {
        // Logic mua ngay
        console.log('Mua ngay:', productId);
        alert('Chuyển đến trang thanh toán!');
    };

    return (
        <div className={cx('container')}>
            {/* Header */}
            <div className={cx('header')}>
                <Button back onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
                <h1>Chi tiết sách</h1>
            </div>

            {/* Main Content */}
            <div className={cx('content')}>
                {/* Images Section */}
                <div className={cx('images-section')}>
                    <div className={cx('main-image')}>
                        <img src={mainImage} alt={productName} />
                        {featured && <span className={cx('featured-badge')}>Nổi bật</span>}
                    </div>
                    <div className={cx('thumbnail-images')}>
                        {additionalImages.map((asset, index) => (
                            <img
                                key={index}
                                src={asset.url}
                                alt={`${productName} ${index + 1}`}
                                className={cx('thumbnail')}
                            />
                        ))}
                    </div>
                </div>

                {/* Product Info Section */}
                <div className={cx('info-section')}>
                    {/* Authors */}
                    <div className={cx('authors-section')}>
                        <h3>Tác giả</h3>
                        {bookAuthors.length > 0 ? (
                            <div className={cx('authors-list')}>
                                {bookAuthors.map((author) => (
                                    <div key={author.authorId} className={cx('author')}>
                                        <strong>{author.authorName}</strong>
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
                        <div className={cx('rating')}>
                            <span className={cx('stars')}>{'⭐'.repeat(Math.floor(rating))}</span>
                            <span className={cx('rating-value')}>{rating}/5</span>
                        </div>
                        <span className={cx('reviews')}>({reviews} đánh giá)</span>
                    </div>

                    {/* Price */}
                    <div className={cx('price-section')}>
                        <div className={cx('price')}>
                            <span className={cx('current-price')}>{(displayPrice / 1000).toLocaleString()}.000 đ</span>
                            {salePrice && price && salePrice < price && (
                                <span className={cx('original-price')}>{(price / 1000).toLocaleString()}.000 đ</span>
                            )}
                        </div>
                        {salePrice && price && salePrice < price && (
                            <span className={cx('discount')}>-{Math.round((1 - salePrice / price) * 100)}%</span>
                        )}
                    </div>

                    {/* Stock & Weight */}
                    <div className={cx('details-section')}>
                        <div className={cx('detail-item')}>
                            <div>Tồn kho:</div>
                            <span className={cx(stockQuantity > 0 ? 'in-stock' : 'out-of-stock')}>
                                {stockQuantity > 0 ? `${stockQuantity} sản phẩm` : 'Hết hàng'}
                            </span>
                        </div>
                        <div className={cx('detail-item')}>
                            <div>Trọng lượng:</div>
                            <span>{weightG}g</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={cx('action-buttons')}>
                        <Button
                            primary
                            large
                            onClick={handleAddToCart}
                            disabled={stockQuantity === 0}
                            className={cx('add-to-cart-btn')}
                        >
                            <FontAwesomeIcon icon={faShoppingCart} />
                            Thêm vào giỏ hàng
                        </Button>
                        <Button
                            outline
                            large
                            onClick={handleBuyNow}
                            disabled={stockQuantity === 0}
                            className={cx('buy-now-btn')}
                        >
                            Mua ngay
                        </Button>
                        <div className={cx('secondary-actions')}>
                            <Button icon className={cx('wishlist-btn')}>
                                <FontAwesomeIcon icon={faHeart} />
                            </Button>
                            <Button icon className={cx('share-btn')}>
                                <FontAwesomeIcon icon={faShare} />
                            </Button>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className={cx('additional-info')}>
                        <div className={cx('info-tabs')}>
                            <h3>Mô tả sản phẩm</h3>
                            <p>Thông tin chi tiết về cuốn sách "{productName}" sẽ được cập nhật sớm nhất.</p>
                        </div>
                        <div className={cx('info-tabs')}>
                            <h3>Thông tin vận chuyển</h3>
                            <ul>
                                <li>Miễn phí vận chuyển cho đơn hàng từ 300.000đ</li>
                                <li>Giao hàng trong 2-4 ngày làm việc</li>
                                <li>Đổi trả trong 7 ngày</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookItemDetail;
