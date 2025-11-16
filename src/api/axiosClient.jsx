import axios from 'axios';

const BASE_URL = 'http://localhost:8080/Store/api';

const axiosClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

        if (!response) return Promise.reject(error);
        const isPublicEndpoint =
            config.url &&
            (config.url.includes('/reviews/public/') ||
                config.url.includes('/products/public/') ||
                config.url.includes('/categories/public/'));

        if (response.status === 401 && !config._retry && !isPublicEndpoint) {
            const token = localStorage.getItem('access_token');
            if (!token) {
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
                        const currentPath = window.location.pathname;
                        const isAuthPage = currentPath === '/login' || currentPath === '/register';

                        if (!isAuthPage) {
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
