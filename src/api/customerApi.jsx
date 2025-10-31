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
};

export default customerApi;
