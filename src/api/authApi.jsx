import axiosClient from './axiosClient';

const authApi = {
    register: (payload) => axiosClient.post('/auth/register', payload),
    login: (payload) => axiosClient.post('/auth/login', payload, { withCredentials: true }),
    refresh: () => axiosClient.post('/auth/refresh', {}, { withCredentials: true }),
    logout: () =>
        axiosClient.post(
            '/auth/logout',
            {},
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            },
        ),
    me: () => axiosClient.get('/auth/user-info'),
    info: () => axiosClient.get('/auth/my-info'),
};

export default authApi;
