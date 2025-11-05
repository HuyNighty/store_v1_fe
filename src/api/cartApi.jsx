import axiosClient from './axiosClient';

const cartApi = {
    getCartItems: () =>
        axiosClient.get('/cart-items/me/items').catch((error) => {
            if (error.response?.status === 401 && !localStorage.getItem('access_token')) {
                return { data: [] };
            }
            throw error;
        }),

    addToCart: (payload) =>
        axiosClient.post('/cart-items/me/items', payload).catch((error) => {
            if (error.response?.status === 401 && !localStorage.getItem('access_token')) {
                // Có thể redirect đến login hoặc throw error với message phù hợp
                throw new Error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            }
            throw error;
        }),

    updateCartItem: (productId, payload) =>
        axiosClient.patch(`/cart-items/me/items/${productId}`, payload).catch((error) => {
            if (error.response?.status === 401 && !localStorage.getItem('access_token')) {
                throw new Error('Vui lòng đăng nhập để cập nhật giỏ hàng');
            }
            throw error;
        }),

    removeFromCart: (productId) =>
        axiosClient.delete(`/cart-items/me/items/${productId}`).catch((error) => {
            if (error.response?.status === 401 && !localStorage.getItem('access_token')) {
                throw new Error('Vui lòng đăng nhập để xóa sản phẩm');
            }
            throw error;
        }),

    clearCart: () =>
        axiosClient.delete('/cart-items/me/clear').catch((error) => {
            if (error.response?.status === 401 && !localStorage.getItem('access_token')) {
                throw new Error('Vui lòng đăng nhập để xóa giỏ hàng');
            }
            throw error;
        }),

    getCartItemCount: () =>
        axiosClient.get('/cart-items/me/items/count').catch((error) => {
            // Nếu là 401 và không có token, trả về count = 0
            if (error.response?.status === 401 && !localStorage.getItem('access_token')) {
                return { data: 0 };
            }
            throw error;
        }),
};

export default cartApi;
