import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './UserOrders.module.scss';
import orderApi from '../../api/orderApi';
import OrderStatus from '../../components/OrderStatus/OrderStatus';
import Button from '../../Layouts/components/Button';
import { useToast } from '../../contexts/Toast/ToastContext';
import { useAuth } from '../../contexts/Auth/AuthContext'; // Thêm import useAuth

const cx = classNames.bind(styles);

// Đưa hàm formatPrice ra ngoài component
const formatPrice = (price) => {
    if (!price) return '0';
    return (price / 1000).toLocaleString();
};

// Component con để hiển thị từng sản phẩm
const OrderItem = ({ item }) => {
    return (
        <div className={cx('order-item')}>
            <img
                src={item.productUrl || '/images/default-book.jpg'}
                alt={item.productName}
                className={cx('item-image')}
                onError={(e) => {
                    e.target.src = '/images/default-book.jpg';
                }}
            />
            <div className={cx('item-details')}>
                <h5>{item.productName}</h5>
                <p>Số lượng: {item.quantity}</p>
                <p className={cx('item-price')}>{formatPrice(item.unitPrice)}.000 đ</p>
            </div>
        </div>
    );
};

function UserOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingOrder, setCancellingOrder] = useState(null);
    const [deletingOrder, setDeletingOrder] = useState(null);
    const { addToast } = useToast();
    const { isAuthenticated } = useAuth(); // Sử dụng useAuth

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            const response = await orderApi.getMyOrders();
            setOrders(response.data.result || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng';
            addToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId, orderNumber) => {
        if (!window.confirm(`Bạn có chắc muốn hủy đơn hàng #${orderNumber}?`)) {
            return;
        }

        setCancellingOrder(orderId);
        try {
            await orderApi.cancelOrder(orderId);
            addToast('Đã hủy đơn hàng thành công', 'success');
            fetchOrders(); // Refresh danh sách
        } catch (error) {
            console.error('Error cancelling order:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi khi hủy đơn hàng';
            addToast(errorMessage, 'error');
        } finally {
            setCancellingOrder(null);
        }
    };

    const handleDeleteOrder = async (orderId, orderNumber) => {
        if (!window.confirm(`Bạn có chắc muốn xóa đơn hàng #${orderNumber}? Hành động này không thể hoàn tác.`)) {
            return;
        }

        setDeletingOrder(orderId);
        try {
            await orderApi.deleteOrder(orderId);
            addToast('Đã xóa đơn hàng thành công', 'success');
            // Cập nhật UI ngay lập tức
            setOrders((prevOrders) => prevOrders.filter((order) => order.orderId !== orderId));
        } catch (error) {
            console.error('Error deleting order:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi khi xóa đơn hàng';
            addToast(errorMessage, 'error');
        } finally {
            setDeletingOrder(null);
        }
    };

    const handleConfirmReceived = async (orderId, orderNumber) => {
        // TODO: Thêm API xác nhận đã nhận hàng nếu backend có
        addToast(`Đã xác nhận nhận hàng cho đơn hàng #${orderNumber}`, 'success');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Phân loại đơn hàng theo trạng thái
    const activeOrders = orders.filter(
        (order) => order.statusOrder !== 'CANCELLED' && order.statusOrder !== 'COMPLETED',
    );
    const completedOrders = orders.filter((order) => order.statusOrder === 'COMPLETED');
    const cancelledOrders = orders.filter((order) => order.statusOrder === 'CANCELLED');

    if (loading) {
        return (
            <div className={cx('container')}>
                <div className={cx('loading')}>
                    <div className={cx('spinner')}></div>
                    <p>Đang tải đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={cx('container')}>
                <div className={cx('empty-state')}>
                    <h2>Vui lòng đăng nhập</h2>
                    <p>Bạn cần đăng nhập để xem đơn hàng của mình</p>
                    <Button primary to="/login">
                        Đăng nhập ngay
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('container')}>
            <div className={cx('header')}>
                <h1>Đơn hàng của tôi</h1>
                <p>Quản lý và theo dõi đơn hàng của bạn</p>
            </div>

            {orders.length === 0 ? (
                <div className={cx('empty-state')}>
                    <h2>Chưa có đơn hàng nào</h2>
                    <p>Hãy bắt đầu mua sắm và tạo đơn hàng đầu tiên!</p>
                    <Button primary to="/books">
                        Mua sắm ngay
                    </Button>
                </div>
            ) : (
                <div className={cx('orders-container')}>
                    {/* Đơn hàng đang hoạt động */}
                    {activeOrders.length > 0 && (
                        <div className={cx('orders-section')}>
                            <h2>Đơn hàng đang xử lý ({activeOrders.length})</h2>
                            <div className={cx('orders-list')}>
                                {activeOrders.map((order) => (
                                    <OrderCard
                                        key={order.orderId}
                                        order={order}
                                        onCancel={handleCancelOrder}
                                        onConfirm={handleConfirmReceived}
                                        onDelete={handleDeleteOrder}
                                        cancellingOrder={cancellingOrder}
                                        deletingOrder={deletingOrder}
                                        formatDate={formatDate}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Đơn hàng đã hoàn thành */}
                    {completedOrders.length > 0 && (
                        <div className={cx('orders-section')}>
                            <h2>Đơn hàng đã hoàn thành ({completedOrders.length})</h2>
                            <div className={cx('orders-list')}>
                                {completedOrders.map((order) => (
                                    <OrderCard
                                        key={order.orderId}
                                        order={order}
                                        onCancel={handleCancelOrder}
                                        onConfirm={handleConfirmReceived}
                                        onDelete={handleDeleteOrder}
                                        cancellingOrder={cancellingOrder}
                                        deletingOrder={deletingOrder}
                                        formatDate={formatDate}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Đơn hàng đã hủy */}
                    {cancelledOrders.length > 0 && (
                        <div className={cx('orders-section')}>
                            <h2>Đơn hàng đã hủy ({cancelledOrders.length})</h2>
                            <div className={cx('orders-list')}>
                                {cancelledOrders.map((order) => (
                                    <OrderCard
                                        key={order.orderId}
                                        order={order}
                                        onCancel={handleCancelOrder}
                                        onConfirm={handleConfirmReceived}
                                        onDelete={handleDeleteOrder}
                                        cancellingOrder={cancellingOrder}
                                        deletingOrder={deletingOrder}
                                        formatDate={formatDate}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Component con để hiển thị từng order card
const OrderCard = ({ order, onCancel, onConfirm, onDelete, cancellingOrder, deletingOrder, formatDate }) => {
    return (
        <div className={cx('order-card')}>
            <div className={cx('order-header')}>
                <div className={cx('order-info')}>
                    <h3>Đơn hàng #{order.orderNumber}</h3>
                    <span className={cx('order-date')}>{formatDate(order.createdAt)}</span>
                </div>
                <div className={cx('order-total')}>{formatPrice(order.totalAmount)}.000 đ</div>
            </div>

            <div className={cx('order-status-section')}>
                <OrderStatus status={order.statusOrder} />
            </div>

            <div className={cx('order-items')}>
                <h4>Sản phẩm ({order.orderItems?.length || 0}):</h4>
                <div className={cx('items-grid')}>
                    {order.orderItems?.map((item) => (
                        <OrderItem key={item.orderItemId} item={item} />
                    ))}
                </div>
            </div>

            <div className={cx('order-actions')}>
                <Button outline to={`/orders/${order.orderId}`}>
                    Xem chi tiết
                </Button>

                {order.statusOrder === 'PENDING' && (
                    <Button
                        danger
                        onClick={() => onCancel(order.orderId, order.orderNumber)}
                        disabled={cancellingOrder === order.orderId}
                    >
                        {cancellingOrder === order.orderId ? 'Đang hủy...' : 'Hủy đơn hàng'}
                    </Button>
                )}

                {order.statusOrder === 'DELIVERED' && (
                    <Button primary onClick={() => onConfirm(order.orderId, order.orderNumber)}>
                        Xác nhận đã nhận
                    </Button>
                )}

                {order.statusOrder === 'CANCELLED' && (
                    <Button
                        danger
                        onClick={() => onDelete(order.orderId, order.orderNumber)}
                        disabled={deletingOrder === order.orderId}
                    >
                        {deletingOrder === order.orderId ? 'Đang xóa...' : 'Xóa đơn hàng'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default UserOrders;
