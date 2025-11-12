// productApi.js - đã cập nhật
import axiosClient from './axiosClient';

const normalize = (res) => {
    return res?.data?.result ?? res?.data ?? res;
};

const productApi = {
    getAll: async () => {
        const res = await axiosClient.get('/products');
        return normalize(res);
    },

    getById: async (productId) => {
        const res = await axiosClient.get(`/products/${productId}`);
        return normalize(res);
    },

    getByCategory: async (categoryId) => {
        const res = await axiosClient.get(`/products/by-category/${categoryId}`);
        return normalize(res);
    },

    filterProducts: async (filters) => {
        const params = {};
        Object.keys(filters).forEach((key) => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                params[key] = filters[key];
            }
        });

        const res = await axiosClient.get('/products/filter', { params });
        return normalize(res);
    },

    searchByName: (keyword) => axiosClient.get('/products/search', { params: { keyword } }),

    getMainAssetByProductId: async (productId) => {
        const res = await axiosClient.get('/product-assets', { params: { productId, type: 'MAIN' } });
        return normalize(res);
    },
};

export default productApi;
