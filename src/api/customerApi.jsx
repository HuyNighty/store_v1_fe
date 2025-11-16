import axiosClient from './axiosClient';

//ADMIN role
const customerApi = {
    getAllCustomers: () => {
        const url = '/customers';
        return axiosClient.get(url);
    },

    getCustomerById: (customerId) => {
        const url = `/customers/${customerId}`;
        return axiosClient.get(url);
    },

    updateCustomer: (customerId, data) => {
        const url = `/customers/${customerId}`;
        return axiosClient.patch(url, data);
    },

    getCustomerByUserId: (userId) => {
        const url = `/customers/by-user/${userId}`;
        return axiosClient.get(url);
    },

    getMyProfile: () => {
        const url = '/customers/me';
        return axiosClient.get(url);
    },

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

    removeProfileImage: () => {
        const url = '/customers/profile-image';
        return axiosClient.delete(url);
    },
};

export default customerApi;
