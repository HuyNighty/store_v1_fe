import axiosClient from './axiosClient';

const base = '/categories';

const unwrap = (res) => {
    const payload = res?.data ?? res;
    return payload?.result ?? payload;
};

const categoryApi = {
    getAllPublic: () => axiosClient.get(`${base}/public`).then(unwrap),

    getAllAdmin: () => axiosClient.get(base).then(unwrap),

    getByCategoryName: (categoryName) => axiosClient.get(`${base}/public/${categoryName}`).then(unwrap),

    getById: (categoryId) => axiosClient.get(`${base}/${categoryId}`).then(unwrap),

    create: (data) => axiosClient.post(base, data).then(unwrap),

    update: (categoryId, data) => axiosClient.patch(`${base}/${categoryId}`, data).then(unwrap),

    delete: (categoryId) =>
        axiosClient.delete(`${base}/${categoryId}`).then((res) => {
            const payload = res?.data ?? res;
            return payload;
        }),

    getActive: () => axiosClient.get(`${base}/active`).then(unwrap),
};

export default categoryApi;
