// src/api/adminApi.js
import axiosClient from './axiosClient';

const adminApi = {
    // PRODUCTS
    createProduct: (payload) => axiosClient.post(`/products`, payload),
    getProduct: (id) => axiosClient.get(`/products/${id}`),
    updateProduct: (id, payload) => axiosClient.put(`/products/${id}`, payload),
    deleteProduct: (id) => axiosClient.delete(`/products/${id}`),

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
};

export default adminApi;
