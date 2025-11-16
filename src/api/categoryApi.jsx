import axiosClient from './axiosClient';

const categoryApi = {
    getAllCategories: () => {
        const url = '/categories/public';
        return axiosClient.get(url);
    },

    getCategoryById: (categoryId) => {
        const url = `/categories/${categoryId}`;
        return axiosClient.get(url);
    },

    createCategory: (data) => {
        const url = '/categories';
        return axiosClient.post(url, data);
    },

    updateCategory: (categoryId, data) => {
        const url = `/categories/${categoryId}`;
        return axiosClient.patch(url, data);
    },

    // Xóa mềm category
    deleteCategory: (categoryId) => {
        const url = `/categories/${categoryId}`;
        return axiosClient.delete(url);
    },

    getActiveCategories: () => {
        const url = '/categories/active';
        return axiosClient.get(url);
    },
};

export default categoryApi;
