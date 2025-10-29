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
};

export default orderApi;
