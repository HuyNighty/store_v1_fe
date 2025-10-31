import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './BookItemDetail.module.scss';
import Button from '../../Layouts/components/Button';
import QuantityInput from '../../Layouts/components/QuantityInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faShoppingCart,
    faHeart,
    faShare,
    faStar,
    faStarHalfAlt,
    faTruck,
    faBook,
    faTags,
    faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/Toast/ToastContext';
import { useWishlist } from '../../contexts/WishlistContext';

const cx = classNames.bind(styles);

function BookItemDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { book } = location.state || {};
    const { addToCart, isItemInCart, getItemQuantity, updateCartItem } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToast } = useToast();
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        if (book) {
            setIsWishlisted(isInWishlist(book.productId));
        }
    }, [book, isInWishlist]);

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
        reviews = [],
        reviewCount = 0,
        stockQuantity = 0,
        weightG = 0,
        description,
        categories = [],
        sku,
        slug,
        publishedDate,
        publisher,
        pages,
        language,
        isbn,
    } = book;

    const displayPrice = salePrice ?? price;
    const discountPercent = salePrice && price ? Math.round((1 - salePrice / price) * 100) : 0;
    const allImages = productAssets.length > 0 ? productAssets : [{ url: '/images/default-book.jpg' }];
    const mainImage = allImages[selectedImage]?.url;
    const isInCart = isItemInCart(productId);
    const cartQuantity = getItemQuantity(productId);

    // Render rating stars
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FontAwesomeIcon key={i} icon={faStar} className={cx('star', 'filled')} />);
        }

        if (hasHalfStar) {
            stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className={cx('star', 'filled')} />);
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className={cx('star', 'empty')} />);
        }

        return stars;
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleAddToCart = async () => {
        if (stockQuantity === 0) {
            addToast('Sản phẩm đã hết hàng', 'error');
            return;
        }

        setAddingToCart(true);
        try {
            const result = await addToCart(productId, quantity);
            if (result.success) {
                addToast(result.message || 'Đã thêm vào giỏ hàng!', 'success');
            } else {
                addToast(result.error || 'Thêm vào giỏ hàng thất bại', 'error');
            }
        } catch (error) {
            addToast('Có lỗi xảy ra khi thêm vào giỏ hàng', 'error');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleUpdateCart = async () => {
        setAddingToCart(true);
        try {
            const newTotalQuantity = cartQuantity + quantity;
            const result = await updateCartItem(productId, newTotalQuantity);

            if (result.success) {
                addToast(result.message || 'Đã cập nhật giỏ hàng!', 'success');
                setQuantity(1);
            } else {
                addToast(result.error || 'Cập nhật giỏ hàng thất bại', 'error');
            }
        } catch (error) {
            addToast('Có lỗi xảy ra khi cập nhật giỏ hàng', 'error');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        if (stockQuantity === 0) {
            addToast('Sản phẩm đã hết hàng', 'error');
            return;
        }

        // Thêm vào giỏ hàng trước rồi chuyển đến checkout
        addToCart(productId, quantity).then(() => {
            navigate('/checkout');
        });
    };

    const handleWishlistToggle = () => {
        if (isWishlisted) {
            removeFromWishlist(productId);
            setIsWishlisted(false);
            addToast('Đã xóa khỏi danh sách yêu thích', 'info');
        } else {
            addToWishlist(book);
            setIsWishlisted(true);
            addToast('Đã thêm vào danh sách yêu thích', 'success');
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: productName,
                text: description || `Khám phá cuốn sách "${productName}"`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            addToast('Đã sao chép link chia sẻ', 'success');
        }
    };

    const averageRating =
        reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : rating;

    return (
        <div className={cx('container')}>
            {/* Header */}
            <div className={cx('header')}>
                <Button shine outline back onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
                <h1>Chi tiết sách</h1>
            </div>

            {/* Breadcrumb */}
            <div className={cx('breadcrumb')}>
                <span onClick={() => navigate('/')}>Trang chủ</span>
                <span>/</span>
                <span onClick={() => navigate('/books')}>Sách</span>
                <span>/</span>
                <span className={cx('current')}>{productName}</span>
            </div>

            {/* Main Content */}
            <div className={cx('content')}>
                {/* Images Section */}
                <div className={cx('images-section')}>
                    <div className={cx('main-image')}>
                        <img src={mainImage} alt={productName} />
                        {featured && <span className={cx('featured-badge')}>Nổi bật</span>}
                        {discountPercent > 0 && <span className={cx('discount-badge')}>-{discountPercent}%</span>}
                    </div>
                    <div className={cx('thumbnail-images')}>
                        {allImages.map((asset, index) => (
                            <div
                                key={index}
                                className={cx('thumbnail-container', { active: selectedImage === index })}
                                onClick={() => setSelectedImage(index)}
                            >
                                <img src={asset.url} alt={`${productName} ${index + 1}`} className={cx('thumbnail')} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Info Section */}
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
                                    <span className={cx('original-price')}>
                                        {(price / 1000).toLocaleString()}.000 đ
                                    </span>
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
                        <QuantityInput
                            value={quantity}
                            onChange={setQuantity}
                            min={1}
                            max={stockQuantity}
                            size="medium"
                        />
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
                        <div className={cx('secondary-actions')}>
                            <Button
                                icon
                                className={cx('wishlist-btn', { active: isWishlisted })}
                                onClick={handleWishlistToggle}
                            >
                                <FontAwesomeIcon icon={isWishlisted ? faHeart : faHeartRegular} />
                            </Button>
                            <Button icon className={cx('share-btn')} onClick={handleShare}>
                                <FontAwesomeIcon icon={faShare} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info Tabs */}
            <div className={cx('tabs-section')}>
                <div className={cx('tabs-header')}>
                    <button
                        className={cx('tab', { active: activeTab === 'description' })}
                        onClick={() => setActiveTab('description')}
                    >
                        Mô tả sản phẩm
                    </button>
                    <button
                        className={cx('tab', { active: activeTab === 'details' })}
                        onClick={() => setActiveTab('details')}
                    >
                        Thông tin chi tiết
                    </button>
                    <button
                        className={cx('tab', { active: activeTab === 'reviews' })}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Đánh giá ({reviewCount || reviews.length})
                    </button>
                    <button
                        className={cx('tab', { active: activeTab === 'shipping' })}
                        onClick={() => setActiveTab('shipping')}
                    >
                        Vận chuyển & Trả hàng
                    </button>
                </div>

                <div className={cx('tabs-content')}>
                    {activeTab === 'description' && (
                        <div className={cx('tab-panel')}>
                            <h3>Giới thiệu về "{productName}"</h3>
                            <p>
                                {description ||
                                    `Cuốn sách "${productName}" là một tác phẩm đáng chú ý trong thể loại này. Thông tin chi tiết về nội dung sẽ được cập nhật sớm nhất.`}
                            </p>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className={cx('tab-panel')}>
                            <h3>Thông số kỹ thuật</h3>
                            <div className={cx('specs-grid')}>
                                <div className={cx('spec-item')}>
                                    <strong>Tên sản phẩm:</strong>
                                    <span>{productName}</span>
                                </div>
                                <div className={cx('spec-item')}>
                                    <strong>SKU:</strong>
                                    <span>{sku || 'N/A'}</span>
                                </div>
                                <div className={cx('spec-item')}>
                                    <strong>Tác giả:</strong>
                                    <span>{bookAuthors.map((a) => a.authorName).join(', ') || 'Đang cập nhật'}</span>
                                </div>
                                {publisher && (
                                    <div className={cx('spec-item')}>
                                        <strong>Nhà xuất bản:</strong>
                                        <span>{publisher}</span>
                                    </div>
                                )}
                                {publishedDate && (
                                    <div className={cx('spec-item')}>
                                        <strong>Ngày xuất bản:</strong>
                                        <span>{new Date(publishedDate).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                )}
                                {pages && (
                                    <div className={cx('spec-item')}>
                                        <strong>Số trang:</strong>
                                        <span>{pages}</span>
                                    </div>
                                )}
                                {language && (
                                    <div className={cx('spec-item')}>
                                        <strong>Ngôn ngữ:</strong>
                                        <span>{language}</span>
                                    </div>
                                )}
                                {isbn && (
                                    <div className={cx('spec-item')}>
                                        <strong>ISBN:</strong>
                                        <span>{isbn}</span>
                                    </div>
                                )}
                                <div className={cx('spec-item')}>
                                    <strong>Trọng lượng:</strong>
                                    <span>{weightG}g</span>
                                </div>
                                <div className={cx('spec-item')}>
                                    <strong>Tình trạng:</strong>
                                    <span>{stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className={cx('tab-panel')}>
                            <h3>Đánh giá từ độc giả</h3>
                            {reviews.length > 0 ? (
                                <div className={cx('reviews-list')}>
                                    {reviews.map((review, index) => (
                                        <div key={index} className={cx('review-item')}>
                                            <div className={cx('review-header')}>
                                                <div className={cx('reviewer')}>{review.userName || 'Độc giả'}</div>
                                                <div className={cx('review-rating')}>{renderStars(review.rating)}</div>
                                                <div className={cx('review-date')}>
                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                            <div className={cx('review-content')}>
                                                <p>{review.comment}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className={cx('tab-panel')}>
                            <h3>Chính sách vận chuyển & Trả hàng</h3>
                            <div className={cx('shipping-info')}>
                                <h4>🚚 Vận chuyển</h4>
                                <ul>
                                    <li>Miễn phí vận chuyển cho đơn hàng từ 300.000đ</li>
                                    <li>Phí vận chuyển 20.000đ cho đơn hàng dưới 300.000đ</li>
                                    <li>Giao hàng toàn quốc trong 2-4 ngày làm việc</li>
                                    <li>Hỗ trợ giao hàng nhanh trong 24h (tính phí)</li>
                                </ul>

                                <h4>🔄 Đổi trả</h4>
                                <ul>
                                    <li>Đổi trả trong vòng 7 ngày kể từ khi nhận hàng</li>
                                    <li>Sách phải còn nguyên vẹn, không bị rách, bẩn</li>
                                    <li>Miễn phí đổi trả do lỗi từ nhà sản xuất</li>
                                    <li>Liên hệ hotline: 1800-xxxx để được hỗ trợ</li>
                                </ul>

                                <h4>🛡️ Bảo hành</h4>
                                <ul>
                                    <li>Bảo hành chất lượng in ấn: 30 ngày</li>
                                    <li>Đảm bảo sách chính hãng, không phải sách lậu</li>
                                    <li>Hoàn tiền 100% nếu phát hiện sách giả</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products Section - Có thể thêm sau */}
            {/* <RelatedProducts currentProductId={productId} categoryId={categories[0]?.categoryId} /> */}
        </div>
    );
}

export default BookItemDetail;
