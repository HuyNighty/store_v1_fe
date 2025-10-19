import axios from 'axios';

const BASE_URL = 'http://localhost:8080/Store/api';

const axiosClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

let isRefreshing = false;
let subscribers = [];

function onRefreshed(newToken) {
    subscribers.forEach((cb) => cb(newToken));
    subscribers = [];
}
function addSubscriber(cb) {
    subscribers.push(cb);
}

axiosClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const { config, response } = error;
        if (!response) return Promise.reject(error);
        if (response.status === 401 && !config._retry) {
            config._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const refreshRes = await axiosClient.post('/auth/refresh', {});
                    const newAccessToken =
                        refreshRes.data?.result?.token || refreshRes.data?.accessToken || refreshRes.data?.token;
                    if (newAccessToken) {
                        localStorage.setItem('access_token', newAccessToken);
                        onRefreshed(newAccessToken);
                    }
                } catch (e) {
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                    return Promise.reject(e);
                } finally {
                    isRefreshing = false;
                }
            }

            return new Promise((resolve, reject) => {
                addSubscriber((token) => {
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                        resolve(axiosClient(config));
                    } else {
                        reject(error);
                    }
                });
            });
        }

        return Promise.reject(error);
    },
);

export default axiosClient;
