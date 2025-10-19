import axiosClient from './axiosClient';

const authApi = {
    login: (payload) => axiosClient.post('/auth/login', payload, { withCredentials: true }), 
    refresh: () => axiosClient.post('/auth/refresh', {}, { withCredentials: true }),
    logout: () => axiosClient.post('/auth/logout', {}, { withCredentials: true }),
    me: () => axiosClient.get('/auth/user-info'),
};

export default authApi;
