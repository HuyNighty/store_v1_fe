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

    getMainAssetByProductId: async (productId) => {
        const res = await axiosClient.get('/product-assets', { params: { productId, type: 'MAIN' } });
        return normalize(res);
    },

    searchByName: (keyword) => axiosClient.get('/products/search', { params: { keyword } }),
};

export default productApi;
