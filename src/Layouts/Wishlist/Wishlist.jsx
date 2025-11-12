import React from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Wishlist.module.scss';
import Button from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShoppingCart, faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useWishlist } from '../../contexts/Wishlist/WishlistContext';
import { useCart } from '../../contexts/Cart/CartContext';
import { useToast } from '../../contexts/Toast/ToastContext';

const cx = classNames.bind(styles);

function Wishlist() {
    const navigate = useNavigate();
    const { items: wishlistItems, removeFromWishlist, clearWishlist, getWishlistCount, moveToCart } = useWishlist();
    const { addToCart } = useCart();
    const { addToast } = useToast();

    const handleBack = () => {
        navigate(-1);
    };

    const handleRemoveItem = (productId, productName) => {
        const result = removeFromWishlist(productId);
        if (result.success) {
            addToast(`Đã xóa "${productName}" khỏi danh sách yêu thích`, 'info');
        }
    };

    const handleClearWishlist = () => {
        if (wishlistItems.length === 0) return;

        if (window.confirm('Bạn có chắc muốn xóa toàn bộ danh sách yêu thích?')) {
            const result = clearWishlist();
            if (result.success) {
                addToast('Đã xóa toàn bộ danh sách yêu thích', 'success');
            }
        }
    };

    const handleAddToCart = async (product) => {
        try {
            const result = await addToCart(product.productId, 1);
            if (result.success) {
                removeFromWishlist(product.productId);
                addToast(`Đã thêm "${product.productName}" vào giỏ hàng`, 'success');
            } else {
                addToast(result.error || 'Không thể thêm vào giỏ hàng', 'error');
            }
        } catch (error) {
            addToast('Có lỗi xảy ra khi thêm vào giỏ hàng', 'error');
        }
    };

    const handleViewProduct = (product) => {
        navigate(`/books/${product.productId}`, { state: { book: product } });
    };

    if (wishlistItems.length === 0) {
        return (
            <div className={cx('container')}>
                <div className={cx('header')}>
                    <Button shine outline back onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Button>
                    <h1>Danh sách yêu thích</h1>
                </div>

                <div className={cx('empty-wishlist')}>
                    <FontAwesomeIcon icon={faHeart} className={cx('empty-icon')} />
                    <h2>Danh sách yêu thích trống</h2>
                    <p>Bạn chưa có sản phẩm nào trong danh sách yêu thích</p>
                    <Button primary onClick={() => navigate('/books')}>
                        Khám phá sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('container')}>
            {/* Header */}
            <div className={cx('header')}>
                <Button shine outline back onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
                <h1>Danh sách yêu thích</h1>
                <div className={cx('header-actions')}>
                    <span className={cx('item-count')}>{getWishlistCount()} sản phẩm</span>
                    <Button outline onClick={handleClearWishlist}>
                        <FontAwesomeIcon icon={faTrash} />
                        Xóa tất cả
                    </Button>
                </div>
            </div>

            {/* Wishlist Items */}
            <div className={cx('wishlist-items')}>
                {wishlistItems.map((item) => (
                    <div key={item.productId} className={cx('wishlist-item')}>
                        <div className={cx('product-image')} onClick={() => handleViewProduct(item)}>
                            <img
                                src={item.productAssets?.[0]?.url || item.url || '/images/default-book.jpg'}
                                alt={item.productName}
                            />
                        </div>

                        <div className={cx('product-info')}>
                            <h3 className={cx('product-name')} onClick={() => handleViewProduct(item)}>
                                {item.productName}
                            </h3>

                            {item.bookAuthors && item.bookAuthors.length > 0 && (
                                <p className={cx('author')}>
                                    Tác giả: {item.bookAuthors.map((a) => a.authorName).join(', ')}
                                </p>
                            )}

                            <div className={cx('price')}>
                                <span className={cx('current-price')}>
                                    {((item.salePrice || item.price) / 1000).toLocaleString()}.000 đ
                                </span>
                                {item.salePrice && item.price && item.salePrice < item.price && (
                                    <span className={cx('original-price')}>
                                        {(item.price / 1000).toLocaleString()}.000 đ
                                    </span>
                                )}
                            </div>

                            <div className={cx('stock-status')}>
                                {item.stockQuantity > 0 ? (
                                    <span className={cx('in-stock')}>Còn hàng</span>
                                ) : (
                                    <span className={cx('out-of-stock')}>Hết hàng</span>
                                )}
                            </div>
                        </div>

                        <div className={cx('product-actions')}>
                            <Button
                                primary
                                onClick={() => handleAddToCart(item)}
                                disabled={item.stockQuantity === 0}
                                className={cx('add-to-cart-btn')}
                            >
                                <FontAwesomeIcon icon={faShoppingCart} />
                                Thêm vào giỏ
                            </Button>
                            <Button
                                outline
                                onClick={() => handleRemoveItem(item.productId, item.productName)}
                                className={cx('remove-btn')}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                Xóa
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Actions */}
            <div className={cx('footer-actions')}>
                <Button primary onClick={() => navigate('/books')}>
                    Tiếp tục mua sắm
                </Button>
                <Button outline onClick={handleClearWishlist}>
                    <FontAwesomeIcon icon={faTrash} />
                    Xóa tất cả
                </Button>
            </div>
        </div>
    );
}

export default Wishlist;
