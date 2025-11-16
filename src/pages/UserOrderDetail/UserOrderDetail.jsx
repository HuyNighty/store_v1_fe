import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './UserOrderDetail.module.scss';
import orderApi from '../../api/orderApi';
import { useToast } from '../../contexts/Toast/ToastContext';
import OrderStatus from '../../components/OrderStatus/OrderStatus';
import Button from '../../Layouts/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faUser,
    faMapMarkerAlt,
    faBox,
    faCreditCard,
    faPhone,
    faEnvelope,
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function UserOrderDetail() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async () => {
        try {
            const response = await orderApi.getOrderDetailsUser(orderId);
            setOrder(response.data.result);
        } catch (error) {
            console.error('Error fetching order details:', error);
            addToast('Lỗi khi tải chi tiết đơn hàng', 'error');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price) return '0';
        return (price / 1000).toLocaleString();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleCancelOrder = async () => {
        if (!order) return;

        if (!window.confirm(`Bạn có chắc muốn hủy đơn hàng #${order.orderNumber}?`)) {
            return;
        }

        setCancelling(true);
        try {
            await orderApi.cancelOrder(order.orderId);
            addToast('Đã hủy đơn hàng thành công', 'success');
            fetchOrderDetail();
        } catch (error) {
            console.error('Error cancelling order:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi khi hủy đơn hàng';
            addToast(errorMessage, 'error');
        } finally {
            setCancelling(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (!order) return;

        if (!window.confirm(`Bạn có chắc muốn xóa đơn hàng #${order.orderNumber}? Hành động này không thể hoàn tác.`)) {
            return;
        }

        try {
            await orderApi.deleteOrder(order.orderId);
            addToast('Đã xóa đơn hàng thành công', 'success');
            navigate('/orders');
        } catch (error) {
            console.error('Error deleting order:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi khi xóa đơn hàng';
            addToast(errorMessage, 'error');
        }
    };

    const handleContactSupport = () => {
        addToast('Đã gửi yêu cầu hỗ trợ', 'info');
    };

    const getPaymentMethodLabel = (method) => {
        const methods = {
            COD: 'Thanh toán khi nhận hàng',
            BANK_TRANSFER: 'Chuyển khoản ngân hàng',
            CREDIT_CARD: 'Thẻ tín dụng/Ghi nợ',
        };
        return methods[method] || method;
    };

    const canCancel = order?.statusOrder === 'PENDING' || order?.statusOrder === 'PAID';
    const canDelete = order?.statusOrder === 'CANCELLED';
    const canConfirmReceived = order?.statusOrder === 'DELIVERED';

    if (loading) {
        return (
            <div className={cx('container')}>
                <div className={cx('loading')}>
                    <div className={cx('spinner')}></div>
                    <p>Đang tải chi tiết đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className={cx('container')}>
                <div className={cx('not-found')}>
                    <h2>Không tìm thấy đơn hàng</h2>
                    <p>Đơn hàng không tồn tại hoặc bạn không có quyền xem</p>
                    <Button primary onClick={() => navigate('/orders')}>
                        Quay lại danh sách đơn hàng
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('container')}>
            <div className={cx('header')}>
                <div className={cx('header-main')}>
                    <Button back onClick={() => navigate('/orders')}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Button>
                    <div className={cx('header-content')}>
                        <div className={cx('order-meta')}>
                            <OrderStatus status={order.statusOrder} />
                            <span className={cx('order-date')}>Đặt ngày: {formatDate(order.createdAt)}</span>
                        </div>
                    </div>
                </div>

                <div className={cx('header-actions')}>
                    {canCancel && (
                        <Button danger onClick={handleCancelOrder} disabled={cancelling}>
                            {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                        </Button>
                    )}

                    {canConfirmReceived && <Button primary>Xác nhận đã nhận</Button>}

                    {canDelete && (
                        <Button danger onClick={handleDeleteOrder}>
                            Xóa đơn hàng
                        </Button>
                    )}

                    <Button outline onClick={handleContactSupport}>
                        Liên hệ hỗ trợ
                    </Button>
                </div>
            </div>

            <div className={cx('content')}>
                <div className={cx('grid')}>
                    <div className={cx('card')}>
                        <div className={cx('card-header')}>
                            <FontAwesomeIcon icon={faBox} />
                            <h2>Thông tin đơn hàng</h2>
                        </div>
                        <div className={cx('card-content')}>
                            <div className={cx('info-grid')}>
                                <div className={cx('info-item')}>
                                    <label>Mã đơn hàng:</label>
                                    <span className={cx('order-number')}>#{order.orderNumber}</span>
                                </div>
                                <div className={cx('info-item')}>
                                    <label>Ngày đặt:</label>
                                    <span>{formatDate(order.createdAt)}</span>
                                </div>
                                <div className={cx('info-item')}>
                                    <label>Cập nhật:</label>
                                    <span>{formatDate(order.updatedAt)}</span>
                                </div>
                                <div className={cx('info-item')}>
                                    <label>Trạng thái:</label>
                                    <OrderStatus status={order.statusOrder} />
                                </div>
                                <div className={cx('info-item')}>
                                    <label>Tổng tiền:</label>
                                    <span className={cx('price')}>{formatPrice(order.totalAmount)}.000 đ</span>
                                </div>
                                <div className={cx('info-item')}>
                                    <label>Phí vận chuyển:</label>
                                    <span>{formatPrice(order.shippingCost)}.000 đ</span>
                                </div>
                                <div className={cx('info-item')}>
                                    <label>Phương thức thanh toán:</label>
                                    <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
                                </div>
                                {order.canceledAt && (
                                    <div className={cx('info-item')}>
                                        <label>Ngày hủy:</label>
                                        <span>{formatDate(order.canceledAt)}</span>
                                    </div>
                                )}
                                {order.completedAt && (
                                    <div className={cx('info-item')}>
                                        <label>Ngày hoàn thành:</label>
                                        <span>{formatDate(order.completedAt)}</span>
                                    </div>
                                )}
                                {order.deliveredAt && (
                                    <div className={cx('info-item')}>
                                        <label>Ngày giao hàng:</label>
                                        <span>{formatDate(order.deliveredAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={cx('card')}>
                        <div className={cx('card-header')}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            <h2>Thông tin giao hàng</h2>
                        </div>
                        <div className={cx('card-content')}>
                            <div className={cx('info-item', 'full-width')}>
                                <label>Địa chỉ giao hàng:</label>
                                <span className={cx('shipping-address')}>{order.shippingAddress}</span>
                            </div>
                            {order.note && (
                                <div className={cx('info-item', 'full-width')}>
                                    <label>Ghi chú:</label>
                                    <span className={cx('note')}>{order.note}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={cx('card', 'full-width')}>
                        <div className={cx('card-header')}>
                            <FontAwesomeIcon icon={faCreditCard} />
                            <h2>Chi tiết sản phẩm</h2>
                            <span className={cx('items-count')}>{order.orderItems?.length || 0} sản phẩm</span>
                        </div>
                        <div className={cx('card-content')}>
                            <div className={cx('order-items')}>
                                <table className={cx('items-table')}>
                                    <thead>
                                        <tr>
                                            <th className={cx('product')}>Sản phẩm</th>
                                            <th className={cx('price')}>Đơn giá</th>
                                            <th className={cx('quantity')}>Số lượng</th>
                                            <th className={cx('total')}>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.orderItems?.map((item) => (
                                            <tr key={item.orderItemId}>
                                                <td className={cx('product-info')}>
                                                    <div className={cx('product-image')}>
                                                        <img
                                                            src={item.productUrl || '/images/default-book.jpg'}
                                                            alt={item.productName}
                                                            onError={(e) => {
                                                                e.target.src = '/images/default-book.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className={cx('product-details')}>
                                                        <h4>{item.productName}</h4>
                                                        {item.categoryName && (
                                                            <p className={cx('category')}>
                                                                Danh mục: {item.categoryName}
                                                            </p>
                                                        )}
                                                        {item.authorName && (
                                                            <p className={cx('author')}>Tác giả: {item.authorName}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={cx('price')}>{formatPrice(item.unitPrice)}.000 đ</td>
                                                <td className={cx('quantity')}>{item.quantity}</td>
                                                <td className={cx('total')}>{formatPrice(item.subTotal)}.000 đ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" className={cx('footer-label')}>
                                                Tổng cộng:
                                            </td>
                                            <td className={cx('footer-total')}>
                                                {formatPrice(order.totalAmount)}.000 đ
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className={cx('card', 'help-card')}>
                        <div className={cx('card-header')}>
                            <FontAwesomeIcon icon={faPhone} />
                            <h2>Cần hỗ trợ?</h2>
                        </div>
                        <div className={cx('card-content')}>
                            <div className={cx('help-content')}>
                                <p>Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ:</p>
                                <div className={cx('contact-info')}>
                                    <p>
                                        <strong>Hotline:</strong> 1900 1234
                                    </p>
                                    <p>
                                        <strong>Email:</strong> support@bookstore.com
                                    </p>
                                    <p>
                                        <strong>Thời gian:</strong> 8:00 - 22:00 hàng ngày
                                    </p>
                                </div>
                                <Button primary onClick={handleContactSupport}>
                                    <FontAwesomeIcon icon={faEnvelope} />
                                    Liên hệ ngay
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserOrderDetail;
