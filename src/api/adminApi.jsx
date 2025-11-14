// src/api/adminApi.js
import axiosClient from './axiosClient';

const adminApi = {
    // PRODUCTS
    createProduct: (payload) => axiosClient.post(`/products`, payload),
    getProduct: (id) => axiosClient.get(`/products/${id}`),
    updateProduct: (id, payload) => axiosClient.patch(`/products/${id}`, payload),
    deleteProduct: (id) => axiosClient.delete(`/products/${id}`),

    getFullBook: (id) => axiosClient.get(`/full-books/${id}`),
    createFullBook: (payload) => axiosClient.post(`/full-books`, payload),
    updateFullBook: (id, payload) => axiosClient.patch(`/full-books/${id}`, payload),

    createAsset: (payload) => axiosClient.post(`/product-assets`, payload),
    getAsset: (id) => axiosClient.get(`/product-assets/${id}`),
    deleteAsset: (id) => axiosClient.delete(`/product-assets/${id}`),

    //   createProductAssetLink: (payload) => axiosClient.post(`/product-assets/link`, payload),
    //   deleteProductAssetLink: (id) => axiosClient.delete(`/product-assets/link/${id}`),

    // AUTHORS
    createAuthor: (payload) => axiosClient.post(`/authors`, payload),
    getAuthor: (id) => axiosClient.get(`/authors/${id}`),
    deleteAuthor: (id) => axiosClient.delete(`/authors/${id}`),

    // BOOK-AUTHORS (association)
    createBookAuthor: (payload) => axiosClient.post(`/book-authors`, payload),
    deleteBookAuthor: (id) => axiosClient.delete(`/book-authors/${id}`),

    // Cập nhật trạng thái đơn hàng (Admin)
    updateOrderStatus: (orderId, statusData) => axiosClient.patch(`/orders/admin/${orderId}/status`, statusData),

    // Lấy đơn hàng của user cụ thể (Admin)
    getOrdersByUser: (userId) => axiosClient.get(`/orders/admin/users/${userId}`),

    // Lấy chi tiết đơn hàng của user (Admin)
    getOrderByUser: (userId, orderId) => axiosClient.get(`/orders/admin/users/${userId}/orders/${orderId}`),
};

export default adminApi;
