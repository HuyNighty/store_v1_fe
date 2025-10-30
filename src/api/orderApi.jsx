// src/api/orderApi.js
import axiosClient from './axiosClient';

const orderApi = {
    // Tạo đơn hàng từ giỏ hàng
    checkout: (orderData) => axiosClient.post('/orders/checkout', orderData),

    // Lấy danh sách đơn hàng của user
    getMyOrders: () => axiosClient.get('/orders/me'),

    // Lấy chi tiết đơn hàng theo ID
    getOrderById: (orderId) => axiosClient.get(`/orders/me/${orderId}`),

    // Hủy đơn hàng
    cancelOrder: (orderId) => axiosClient.patch(`/orders/me/cancel/orders/${orderId}`),

    // Lấy tất cả đơn hàng (Admin)
    getAllOrders: () => axiosClient.get('/orders'),

    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: (orderId, data) => {
        const url = `/orders/admin/${orderId}/status`;
        return axiosClient.patch(url, data);
    },

    // Xóa mềm (User)
    deleteOrder: (orderId) => axiosClient.delete(`/orders/me/${orderId}`),

    // Xóa đơn hàng (Admin)
    adminDeleteOrder: (orderId) => {
        const url = `/orders/admin/${orderId}`;
        return axiosClient.delete(url);
    },

    // Lấy chi tiết đơn hàng (Admin)
    getOrderDetailsAdmin: (orderId) => {
        const url = `/orders/admin/${orderId}/details`;
        return axiosClient.get(url);
    },

    // Lấy chi tiết đơn hàng (User)
    getOrderDetailsUser: (orderId) => {
        const url = `/orders/${orderId}/details`;
        return axiosClient.get(url);
    },

    // Lấy đơn hàng theo user (Admin)
    getOrdersByUser: (userId) => {
        const url = `/orders/admin/users/${userId}`;
        return axiosClient.get(url);
    },

    // Lấy đơn hàng cụ thể của user (Admin)
    getOrderByUser: (userId, orderId) => {
        const url = `/orders/admin/users/${userId}/orders/${orderId}`;
        return axiosClient.get(url);
    },
};

export default orderApi;
