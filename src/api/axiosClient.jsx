// src/api/axiosClient.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/Store/api';

// main axios client used by app
const axiosClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// a plain axios instance WITHOUT interceptors to call refresh token endpoint
const refreshClient = axios.create({
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

async function refreshToken() {
    try {
        const resp = await refreshClient.post('/auth/refresh', {});
        const newAccessToken = resp.data?.result?.token || resp.data?.accessToken || resp.data?.token;
        if (newAccessToken) {
            localStorage.setItem('access_token', newAccessToken);
            return newAccessToken;
        }
        return null;
    } catch (e) {
        localStorage.removeItem('access_token');
        return null;
    }
}

axiosClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const { config, response } = error;

        // Không xử lý nếu không có response (network error)

        if (!response) return Promise.reject(error);
        const isPublicEndpoint =
            config.url &&
            (config.url.includes('/reviews/public/') ||
                config.url.includes('/products/public/') ||
                config.url.includes('/categories/public/'));

        // Chỉ xử lý 401 và chưa retry
        if (response.status === 401 && !config._retry && !isPublicEndpoint) {
            // QUAN TRỌNG: Không refresh token nếu người dùng chưa đăng nhập
            const token = localStorage.getItem('access_token');
            if (!token) {
                // Người dùng là khách, không cần refresh, chỉ reject error
                return Promise.reject(error);
            }

            config._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const newToken = await refreshToken();
                    isRefreshing = false;

                    if (newToken) {
                        onRefreshed(newToken);
                    } else {
                        onRefreshed(null);
                    }
                } catch (e) {
                    isRefreshing = false;
                    onRefreshed(null);
                }
            }

            return new Promise((resolve, reject) => {
                addSubscriber((token) => {
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                        resolve(axiosClient(config));
                    } else {
                        // CHỈ chuyển hướng nếu đang ở trang yêu cầu authentication
                        // và có token trước đó (đã từng đăng nhập)
                        const currentPath = window.location.pathname;
                        const isAuthPage = currentPath === '/login' || currentPath === '/register';

                        if (!isAuthPage) {
                            // Lưu trang hiện tại để redirect back sau khi login
                            localStorage.setItem('redirectPath', currentPath);
                            window.location.href = '/login';
                        }
                        reject(error);
                    }
                });
            });
        }

        return Promise.reject(error);
    },
);

export default axiosClient;
