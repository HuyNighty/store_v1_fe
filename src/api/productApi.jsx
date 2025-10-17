import axiosClient from './axiosClient';

const productApi = {
    getAll: async () => {
        const response = await axiosClient.get('/products', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
};

export default productApi;
