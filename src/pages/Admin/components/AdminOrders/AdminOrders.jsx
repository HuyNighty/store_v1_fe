import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './AdminOrders.module.scss';
import orderApi from '../../../../api/orderApi';
import { useToast } from '../../../../contexts/Toast/ToastContext';
import OrderStatus from '../../../../components/OrderStatus/OrderStatus';
import Button from '../../../../Layouts/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [showCancelled, setShowCancelled] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await orderApi.getAllOrders();
            setOrders(response.data.result || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            addToast('Lỗi khi tải danh sách đơn hàng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return (price / 1000).toLocaleString();
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

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await orderApi.updateOrderStatus(orderId, { newStatusOrder: newStatus });
            addToast('Cập nhật trạng thái đơn hàng thành công', 'success');
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            addToast('Lỗi khi cập nhật trạng thái đơn hàng', 'error');
        }
    };

    const handleDeleteOrder = async (orderId, orderNumber) => {
        if (!window.confirm(`Bạn có chắc muốn xóa đơn hàng #${orderNumber}? Hành động này không thể hoàn tác.`)) {
            return;
        }

        try {
            await orderApi.adminDeleteOrder(orderId);
            addToast('Đã xóa đơn hàng thành công', 'success');
            setOrders((prevOrders) => prevOrders.filter((order) => order.orderId !== orderId));
        } catch (error) {
            console.error('Error deleting order:', error);
            addToast('Lỗi khi xóa đơn hàng', 'error');
        }
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

    const activeOrders = orders.filter((order) => order.statusOrder !== 'CANCELLED');
    const cancelledOrders = orders.filter((order) => order.statusOrder === 'CANCELLED');

    const filteredActiveOrders = activeOrders.filter((order) => {
        if (filter === 'ALL') return true;
        return order.statusOrder === filter;
    });

    const statusCounts = {
        ALL: activeOrders.length,
        PENDING: activeOrders.filter((o) => o.statusOrder === 'PENDING').length,
        PAID: activeOrders.filter((o) => o.statusOrder === 'PAID').length,
        SHIPPED: activeOrders.filter((o) => o.statusOrder === 'SHIPPED').length,
        DELIVERED: activeOrders.filter((o) => o.statusOrder === 'DELIVERED').length,
        COMPLETED: activeOrders.filter((o) => o.statusOrder === 'COMPLETED').length,
        CANCELLED: cancelledOrders.length,
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
                <div className={cx('back')}>
                    <Button small to="/admin">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Button>
                    <h1>Quản lý đơn hàng</h1>
                </div>
                <p>Theo dõi và quản lý tất cả đơn hàng trong hệ thống</p>
            </div>

            <div className={cx('stats')}>
                <div className={cx('stat-card')}>
                    <h3>Tổng đơn hàng</h3>
                    <span className={cx('stat-number')}>{statusCounts.ALL}</span>
                </div>
                <div className={cx('stat-card', 'pending')}>
                    <h3>Chờ xác nhận</h3>
                    <span className={cx('stat-number')}>{statusCounts.PENDING}</span>
                </div>
                <div className={cx('stat-card', 'shipped')}>
                    <h3>Đang giao</h3>
                    <span className={cx('stat-number')}>{statusCounts.SHIPPED}</span>
                </div>
                <div className={cx('stat-card', 'completed')}>
                    <h3>Hoàn thành</h3>
                    <span className={cx('stat-number')}>{statusCounts.COMPLETED}</span>
                </div>
                <div className={cx('stat-card', 'cancelled')}>
                    <h3>Đã hủy</h3>
                    <span className={cx('stat-number')}>{statusCounts.CANCELLED}</span>
                </div>
            </div>

            <div className={cx('main-section')}>
                <div className={cx('section-header')}>
                    <h2>Đơn hàng đang hoạt động</h2>
                    <p>Quản lý các đơn hàng đang trong quá trình xử lý</p>
                </div>

                <div className={cx('filter-tabs')}>
                    {Object.keys(statusCounts).map(
                        (status) =>
                            status !== 'CANCELLED' && (
                                <Button
                                    key={status}
                                    className={cx('tab', { active: filter === status })}
                                    onClick={() => setFilter(status)}
                                >
                                    {getStatusLabel(status)} ({statusCounts[status]})
                                </Button>
                            ),
                    )}
                </div>

                <div className={cx('orders-table')}>
                    {filteredActiveOrders.length === 0 ? (
                        <div className={cx('empty-state')}>
                            <h3>Không có đơn hàng nào</h3>
                            <p>Không tìm thấy đơn hàng phù hợp với bộ lọc</p>
                        </div>
                    ) : (
                        <div className={cx('table-container')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th>Mã đơn hàng</th>
                                        <th>Khách hàng</th>
                                        <th>Ngày đặt</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredActiveOrders.map((order) => (
                                        <tr key={order.orderId}>
                                            <td className={cx('order-number')}>
                                                <div>#{order.orderNumber}</div>
                                            </td>
                                            <td className={cx('customer')}>
                                                <div>
                                                    <div>{order.fullName || 'N/A'}</div>
                                                    <br />
                                                    <small>{order.userId || 'N/A'}</small>
                                                </div>
                                            </td>
                                            <td className={cx('date')}>{formatDate(order.createdAt)}</td>
                                            <td className={cx('amount')}>{formatPrice(order.totalAmount)}.000 đ</td>
                                            <td className={cx('status')}>
                                                <OrderStatus status={order.statusOrder} />
                                            </td>
                                            <td className={cx('actions')}>
                                                <div className={cx('action-buttons')}>
                                                    <Button small outline to={`/admin/orders/${order.orderId}`}>
                                                        Chi tiết
                                                    </Button>

                                                    {getStatusActions(order.statusOrder).map((action) => (
                                                        <Button
                                                            key={action}
                                                            small
                                                            primary
                                                            onClick={() => handleUpdateStatus(order.orderId, action)}
                                                        >
                                                            {getStatusLabel(action)}
                                                        </Button>
                                                    ))}

                                                    <Button
                                                        small
                                                        shine
                                                        danger
                                                        primary
                                                        onClick={() =>
                                                            handleDeleteOrder(order.orderId, order.orderNumber)
                                                        }
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {cancelledOrders.length > 0 && (
                <div className={cx('cancelled-section')}>
                    <div className={cx('section-header')}>
                        <div className={cx('section-title')}>
                            <h2>Đơn hàng đã hủy</h2>
                            <Button
                                small
                                outline
                                onClick={() => setShowCancelled(!showCancelled)}
                                className={cx('toggle-btn')}
                            >
                                {showCancelled ? 'Ẩn' : 'Hiển thị'} ({cancelledOrders.length})
                            </Button>
                        </div>
                        <p>Các đơn hàng đã bị hủy bởi người dùng hoặc hệ thống</p>
                    </div>

                    {showCancelled && (
                        <div className={cx('cancelled-orders')}>
                            <div className={cx('table-container')}>
                                <table className={cx('table', 'cancelled-table')}>
                                    <thead>
                                        <tr>
                                            <th>Mã đơn hàng</th>
                                            <th>Khách hàng</th>
                                            <th>Ngày đặt</th>
                                            <th>Ngày hủy</th>
                                            <th>Tổng tiền</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cancelledOrders.map((order) => (
                                            <tr key={order.orderId} className={cx('cancelled-row')}>
                                                <td className={cx('order-number')}>
                                                    <div>#{order.orderNumber}</div>
                                                </td>
                                                <td className={cx('customer')}>
                                                    <div>
                                                        <div>{order.fullName || 'N/A'}</div>
                                                        <br />
                                                        <small>{order.userId || 'N/A'}</small>
                                                    </div>
                                                </td>
                                                <td className={cx('date')}>{formatDate(order.createdAt)}</td>
                                                <td className={cx('date')}>
                                                    {order.canceledAt ? formatDate(order.canceledAt) : 'N/A'}
                                                </td>
                                                <td className={cx('amount')}>{formatPrice(order.totalAmount)}.000 đ</td>
                                                <td className={cx('actions')}>
                                                    <div className={cx('action-buttons')}>
                                                        <Button
                                                            shine
                                                            small
                                                            outline
                                                            to={`/admin/orders/${order.orderId}`}
                                                        >
                                                            Chi tiết
                                                        </Button>
                                                        <Button
                                                            small
                                                            danger
                                                            onClick={() =>
                                                                handleDeleteOrder(order.orderId, order.orderNumber)
                                                            }
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
