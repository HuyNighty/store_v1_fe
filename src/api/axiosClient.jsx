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
    // call refresh endpoint with plain refreshClient to avoid recursion
    try {
        const resp = await refreshClient.post('/auth/refresh', {}); // adjust payload if backend expects refresh token body
        const newAccessToken = resp.data?.result?.token || resp.data?.accessToken || resp.data?.token;
        if (newAccessToken) {
            localStorage.setItem('access_token', newAccessToken);
            return newAccessToken;
        }
        return null;
    } catch (e) {
        // refresh failed
        localStorage.removeItem('access_token');
        return null;
    }
}

axiosClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const { config, response } = error;
        if (!response) return Promise.reject(error);

        // if 401 and not retried yet
        if (response.status === 401 && !config._retry) {
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

            // wait for refreshed token
            return new Promise((resolve, reject) => {
                addSubscriber((token) => {
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                        resolve(axiosClient(config));
                    } else {
                        // redirect to login if no token
                        window.location.href = '/login';
                        reject(error);
                    }
                });
            });
        }

        return Promise.reject(error);
    },
);

export default axiosClient;
