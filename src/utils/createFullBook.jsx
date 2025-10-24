// src/utils/createFullBook.js
import axiosClient from '../api/axiosClient';

/**
 * Create a full book with all related entities in one API call
 */
export async function createFullBook(fullBookRequest) {
    try {
        console.log('📚 Creating full book with single API call:', fullBookRequest);

        const response = await axiosClient.post('/full-books', fullBookRequest);
        console.log('✅ Full book created successfully:', response.data);

        return {
            success: true,
            data: response.data,
            message: 'Book created successfully',
        };
    } catch (error) {
        console.error('❌ Failed to create full book:', error);

        const errorInfo = {
            message: error?.message,
            response: error?.response?.data,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
        };

        return {
            success: false,
            error: error,
            errorDetails: errorInfo,
            message: error.response?.data?.message || 'Failed to create book',
        };
    }
}

/**
 * Validation for full book creation
 */
export const validateFullBookCreation = (fullBookRequest) => {
    const errors = [];

    // Product validation
    if (!fullBookRequest?.productName?.trim()) {
        errors.push('Product name is required');
    }
    if (!fullBookRequest?.sku?.trim()) {
        errors.push('SKU is required');
    }
    if (!fullBookRequest?.slug?.trim()) {
        errors.push('Slug is required');
    }
    if (!fullBookRequest?.slug?.match(/^[a-z0-9-]+$/)) {
        errors.push('Slug must contain only lowercase letters, numbers and dashes');
    }
    if (!fullBookRequest?.price || parseFloat(fullBookRequest.price) <= 0) {
        errors.push('Valid price greater than 0 is required');
    }

    // Asset validation (if url provided)
    if (fullBookRequest.url && !fullBookRequest.url.match(/^https?:\/\/.+/)) {
        errors.push('Cover URL must be a valid URL');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export default createFullBook;
