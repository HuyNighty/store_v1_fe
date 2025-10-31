// src/pages/Admin/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './OrderDetail.module.scss';
import orderApi from '../../api/orderApi';
import { useToast } from '../../contexts/Toast/ToastContext';
import OrderStatus from '../../components/OrderStatus/OrderStatus';
import Button from '../../Layouts/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUser, faMapMarkerAlt, faBox, faCreditCard, faEye } from '@fortawesome/free-solid-svg-icons';
import CustomerDetailModal from '../../components/CustomerDetailModal';

const cx = classNames.bind(styles);

function OrderDetail() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async () => {
        try {
            const response = await orderApi.getOrderDetailsAdmin(orderId);
            setOrder(response.data.result);
        } catch (error) {
            console.error('Error fetching order details:', error);
            addToast('Lỗi khi tải chi tiết đơn hàng', 'error');
            navigate('/admin-orders');
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

    const handleUpdateStatus = async (newStatus) => {
        if (!order) return;

        setUpdatingStatus(true);
        try {
            await orderApi.updateOrderStatus(order.orderId, { newStatusOrder: newStatus });
            addToast('Cập nhật trạng thái đơn hàng thành công', 'success');
            fetchOrderDetail();
        } catch (error) {
            console.error('Error updating order status:', error);
            addToast('Lỗi khi cập nhật trạng thái đơn hàng', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (!order) return;

        if (!window.confirm(`Bạn có chắc muốn xóa đơn hàng #${order.orderNumber}? Hành động này không thể hoàn tác.`)) {
            return;
        }

        try {
            await orderApi.adminDeleteOrder(order.orderId);
            addToast('Đã xóa đơn hàng thành công', 'success');
            navigate('/admin-orders');
        } catch (error) {
            console.error('Error deleting order:', error);
            addToast('Lỗi khi xóa đơn hàng', 'error');
        }
    };

    // Hàm mở modal xem chi tiết customer
    const handleViewCustomer = (customerId) => {
        setSelectedCustomerId(customerId);
        setShowCustomerModal(true);
    };

    const getStatusActions = (currentStatus) => {
        const actions = {
            PENDING: ['PAID', 'CANCELLED'],
            PAID: ['SHIPPED', 'CANCELLED'],
            SHIPPED: ['DELIVERED'],
            DELIVERED: ['COMPLETED'],
            COMPLETED: [],
            CANCELLED: [],
        };
        return actions[currentStatus] || [];
    };

    const getStatusLabel = (status) => {
        const labels = {
            PENDING: 'Chờ xác nhận',
            PAID: 'Đã thanh toán',
            SHIPPED: 'Đang giao hàng',
            DELIVERED: 'Đã giao hàng',
            COMPLETED: 'Hoàn thành',
            CANCELLED: 'Đã hủy',
        };
        return labels[status] || status;
    };

    const getPaymentMethodLabel = (method) => {
        const methods = {
            COD: 'Thanh toán khi nhận hàng',
            BANK_TRANSFER: 'Chuyển khoản ngân hàng',
            CREDIT_CARD: 'Thẻ tín dụng/Ghi nợ',
        };
        return methods[method] || method;
    };

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
                    <Button primary onClick={() => navigate('/admin-orders')}>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('container')}>
            {/* Header */}
            <div className={cx('header')}>
                <div className={cx('header-main')}>
                    <Button back onClick={() => navigate('/admin-orders')}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Button>
                    <div className={cx('header-content')}>
                        <h1>Đơn hàng #{order.orderNumber}</h1>
                        <div className={cx('order-meta')}>
                            <OrderStatus status={order.statusOrder} />
                            <span className={cx('order-date')}>Đặt ngày: {formatDate(order.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={cx('header-actions')}>
                    {getStatusActions(order.statusOrder).map((action) => (
                        <Button
                            key={action}
                            primary
                            onClick={() => handleUpdateStatus(action)}
                            disabled={updatingStatus}
                        >
                            {updatingStatus ? 'Đang xử lý...' : getStatusLabel(action)}
                        </Button>
                    ))}
                    <Button danger onClick={handleDeleteOrder}>
                        Xóa đơn hàng
                    </Button>
                </div>
            </div>

            <div className={cx('content')}>
                <div className={cx('grid')}>
                    {/* Order Information */}
                    <div className={cx('card')}>
                        <div className={cx('card-header')}>
                            <FontAwesomeIcon icon={faBox} />
                            <h2>Thông tin đơn hàng</h2>
                        </div>
                        <div className={cx('card-content')}>
                            <div className={cx('info-grid')}>
                                <div className={cx('info-item')}>
                                    <label>Mã đơn hàng:</label>
                                    <span>#{order.orderNumber}</span>
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

                    {/* Customer Information */}
                    <div className={cx('card')}>
                        <div className={cx('card-header')}>
                            <FontAwesomeIcon icon={faUser} />
                            <h2>Thông tin khách hàng</h2>
                        </div>
                        <div className={cx('card-content')}>
                            <div className={cx('info-grid')}>
                                <div className={cx('info-item')}>
                                    <label>Họ tên:</label>
                                    <span>{order.fullName || 'N/A'}</span>
                                </div>
                                <div className={cx('info-item')}>
                                    <label>Email:</label>
                                    <span>{order.email || 'N/A'}</span>
                                </div>
                                <div className={cx('info-item')}>
                                    <label>Điện thoại:</label>
                                    <span>{order.phone || 'N/A'}</span>
                                </div>
                                <div className={cx('info-item')}>
                                    <label>Customer ID:</label>
                                    <div className={cx('user-id-container')}>
                                        <Button
                                            small
                                            outline
                                            onClick={() => handleViewCustomer(order.customerId)}
                                            className={cx('user-id-btn')}
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                            {order.customerId || 'N/A'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Information */}
                    <div className={cx('card')}>
                        <div className={cx('card-header')}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            <h2>Thông tin giao hàng</h2>
                        </div>
                        <div className={cx('card-content')}>
                            <div className={cx('info-item', 'full-width')}>
                                <label>Địa chỉ giao hàng:</label>
                                <span>{order.shippingAddress}</span>
                            </div>
                            {order.note && (
                                <div className={cx('info-item', 'full-width')}>
                                    <label>Ghi chú:</label>
                                    <span className={cx('note')}>{order.note}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
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
                                                        <p className={cx('product-id')}>Mã SP: {item.productId}</p>
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
                </div>
            </div>

            {/* Customer Detail Modal */}
            <CustomerDetailModal
                customerId={selectedCustomerId}
                isOpen={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
            />
        </div>
    );
}

export default OrderDetail;
