// src/pages/Checkout/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Checkout.module.scss';
import Button from '../../Layouts/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCreditCard, faTruck, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/Toast/ToastContext';
import orderApi from '../../api/orderApi';

const cx = classNames.bind(styles);

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, getTotalPrice, getTotalItems, clearCart } = useCart();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shippingAddress: '',
        note: '',
        paymentMethod: 'COD', // Mặc định thanh toán khi nhận hàng
    });

    // Payment methods
    const paymentMethods = [
        { value: 'COD', label: 'Thanh toán khi nhận hàng (COD)', icon: faTruck },
        { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng', icon: faCreditCard },
        { value: 'CREDIT_CARD', label: 'Thẻ tín dụng/Ghi nợ', icon: faCreditCard },
    ];

    useEffect(() => {
        // Redirect nếu giỏ hàng trống
        if (cartItems.length === 0) {
            addToast('Giỏ hàng trống, vui lòng thêm sản phẩm', 'warning');
            navigate('/cart');
        }
    }, [cartItems, navigate, addToast]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePaymentMethodChange = (method) => {
        setFormData((prev) => ({
            ...prev,
            paymentMethod: method,
        }));
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        if (!formData.shippingAddress.trim()) {
            addToast('Vui lòng nhập địa chỉ giao hàng', 'error');
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                shippingAddress: formData.shippingAddress,
                note: formData.note,
                paymentMethod: formData.paymentMethod,
            };

            console.log('Submitting order:', orderData);

            const response = await orderApi.checkout(orderData);
            console.log('Order created:', response.data);

            // Xóa giỏ hàng sau khi đặt hàng thành công
            await clearCart();

            addToast('Đặt hàng thành công!', 'success');

            // Chuyển hướng đến trang xác nhận đơn hàng
            navigate('/order-success', {
                state: {
                    order: response.data.result,
                    orderNumber: response.data.result.orderNumber,
                },
            });
        } catch (error) {
            console.error('Error creating order:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng';
            addToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Format price function
    const formatPrice = (price) => {
        if (typeof price !== 'number' || isNaN(price)) {
            return '0';
        }
        return (price / 1000).toLocaleString();
    };

    const totalPrice = getTotalPrice();
    const shippingCost = totalPrice >= 300000 ? 0 : 30000; // Miễn phí ship từ 300k
    const finalTotal = totalPrice + shippingCost;

    return (
        <div className={cx('container')}>
            {/* Header */}
            <div className={cx('header')}>
                <Button back onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
                <h1>Thanh toán</h1>
            </div>

            <div className={cx('content')}>
                <form onSubmit={handleSubmitOrder} className={cx('checkout-form')}>
                    {/* Thông tin giao hàng */}
                    <div className={cx('section')}>
                        <h2 className={cx('section-title')}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            Thông tin giao hàng
                        </h2>

                        <div className={cx('form-group')}>
                            <label htmlFor="shippingAddress">Địa chỉ giao hàng *</label>
                            <textarea
                                id="shippingAddress"
                                name="shippingAddress"
                                value={formData.shippingAddress}
                                onChange={handleInputChange}
                                placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                                rows="3"
                                required
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="note">Ghi chú (tùy chọn)</label>
                            <textarea
                                id="note"
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                placeholder="Ghi chú về đơn hàng, thời gian giao hàng, v.v..."
                                rows="2"
                            />
                        </div>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className={cx('section')}>
                        <h2 className={cx('section-title')}>
                            <FontAwesomeIcon icon={faCreditCard} />
                            Phương thức thanh toán
                        </h2>

                        <div className={cx('payment-methods')}>
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.value}
                                    className={cx('payment-method', {
                                        active: formData.paymentMethod === method.value,
                                    })}
                                    onClick={() => handlePaymentMethodChange(method.value)}
                                >
                                    <div className={cx('method-radio')}>
                                        <div className={cx('radio-dot')} />
                                    </div>
                                    <FontAwesomeIcon icon={method.icon} className={cx('method-icon')} />
                                    <span className={cx('method-label')}>{method.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tóm tắt đơn hàng */}
                    <div className={cx('section')}>
                        <h2 className={cx('section-title')}>Tóm tắt đơn hàng</h2>

                        <div className={cx('order-summary')}>
                            <div className={cx('order-items')}>
                                {cartItems.map((item) => (
                                    <div key={item.productId} className={cx('order-item')}>
                                        <img
                                            src={item.url || '/images/default-book.jpg'}
                                            alt={item.productName}
                                            className={cx('item-image')}
                                        />
                                        <div className={cx('item-details')}>
                                            <h4>{item.productName}</h4>
                                            <p>Số lượng: {item.quantity}</p>
                                            <p className={cx('item-price')}>
                                                {formatPrice((item.unitPrice || item.price) * item.quantity)}.000 đ
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={cx('summary-totals')}>
                                <div className={cx('summary-row')}>
                                    <span>Tạm tính:</span>
                                    <span>{formatPrice(totalPrice)}.000 đ</span>
                                </div>

                                <div className={cx('summary-row')}>
                                    <span>Phí vận chuyển:</span>
                                    <span className={cx(shippingCost === 0 ? 'free' : 'cost')}>
                                        {shippingCost === 0 ? 'Miễn phí' : `${formatPrice(shippingCost)}.000 đ`}
                                    </span>
                                </div>

                                {shippingCost > 0 && (
                                    <div className={cx('shipping-note')}>
                                        <p>
                                            🛒 Mua thêm {formatPrice(300000 - totalPrice)}.000 đ để được miễn phí vận
                                            chuyển
                                        </p>
                                    </div>
                                )}

                                <div className={cx('summary-row', 'total')}>
                                    <span>Tổng cộng:</span>
                                    <span className={cx('final-total')}>{formatPrice(finalTotal)}.000 đ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nút đặt hàng */}
                    <div className={cx('checkout-actions')}>
                        <Button
                            shine
                            type="submit"
                            primary
                            large
                            className={cx('submit-btn')}
                            disabled={loading || cartItems.length === 0}
                        >
                            {loading ? (
                                <>
                                    <div className={cx('spinner')}></div>
                                    Đang xử lý...
                                </>
                            ) : (
                                `Đặt hàng - ${formatPrice(finalTotal)}.000 đ`
                            )}
                        </Button>

                        <Button shine type="button" outline onClick={handleBack} disabled={loading}>
                            Quay lại giỏ hàng
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Checkout;
