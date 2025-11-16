import axiosClient from './axiosClient';

const reviewApi = {
    //USER role
    createReview: (productId, reviewData) => {
        const url = `/reviews/products/${productId}`;
        return axiosClient.post(url, reviewData);
    },

    updateReview: (reviewId, reviewData) => {
        const url = `/reviews/${reviewId}`;
        return axiosClient.patch(url, reviewData);
    },

    deleteReview: (reviewId) => {
        const url = `/reviews/${reviewId}`;
        return axiosClient.delete(url);
    },

    getMyReviews: () => {
        const url = '/reviews/me';
        return axiosClient.get(url);
    },

    //ADMIN role
    getReviewsByProductAdmin: (productId) => {
        const url = `/reviews/products/${productId}`;
        return axiosClient.get(url);
    },

    approveReview: (reviewId) => {
        const url = `/reviews/admin/${reviewId}/approve`;
        return axiosClient.patch(url);
    },

    deleteReviewAsAdmin: (reviewId) => {
        const url = `/reviews/admin/${reviewId}`;
        return axiosClient.delete(url);
    },

    getReviewsByProduct: (productId) => {
        const url = `/reviews/public/products/${productId}`;
        return axiosClient.get(url);
    },
};

export default reviewApi;
