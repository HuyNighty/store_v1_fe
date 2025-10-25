import axiosClient from './axiosClient';

const cartApi = {
    // Lấy tất cả items trong giỏ hàng của user
    getCartItems: () => axiosClient.get('/cart-items/me/items'),

    // Thêm sản phẩm vào giỏ hàng
    addToCart: (payload) => axiosClient.post('/cart-items/me/items', payload),

    // Cập nhật số lượng sản phẩm theo productId
    updateCartItem: (productId, payload) => axiosClient.patch(`/cart-items/me/items/${productId}`, payload),

    // Xóa sản phẩm khỏi giỏ hàng theo productId
    removeFromCart: (productId) => axiosClient.delete(`/cart-items/me/items/${productId}`),

    // Xóa toàn bộ giỏ hàng
    clearCart: () => axiosClient.delete('/cart-items/me/clear'),

    // Lấy số lượng items trong cart (cho badge)
    getCartItemCount: () => axiosClient.get('/cart-items/me/items/count'),
};

export default cartApi;
