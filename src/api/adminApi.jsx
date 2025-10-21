// src/api/adminApi.js
import axiosClient from './axiosClient';

const BASE = '/Store/api';

const adminApi = {
    // PRODUCTS
    createProduct: (payload) => axiosClient.post(`${BASE}/products`, payload),
    getProduct: (id) => axiosClient.get(`${BASE}/products/${id}`),
    deleteProduct: (id) => axiosClient.delete(`${BASE}/products/${id}`),

    createAsset: (payload) => axiosClient.post(`${BASE}/product-assets`, payload),
    getAsset: (id) => axiosClient.get(`${BASE}/product-assets/${id}`),
    deleteAsset: (id) => axiosClient.delete(`${BASE}/product-assets/${id}`),

    //   createProductAssetLink: (payload) => axiosClient.post(`${BASE}/product-assets/link`, payload),
    //   deleteProductAssetLink: (id) => axiosClient.delete(`${BASE}/product-assets/link/${id}`),

    // AUTHORS
    createAuthor: (payload) => axiosClient.post(`${BASE}/authors`, payload),
    getAuthor: (id) => axiosClient.get(`${BASE}/authors/${id}`),
    deleteAuthor: (id) => axiosClient.delete(`${BASE}/authors/${id}`),

    // BOOK-AUTHORS (association)
    createBookAuthor: (payload) => axiosClient.post(`${BASE}/book-authors`, payload),
    deleteBookAuthor: (id) => axiosClient.delete(`${BASE}/book-authors/${id}`),
};

export default adminApi;
