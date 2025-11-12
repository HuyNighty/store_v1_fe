import axiosClient from './axiosClient';

const categoryApi = {
    // Lấy tất cả categories
    getAllCategories: () => {
        const url = '/categories/public';
        return axiosClient.get(url);
    },

    // Lấy category theo ID
    getCategoryById: (categoryId) => {
        const url = `/categories/${categoryId}`;
        return axiosClient.get(url);
    },

    // Tạo category mới
    createCategory: (data) => {
        const url = '/categories';
        return axiosClient.post(url, data);
    },

    // Cập nhật category
    updateCategory: (categoryId, data) => {
        const url = `/categories/${categoryId}`;
        return axiosClient.patch(url, data);
    },

    // Xóa mềm category
    deleteCategory: (categoryId) => {
        const url = `/categories/${categoryId}`;
        return axiosClient.delete(url);
    },

    // Lấy categories active (nếu có API riêng)
    getActiveCategories: () => {
        const url = '/categories/active';
        return axiosClient.get(url);
    },
};

export default categoryApi;
