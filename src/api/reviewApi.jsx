import axiosClient from './axiosClient';

const reviewApi = {
    // Tạo review mới
    createReview: (productId, reviewData) => {
        const url = `/reviews/products/${productId}`;
        return axiosClient.post(url, reviewData);
    },

    // Cập nhật review
    updateReview: (reviewId, reviewData) => {
        const url = `/reviews/${reviewId}`;
        return axiosClient.patch(url, reviewData);
    },

    // Xóa review
    deleteReview: (reviewId) => {
        const url = `/reviews/${reviewId}`;
        return axiosClient.delete(url);
    },

    // Lấy reviews của user hiện tại
    getMyReviews: () => {
        const url = '/reviews/me';
        return axiosClient.get(url);
    },

    // Lấy reviews theo product (admin)
    getReviewsByProduct: (productId) => {
        const url = `/reviews/products/${productId}`;
        return axiosClient.get(url);
    },

    // Duyệt review (admin)
    approveReview: (reviewId) => {
        const url = `/reviews/admin/${reviewId}/approve`;
        return axiosClient.patch(url);
    },

    // Xóa review (admin)
    deleteReviewAsAdmin: (reviewId) => {
        const url = `/reviews/admin/${reviewId}`;
        return axiosClient.delete(url);
    },
};

export default reviewApi;
