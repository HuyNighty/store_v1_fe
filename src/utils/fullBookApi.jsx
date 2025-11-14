import adminApi from '../api/adminApi';

export const createFullBook = async (payload, file) => {
    try {
        // Handle file upload logic here if needed
        const response = await adminApi.createFullBook(payload);
        return {
            success: true,
            data: response.data,
            message: 'Tạo sách thành công',
        };
    } catch (error) {
        return {
            success: false,
            error: error,
            message: error.response?.data?.message || 'Không thể tạo sách',
            errorDetails: error.response?.data,
        };
    }
};

export const updateFullBook = async (productId, payload, file) => {
    try {
        // Handle file upload logic here if needed
        const response = await adminApi.updateFullBook(productId, payload);
        return {
            success: true,
            data: response.data,
            message: 'Cập nhật sách thành công',
        };
    } catch (error) {
        return {
            success: false,
            error: error,
            message: error.response?.data?.message || 'Không thể cập nhật sách',
            errorDetails: error.response?.data,
        };
    }
};
