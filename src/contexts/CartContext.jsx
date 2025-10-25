import React, { createContext, useState, useContext, useEffect } from 'react';
import cartApi from '../api/cartApi';

// Tạo context
const CartContext = createContext();

// Custom hook để sử dụng context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// Provider component
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch cart items
    const fetchCartItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await cartApi.getCartItems();
            console.log('Cart API Response:', response); // Debug log

            if (response.data && response.data.result) {
                setCartItems(response.data.result);
            } else {
                setCartItems([]);
            }
        } catch (err) {
            console.error('Error fetching cart items:', err);
            setError('Không thể tải giỏ hàng');
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Add to cart
    const addToCart = async (productId, quantity) => {
        try {
            console.log('Adding to cart:', { productId, quantity }); // Debug log
            const response = await cartApi.addToCart({ productId, quantity });

            if (response.data) {
                await fetchCartItems(); // Refresh cart
                return {
                    success: true,
                    message: response.data.message || 'Đã thêm vào giỏ hàng!',
                };
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            const errorMessage = err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng';
            return { success: false, error: errorMessage };
        }
    };

    // Update cart item
    const updateCartItem = async (productId, quantity) => {
        try {
            console.log('Updating cart item:', { productId, quantity }); // Debug log
            const response = await cartApi.updateCartItem(productId, { quantity });

            if (response.data) {
                await fetchCartItems(); // Refresh cart
                return {
                    success: true,
                    message: response.data.message || 'Đã cập nhật giỏ hàng!',
                };
            }
        } catch (err) {
            console.error('Error updating cart:', err);
            const errorMessage = err.response?.data?.message || 'Lỗi khi cập nhật giỏ hàng';
            return { success: false, error: errorMessage };
        }
    };

    // Remove from cart
    const removeFromCart = async (productId) => {
        try {
            console.log('Removing from cart:', productId); // Debug log
            const response = await cartApi.removeFromCart(productId);

            if (response.data) {
                await fetchCartItems(); // Refresh cart
                return {
                    success: true,
                    message: response.data.message || 'Đã xóa khỏi giỏ hàng!',
                };
            }
        } catch (err) {
            console.error('Error removing from cart:', err);
            const errorMessage = err.response?.data?.message || 'Lỗi khi xóa khỏi giỏ hàng';
            return { success: false, error: errorMessage };
        }
    };

    // Clear cart
    const clearCart = async () => {
        try {
            console.log('Clearing cart via API'); // Debug log
            const response = await cartApi.clearCart();
            if (response.data) {
                await fetchCartItems(); // Refresh cart
                return { success: true, message: 'Đã xóa toàn bộ giỏ hàng!' };
            }
        } catch (err) {
            console.error('Error clearing cart:', err);
            return {
                success: false,
                error: err.response?.data?.message || 'Lỗi khi xóa giỏ hàng',
            };
        }
    };

    // Helper functions
    const getTotalPrice = () => {
        if (!cartItems || !Array.isArray(cartItems)) return 0;

        return cartItems.reduce((total, item) => {
            if (!item || typeof item.totalPrice !== 'number') return total;
            return total + item.totalPrice;
        }, 0);
    };

    const getTotalItems = () => {
        if (!cartItems || !Array.isArray(cartItems)) return 0;

        return cartItems.reduce((total, item) => {
            if (!item || typeof item.quantity !== 'number') return total;
            return total + item.quantity;
        }, 0);
    };

    const isItemInCart = (productId) => {
        if (!cartItems || !Array.isArray(cartItems)) return false;
        return cartItems.some((item) => item && item.productId === productId);
    };

    const getItemQuantity = (productId) => {
        if (!cartItems || !Array.isArray(cartItems)) return 0;
        const item = cartItems.find((item) => item && item.productId === productId);
        return item ? item.quantity : 0;
    };

    // Fetch cart on mount
    useEffect(() => {
        fetchCartItems();
    }, []);

    const value = {
        // State
        cartItems,
        loading,
        error,

        // Actions
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCartItems,

        // Getters
        getTotalPrice,
        getTotalItems,
        isItemInCart,
        getItemQuantity,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
