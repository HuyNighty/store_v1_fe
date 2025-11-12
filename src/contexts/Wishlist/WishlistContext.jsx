import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useToast } from '../Toast/ToastContext';

const WishlistContext = createContext();

// Action types
const WISHLIST_ACTIONS = {
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    CLEAR_WISHLIST: 'CLEAR_WISHLIST',
    LOAD_WISHLIST: 'LOAD_WISHLIST',
    SET_LOADING: 'SET_LOADING',
};

// Reducer function
const wishlistReducer = (state, action) => {
    switch (action.type) {
        case WISHLIST_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload,
            };

        case WISHLIST_ACTIONS.LOAD_WISHLIST:
            return {
                ...state,
                items: action.payload,
                loading: false,
            };

        case WISHLIST_ACTIONS.ADD_ITEM:
            // Kiểm tra xem sản phẩm đã có trong wishlist chưa
            const existingItem = state.items.find((item) => item.productId === action.payload.productId);
            if (existingItem) {
                return state; // Đã tồn tại, không thêm lại
            }

            const newItem = {
                ...action.payload,
                addedAt: new Date().toISOString(),
            };

            return {
                ...state,
                items: [newItem, ...state.items],
            };

        case WISHLIST_ACTIONS.REMOVE_ITEM:
            return {
                ...state,
                items: state.items.filter((item) => item.productId !== action.payload),
            };

        case WISHLIST_ACTIONS.CLEAR_WISHLIST:
            return {
                ...state,
                items: [],
            };

        default:
            return state;
    }
};

// Initial state
const initialState = {
    items: [],
    loading: false,
};

export const WishlistProvider = ({ children }) => {
    const [state, dispatch] = useReducer(wishlistReducer, initialState);
    const { addToast } = useToast();

    // Load wishlist từ localStorage khi component mount
    useEffect(() => {
        loadWishlistFromStorage();
    }, []);

    // Lưu wishlist vào localStorage mỗi khi items thay đổi
    useEffect(() => {
        saveWishlistToStorage();
    }, [state.items]);

    const loadWishlistFromStorage = () => {
        try {
            dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
            const savedWishlist = localStorage.getItem('wishlist');
            if (savedWishlist) {
                const parsedWishlist = JSON.parse(savedWishlist);
                dispatch({ type: WISHLIST_ACTIONS.LOAD_WISHLIST, payload: parsedWishlist });
            }
        } catch (error) {
            console.error('Error loading wishlist from storage:', error);
            dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false });
        }
    };

    const saveWishlistToStorage = () => {
        try {
            localStorage.setItem('wishlist', JSON.stringify(state.items));
        } catch (error) {
            console.error('Error saving wishlist to storage:', error);
        }
    };

    // Thêm sản phẩm vào wishlist
    const addToWishlist = (product) => {
        try {
            dispatch({
                type: WISHLIST_ACTIONS.ADD_ITEM,
                payload: product,
            });
            return { success: true, message: 'Đã thêm vào danh sách yêu thích' };
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            return { success: false, error: 'Không thể thêm vào danh sách yêu thích' };
        }
    };

    // Xóa sản phẩm khỏi wishlist
    const removeFromWishlist = (productId) => {
        try {
            dispatch({
                type: WISHLIST_ACTIONS.REMOVE_ITEM,
                payload: productId,
            });
            return { success: true, message: 'Đã xóa khỏi danh sách yêu thích' };
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            return { success: false, error: 'Không thể xóa khỏi danh sách yêu thích' };
        }
    };

    // Xóa toàn bộ wishlist
    const clearWishlist = () => {
        try {
            dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
            return { success: true, message: 'Đã xóa toàn bộ danh sách yêu thích' };
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            return { success: false, error: 'Không thể xóa danh sách yêu thích' };
        }
    };

    // Kiểm tra xem sản phẩm có trong wishlist không
    const isInWishlist = (productId) => {
        return state.items.some((item) => item.productId === productId);
    };

    // Lấy số lượng sản phẩm trong wishlist
    const getWishlistCount = () => {
        return state.items.length;
    };

    // Lấy tất cả sản phẩm trong wishlist
    const getWishlistItems = () => {
        return state.items;
    };

    // Di chuyển sản phẩm từ wishlist sang cart (nếu cần)
    const moveToCart = (productId, quantity = 1) => {
        const item = state.items.find((item) => item.productId === productId);
        if (item) {
            removeFromWishlist(productId);
            return item; // Trả về sản phẩm để thêm vào cart
        }
        return null;
    };

    const value = {
        items: state.items,
        loading: state.loading,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        getWishlistCount,
        getWishlistItems,
        moveToCart,
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

// Custom hook để sử dụng wishlist context
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export default WishlistContext;
