import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './UserOrders.module.scss';
import orderApi from '../../api/orderApi';
import OrderStatus from '../../components/OrderStatus/OrderStatus';
import Button from '../../Layouts/components/Button';
import { useToast } from '../../contexts/Toast/ToastContext';
import useProductImage from '../../hooks/useProductImage';

const cx = classNames.bind(styles);

// Đưa hàm formatPrice ra ngoài component
const formatPrice = (price) => {
    return (price / 1000).toLocaleString();
};

// Component con để hiển thị từng sản phẩm với hook
const OrderItem = ({ item }) => {
    const { imageUrl, loading, error } = useProductImage(item.productId);

    return (
        <div className={cx('order-item')}>
            <img
                src={loading ? '/images/loading-image.jpg' : imageUrl || '/images/default-book.jpg'}
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
                {error && <span className={cx('image-error')}>⚠️</span>}
            </div>
        </div>
    );
};

function UserOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await orderApi.getMyOrders();
            setOrders(response.data.result || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            addToast('Lỗi khi tải danh sách đơn hàng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId, orderNumber) => {
        if (!window.confirm(`Bạn có chắc muốn hủy đơn hàng #${orderNumber}?`)) {
            return;
        }

        try {
            await orderApi.cancelOrder(orderId);
            addToast('Đã hủy đơn hàng thành công', 'success');
            fetchOrders(); // Refresh danh sách
        } catch (error) {
            console.error('Error cancelling order:', error);
            addToast('Lỗi khi hủy đơn hàng', 'error');
        }
    };

    const handleDeleteOrder = async (orderId, orderNumber) => {
        if (!window.confirm(`Bạn có chắc muốn xóa đơn hàng #${orderNumber}? Hành động này không thể hoàn tác.`)) {
            return;
        }

        try {
            await orderApi.deleteOrder(orderId);
            addToast('Đã xóa đơn hàng thành công', 'success');

            setOrders((prevOrders) => prevOrders.filter((order) => order.orderId !== orderId));
        } catch (error) {
            console.error('Error deleting order:', error);
            addToast('Lỗi khi xóa đơn hàng', 'error');
        }
    };

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
                <div className={cx('orders-list')}>
                    {orders.map((order) => (
                        <div key={order.orderId} className={cx('order-card')}>
                            <div className={cx('order-header')}>
                                <div className={cx('order-info')}>
                                    <h3>Đơn hàng #{order.orderNumber}</h3>
                                    <span className={cx('order-date')}>
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <div className={cx('order-total')}>{formatPrice(order.totalAmount)}.000 đ</div>
                            </div>

                            <div className={cx('order-status-section')}>
                                <OrderStatus status={order.statusOrder} />
                            </div>

                            <div className={cx('order-items')}>
                                <h4>Sản phẩm:</h4>
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
                                    <Button danger onClick={() => handleCancelOrder(order.orderId, order.orderNumber)}>
                                        Hủy đơn hàng
                                    </Button>
                                )}

                                {order.statusOrder === 'DELIVERED' && (
                                    <Button
                                        primary
                                        // onClick={() => handleConfirmReceived(order.orderId)}
                                    >
                                        Xác nhận đã nhận
                                    </Button>
                                )}

                                {order.statusOrder === 'CANCELLED' && (
                                    <Button danger onClick={() => handleDeleteOrder(order.orderId, order.orderNumber)}>
                                        Xóa đơn hàng
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserOrders;
