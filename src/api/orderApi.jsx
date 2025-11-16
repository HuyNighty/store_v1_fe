import axiosClient from './axiosClient';

const orderApi = {
    //USER role
    checkout: (orderData) => axiosClient.post('/orders/checkout', orderData),

    getMyOrders: () => axiosClient.get('/orders/me'),

    getOrderById: (orderId) => axiosClient.get(`/orders/me/${orderId}`),

    cancelOrder: (orderId) => axiosClient.patch(`/orders/me/cancel/orders/${orderId}`),

    deleteOrder: (orderId) => axiosClient.delete(`/orders/me/${orderId}`),

    getOrderDetailsUser: (orderId) => {
        const url = `/orders/${orderId}/details`;
        return axiosClient.get(url);
    },

    //ADMIN role
    getAllOrders: () => axiosClient.get('/orders'),

    updateOrderStatus: (orderId, data) => {
        const url = `/orders/admin/${orderId}/status`;
        return axiosClient.patch(url, data);
    },

    adminDeleteOrder: (orderId) => {
        const url = `/orders/admin/${orderId}`;
        return axiosClient.delete(url);
    },

    getOrderDetailsAdmin: (orderId) => {
        const url = `/orders/admin/${orderId}/details`;
        return axiosClient.get(url);
    },

    getOrdersByUser: (userId) => {
        const url = `/orders/admin/users/${userId}`;
        return axiosClient.get(url);
    },

    getOrderByUser: (userId, orderId) => {
        const url = `/orders/admin/users/${userId}/orders/${orderId}`;
        return axiosClient.get(url);
    },
};

export default orderApi;
