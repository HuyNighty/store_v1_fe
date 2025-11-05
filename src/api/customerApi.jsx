// src/api/customerApi.js
import axiosClient from './axiosClient';

const customerApi = {
    // Lấy tất cả customers (Admin)
    getAllCustomers: () => {
        const url = '/customers';
        return axiosClient.get(url);
    },

    // Lấy chi tiết customer theo ID
    getCustomerById: (customerId) => {
        const url = `/customers/${customerId}`;
        return axiosClient.get(url);
    },

    // Cập nhật customer
    updateCustomer: (customerId, data) => {
        const url = `/customers/${customerId}`;
        return axiosClient.patch(url, data);
    },

    getCustomerByUserId: (userId) => {
        const url = `/customers/by-user/${userId}`;
        return axiosClient.get(url);
    },

    // Lấy thông tin customer của user hiện tại
    getMyProfile: () => {
        const url = '/customers/me';
        return axiosClient.get(url);
    },

    // Upload ảnh đại diện
    uploadProfileImage: (file) => {
        const url = '/customers/profile-image';
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Xóa ảnh đại diện
    removeProfileImage: () => {
        const url = '/customers/profile-image';
        return axiosClient.delete(url);
    },
};

export default customerApi;
