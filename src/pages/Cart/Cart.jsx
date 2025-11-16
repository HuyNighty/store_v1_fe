import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Cart.module.scss';
import Button from '../../Layouts/components/Button';
import QuantityInput from '../../Layouts/components/QuantityInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrash, faShoppingBag, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../contexts/Cart/CartContext';
import { useToast } from '../../contexts/Toast/ToastContext';

const cx = classNames.bind(styles);

function Cart() {
    const navigate = useNavigate();
    const {
        cartItems,
        loading,
        error,
        updateCartItem,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems,
        fetchCartItems,
    } = useCart();
    const { addToast } = useToast();

    const [isProcessing, setIsProcessing] = useState(false);
    const processingRef = useRef(false);

    const handleBack = () => {
        navigate(-1);
    };

    const handleContinueShopping = () => {
        navigate('/books');
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleViewProductDetails = (item) => {
        if (processingRef.current) return;

        console.log('Viewing product details:', item.productName);

        navigate('/book-item', {
            state: {
                book: {
                    productId: item.productId,
                    productName: item.productName,
                    productAssets: item.url ? [{ url: item.url }] : [],
                    featured: item.featured,
                    bookAuthors: item.authorName ? [{ authorName: item.authorName }] : [],
                    salePrice: item.salePrice,
                    price: item.unitPrice || item.price,
                    rating: item.rating,
                    reviews: item.reviews,
                    stockQuantity: item.stockQuantity,
                    weightG: item.weightG,
                    sku: item.sku,
                    slug: item.slug,
                    imageUrl: item.url,
                    description: item.description,
                    category: item.category,
                    publisher: item.publisher,
                    publishedDate: item.publishedDate,
                    pages: item.pages,
                    language: item.language,
                    isbn: item.isbn,
                },
            },
        });
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        if (processingRef.current) {
            addToast('Đang xử lý, vui lòng đợi...', 'warning', 1500);
            return;
        }

        processingRef.current = true;
        setIsProcessing(true);

        try {
            console.log('Updating quantity:', productId, newQuantity);
            if (newQuantity === 0) {
                await removeFromCart(productId);
                addToast('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
            } else {
                await updateCartItem(productId, newQuantity);
                addToast('Đã cập nhật số lượng sản phẩm', 'success');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            addToast('Có lỗi xảy ra khi cập nhật giỏ hàng', 'error');
        } finally {
            setTimeout(() => {
                processingRef.current = false;
                setIsProcessing(false);
            }, 500);
        }
    };

    const handleRemoveItem = async (productId, productName) => {
        if (processingRef.current) {
            addToast('Đang xử lý, vui lòng đợi...', 'warning', 1500);
            return;
        }

        console.log('Showing remove confirmation for:', productName);
        addToast(`Xác nhận xóa "${productName}"?`, 'warning', 4000, () => {
            console.log('Confirm remove called for:', productName);
            confirmRemove(productId, productName);
        });
    };

    const confirmRemove = async (productId, productName) => {
        if (processingRef.current) return;

        processingRef.current = true;
        setIsProcessing(true);

        try {
            console.log('Removing item:', productId);
            await removeFromCart(productId);
            addToast(`Đã xóa "${productName}" khỏi giỏ hàng`, 'success');
        } catch (error) {
            console.error('Error removing item:', error);
            addToast('Có lỗi xảy ra khi xóa sản phẩm', 'error');
        } finally {
            setTimeout(() => {
                processingRef.current = false;
                setIsProcessing(false);
            }, 500);
        }
    };

    const handleClearCart = async () => {
        if (processingRef.current) {
            addToast('Đang xử lý, vui lòng đợi...', 'warning', 1500);
            return;
        }

        if (cartItems.length === 0) {
            addToast('Giỏ hàng đã trống', 'info');
            return;
        }

        console.log('Showing clear cart confirmation');
        addToast(`Xác nhận xóa ${cartItems.length} sản phẩm?`, 'warning', 4000, () => {
            console.log('Confirm clear cart called');
            confirmClearCart();
        });
    };

    const confirmClearCart = async () => {
        if (processingRef.current) return;

        processingRef.current = true;
        setIsProcessing(true);

        try {
            console.log('Clearing entire cart');
            await clearCart();
            addToast('Đã xóa toàn bộ giỏ hàng', 'success');
        } catch (error) {
            console.error('Error clearing cart:', error);
            addToast('Có lỗi xảy ra khi xóa giỏ hàng', 'error');
        } finally {
            setTimeout(() => {
                processingRef.current = false;
                setIsProcessing(false);
            }, 500);
        }
    };

    const handleRetry = () => {
        fetchCartItems();
    };

    const formatPrice = (price) => {
        if (typeof price !== 'number' || isNaN(price)) {
            return '0';
        }
        return (price / 1000).toLocaleString();
    };

    if (loading) {
        return (
            <div className={cx('container')}>
                <div className={cx('header')}>
                    <Button back onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Button>
                    <h1>Giỏ hàng</h1>
                </div>
                <div className={cx('loading')}>
                    <div className={cx('spinner')}></div>
                    <p>Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cx('container')}>
                <div className={cx('header')}>
                    <Button back onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Button>
                    <h1>Giỏ hàng</h1>
                </div>
                <div className={cx('error-state')}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className={cx('error-icon')} />
                    <h2>Đã có lỗi xảy ra</h2>
                    <p>{error}</p>
                    <Button primary onClick={handleRetry}>
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className={cx('container')}>
                <div className={cx('header')}>
                    <Button back onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Button>
                    <h1>Giỏ hàng</h1>
                </div>

                <div className={cx('empty-cart')}>
                    <FontAwesomeIcon icon={faShoppingBag} className={cx('empty-icon')} />
                    <h2>Giỏ hàng của bạn đang trống</h2>
                    <p>Hãy thêm một vài sản phẩm để bắt đầu mua sắm!</p>
                    <Button primary large onClick={handleContinueShopping}>
                        Tiếp tục mua sắm
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('container')}>
            <div className={cx('header')}>
                <Button back onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
                <h1>Giỏ hàng ({getTotalItems()} sản phẩm)</h1>
                <Button
                    outline
                    onClick={handleClearCart}
                    className={cx('clear-cart-btn')}
                    disabled={isProcessing || cartItems.length === 0}
                >
                    <FontAwesomeIcon icon={faTrash} />
                    {isProcessing ? 'Đang xử lý...' : 'Xóa tất cả'}
                </Button>
            </div>

            <div className={cx('content')}>
                <div className={cx('cart-items')}>
                    {cartItems.map((item) => {
                        if (!item || !item.productId) {
                            console.warn('Invalid cart item:', item);
                            return null;
                        }

                        const displayPrice = item.unitPrice || item.price || 0;
                        const mainImage = item.url || '/images/default-book.jpg';
                        const authorName = item.authorName || 'Đang cập nhật';
                        const stockQuantity = item.stockQuantity || 0;
                        const isOnSale = item.salePrice && item.price && item.salePrice < item.price;

                        return (
                            <div
                                key={item.cartItemId || item.productId}
                                className={cx('cart-item')}
                                onClick={(e) => {
                                    if (
                                        !e.target.closest(`.${cx('item-controls')}`) &&
                                        !e.target.closest(`.${cx('remove-btn')}`) &&
                                        !e.target.closest(`.${cx('quantity-input')}`)
                                    ) {
                                        handleViewProductDetails(item);
                                    }
                                }}
                            >
                                <div className={cx('item-image')}>
                                    <img
                                        src={mainImage}
                                        alt={item.productName}
                                        onError={(e) => {
                                            e.target.src = '/images/default-book.jpg';
                                        }}
                                    />
                                    {item.featured && <span className={cx('featured-badge')}>Nổi bật</span>}
                                </div>

                                <div className={cx('item-details')}>
                                    <h3 className={cx('item-name')}>{item.productName}</h3>
                                    <p className={cx('item-author')}>Tác giả: {authorName}</p>

                                    <div className={cx('price-section')}>
                                        <p className={cx('item-price')}>{formatPrice(displayPrice)}.000 đ</p>
                                        {isOnSale && (
                                            <p className={cx('item-original-price')}>{formatPrice(item.price)}.000 đ</p>
                                        )}
                                    </div>

                                    {stockQuantity <= 10 && stockQuantity > 0 && (
                                        <p className={cx('stock-warning')}>Chỉ còn {stockQuantity} sản phẩm</p>
                                    )}
                                    {stockQuantity === 0 && <p className={cx('out-of-stock')}>Hết hàng</p>}
                                </div>

                                <div className={cx('item-controls')}>
                                    <div className={cx('quantity-section')}>
                                        <label>Số lượng:</label>
                                        <QuantityInput
                                            value={item.quantity}
                                            onChange={(newQuantity) =>
                                                handleQuantityChange(item.productId, newQuantity)
                                            }
                                            min={0}
                                            max={Math.min(stockQuantity, 99)}
                                            size="small"
                                            disabled={stockQuantity === 0 || isProcessing}
                                        />
                                    </div>

                                    <div className={cx('item-total')}>
                                        <span className={cx('total-label')}>Thành tiền:</span>
                                        <span className={cx('total-price')}>
                                            {formatPrice(displayPrice * item.quantity)}.000 đ
                                        </span>
                                    </div>

                                    <div className={cx('control-buttons')}>
                                        <Button
                                            icon
                                            onClick={() => handleRemoveItem(item.productId, item.productName)}
                                            className={cx('remove-btn')}
                                            title="Xóa sản phẩm"
                                            disabled={isProcessing}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={cx('order-summary')}>
                    <h3>Tóm tắt đơn hàng</h3>

                    <div className={cx('summary-content')}>
                        <div className={cx('summary-row')}>
                            <span>Tạm tính:</span>
                            <span>{formatPrice(getTotalPrice())}.000 đ</span>
                        </div>

                        <div className={cx('summary-row')}>
                            <span>Phí vận chuyển:</span>
                            <span className={cx('free-shipping')}>Miễn phí</span>
                        </div>

                        <div className={cx('summary-row', 'discount-row')}>
                            <span>Giảm giá:</span>
                            <span>0 đ</span>
                        </div>

                        <div className={cx('summary-row', 'total')}>
                            <span>Tổng cộng:</span>
                            <span className={cx('final-price')}>{formatPrice(getTotalPrice())}.000 đ</span>
                        </div>

                        <div className={cx('shipping-note')}>
                            <p>🎉 Miễn phí vận chuyển cho đơn hàng từ 300.000đ</p>
                        </div>

                        <Button
                            primary
                            large
                            onClick={handleCheckout}
                            className={cx('checkout-btn')}
                            disabled={cartItems.length === 0 || isProcessing}
                        >
                            {isProcessing ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                        </Button>

                        <Button
                            outline
                            onClick={handleContinueShopping}
                            className={cx('continue-btn')}
                            disabled={isProcessing}
                        >
                            Tiếp tục mua sắm
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
