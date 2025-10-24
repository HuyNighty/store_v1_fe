// src/utils/createFullBook.js
import axiosClient from '../api/axiosClient';

/**
 * Utility functions for API responses
 */
const extractIdFromResponse = (response, idKeys = []) => {
    const data = response?.data ?? response;
    const result = data?.result ?? data;

    const possibleKeys = [...idKeys, 'id', 'Id', 'ID'];
    for (const key of possibleKeys) {
        if (result?.[key] != null) {
            return result[key];
        }
    }
    return null;
};

const handleApiError = (operation, error) => {
    console.error(`❌ ${operation} failed:`, error);
    return {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
    };
};

/**
 * Prepare requests according to backend DTOs
 */
const prepareProductRequest = (payload) => {
    // Convert string numbers to BigDecimal equivalents
    const productRequest = {
        sku: payload.sku,
        slug: payload.slug,
        productName: payload.productName,
        price: parseFloat(payload.price) || 0,
        salePrice: parseFloat(payload.salePrice) || 0,
        stockQuantity: parseInt(payload.stockQuantity) || 0,
        weightG: parseFloat(payload.weightG) || 0,
        isActive: payload.isActive !== undefined ? payload.isActive : true,
        featured: payload.featured !== undefined ? payload.featured : false,
    };

    console.log('🔄 Prepared product request:', productRequest);
    return productRequest;
};

const prepareAssetRequest = (payload) => {
    if (!payload.url) {
        throw new Error('Asset URL is required for asset creation');
    }

    // Basic URL validation
    try {
        new URL(payload.url);
    } catch (e) {
        throw new Error('Invalid URL format for asset');
    }

    const assetRequest = {
        url: payload.url,
        type: 'COVER', // Required by backend - using COVER as default
        fileName: payload.fileName || payload.url.split('/').pop() || 'image.jpg',
        mimeType: payload.mimeType || 'image/jpeg',
        width: payload.width || 0, // Required - default to 0
        height: payload.height || 0, // Required - default to 0
        sizeBytes: payload.sizeBytes || 1024, // Required - default to 1KB
    };

    console.log('🔄 Prepared asset request:', assetRequest);
    return assetRequest;
};

const prepareAuthorRequest = (payload) => {
    if (!payload.authorName) return null;

    const authorRequest = {
        authorName: payload.authorName,
        bio: payload.bio || '',
        bornDate: payload.bornDate || null,
        deathDate: payload.deathDate || null,
        nationality: payload.nationality || 'UNKNOWN', // Required - default value
        assetId: payload.assetId || null, // Required but can be null
    };

    console.log('🔄 Prepared author request:', authorRequest);
    return authorRequest;
};

/**
 * Core API operations - UPDATED WITH CORRECT DTOs
 */
const apiOperations = {
    // Product operations
    createProduct: async (payload) => {
        const productRequest = prepareProductRequest(payload);
        console.log('📦 Creating product with:', productRequest);

        const response = await axiosClient.post('/products', productRequest);
        const productId = extractIdFromResponse(response, ['productId', 'product_id']);
        console.log('✅ Product created with ID:', productId);
        return productId;
    },

    deleteProduct: async (productId) => {
        await axiosClient.delete(`/products/${productId}`);
    },

    // Asset operations - FIXED WITH ALL REQUIRED FIELDS
    // Cập nhật hàm createAsset trong createFullBook.js
    // Cập nhật hàm createAsset để bắt lỗi 500 chi tiết
    createAsset: async (payload) => {
        console.log('🖼️ Original asset payload:', payload);

        if (payload.file) {
            throw new Error('File upload not supported. Please use URL instead.');
        }

        if (!payload.url) {
            throw new Error('Cannot create asset: URL is required');
        }

        const assetRequest = prepareAssetRequest(payload);

        console.log('🔄 Sending asset request to backend:', JSON.stringify(assetRequest, null, 2));

        try {
            const response = await axiosClient.post('/assets', assetRequest);
            console.log('✅ Asset creation response:', response.data);

            const assetId = extractIdFromResponse(response, ['assetId', 'asset_id']);
            console.log('✅ Extracted asset ID:', assetId);

            return assetId;
        } catch (error) {
            console.error('❌ Asset creation failed with SERVER ERROR:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data,
                },
            });

            // In ra toàn bộ error object
            console.error('🔍 COMPLETE ERROR OBJECT:', error);
            console.error('🔍 ERROR STACK:', error.stack);

            // Kiểm tra xem có exception message từ backend không
            if (error.response?.data) {
                console.error('🔍 BACKEND ERROR DATA:', JSON.stringify(error.response.data, null, 2));
            }

            throw error;
        }
    },

    deleteAsset: async (assetId) => {
        await axiosClient.delete(`/assets/${assetId}`);
    },

    // Product-Asset linking - FIXED WITH CORRECT DTO
    linkProductAsset: async (productId, assetId) => {
        const linkPayload = {
            productId: productId,
            assetId: assetId,
            type: 'MAIN', // Required - using COVER as default
            ordinal: 0, // Required - default to 0
        };
        console.log('🔗 Linking product-asset:', linkPayload);
        await axiosClient.post('/product-assets', linkPayload);
        return true;
    },

    unlinkProductAsset: async (productId, assetId) => {
        await axiosClient.delete('/product-assets', {
            data: { productId, assetId },
        });
    },

    // Author operations - FIXED WITH ALL REQUIRED FIELDS
    createAuthor: async (payload) => {
        if (!payload.authorName) return null;

        const authorRequest = prepareAuthorRequest(payload);
        console.log('👤 Creating author with:', authorRequest);

        try {
            const response = await axiosClient.post('/authors', authorRequest);
            console.log('✅ Author creation response:', response.data);

            const authorId = extractIdFromResponse(response, ['authorId', 'author_id']);
            console.log('✅ Extracted author ID:', authorId);

            return authorId;
        } catch (error) {
            console.error('❌ Author creation failed with details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.response?.data?.message,
                validation: error.response?.data?.validation,
            });
            throw error;
        }
    },

    // Book-Author linking
    linkBookAuthor: async (productId, authorId) => {
        const linkPayload = {
            productId,
            authorId,
            authorRole: 'AUTHOR',
        };
        console.log('🔗 Linking book-author:', linkPayload);
        await axiosClient.post('/book-authors', linkPayload);
        return true;
    },

    unlinkBookAuthor: async (productId, authorId) => {
        await axiosClient.delete('/book-authors', {
            data: { productId, authorId },
        });
    },
};

/**
 * Rollback manager
 */
class RollbackManager {
    constructor() {
        this.operations = [];
    }

    addOperation(operation) {
        this.operations.push(operation);
    }

    async execute() {
        const errors = [];

        for (let i = this.operations.length - 1; i >= 0; i--) {
            const { operation, description, params } = this.operations[i];

            try {
                await operation(...params);
                console.log(`✅ Rollback: ${description}`);
            } catch (error) {
                const errorMsg = `Rollback ${description}: ${error.message}`;
                errors.push(errorMsg);
                console.warn(`⚠️ ${errorMsg}`);
            }
        }

        this.operations = [];
        return errors;
    }
}

/**
 * Enhanced validation based on backend DTOs
 */
export const validateBookCreation = ({ productPayload, assetPayload, authorPayload }) => {
    const errors = [];

    // Product validation
    if (!productPayload?.productName?.trim()) {
        errors.push('Product name is required');
    }
    if (!productPayload?.sku?.trim()) {
        errors.push('SKU is required');
    }
    if (!productPayload?.slug?.trim()) {
        errors.push('Slug is required');
    }
    if (!productPayload?.slug?.match(/^[a-z0-9-]+$/)) {
        errors.push('Slug must contain only lowercase letters, numbers and dashes');
    }
    if (!productPayload?.price || parseFloat(productPayload.price) <= 0) {
        errors.push('Valid price greater than 0 is required');
    }

    // Asset validation
    if (assetPayload) {
        if (assetPayload.file) {
            errors.push('File upload is not supported. Please use image URL instead.');
        }
        if (!assetPayload.url?.trim()) {
            errors.push('Asset URL is required when asset payload is provided');
        } else {
            try {
                new URL(assetPayload.url);
            } catch (e) {
                errors.push('Asset URL must be a valid URL');
            }
        }
    }

    // Author validation
    if (authorPayload?.authorName && !authorPayload?.nationality) {
        errors.push('Nationality is required when creating author');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Main createFullBook function
 */
export async function createFullBook({ productPayload, assetPayload = null, authorPayload = null }) {
    console.log('🎯 Starting createFullBook with:', {
        product: productPayload,
        asset: assetPayload ? { ...assetPayload, file: assetPayload.file ? '[FILE]' : null } : null,
        author: authorPayload,
    });

    // Pre-validation
    const validation = validateBookCreation({ productPayload, assetPayload, authorPayload });
    if (!validation.isValid) {
        console.error('❌ Validation failed:', validation.errors);
        return {
            success: false,
            error: new Error('Validation failed'),
            validationErrors: validation.errors,
            created: {},
        };
    }

    const state = {
        productId: null,
        assetId: null,
        authorId: null,
        productAssetLinked: false,
        bookAuthorLinked: false,
    };

    const rollbackManager = new RollbackManager();

    try {
        console.group('🚀 createFullBook - Process');

        // 1. Create Product
        console.log('📦 Step 1: Creating product...');
        state.productId = await apiOperations.createProduct(productPayload);

        if (!state.productId) {
            throw new Error('Failed to create product: No product ID returned');
        }

        rollbackManager.addOperation({
            operation: apiOperations.deleteProduct,
            description: `Delete product ${state.productId}`,
            params: [state.productId],
        });

        // 2. Create & Link Asset (if provided)
        if (assetPayload) {
            console.log('🖼️ Step 2: Creating asset...');
            state.assetId = await apiOperations.createAsset(assetPayload);

            if (state.assetId) {
                rollbackManager.addOperation({
                    operation: apiOperations.deleteAsset,
                    description: `Delete asset ${state.assetId}`,
                    params: [state.assetId],
                });

                // Link product with asset
                console.log('🔗 Step 2a: Linking product with asset...');
                state.productAssetLinked = await apiOperations.linkProductAsset(state.productId, state.assetId);

                rollbackManager.addOperation({
                    operation: apiOperations.unlinkProductAsset,
                    description: `Unlink product-asset ${state.productId}-${state.assetId}`,
                    params: [state.productId, state.assetId],
                });
            }
        }

        // 3. Create & Link Author (if provided)
        if (authorPayload?.authorName) {
            console.log('👤 Step 3: Creating author...');
            state.authorId = await apiOperations.createAuthor(authorPayload);

            if (state.authorId) {
                rollbackManager.addOperation({
                    operation: apiOperations.deleteAuthor,
                    description: `Delete author ${state.authorId}`,
                    params: [state.authorId],
                });

                // Link product with author
                console.log('🔗 Step 3a: Linking product with author...');
                state.bookAuthorLinked = await apiOperations.linkBookAuthor(state.productId, state.authorId);

                rollbackManager.addOperation({
                    operation: apiOperations.unlinkBookAuthor,
                    description: `Unlink book-author ${state.productId}-${state.authorId}`,
                    params: [state.productId, state.authorId],
                });
            }
        }

        console.groupEnd();

        console.log('🎉 createFullBook completed successfully:', state);
        return {
            success: true,
            created: { ...state },
            message: 'Book created successfully',
        };
    } catch (error) {
        console.groupEnd();

        const errorInfo = handleApiError('createFullBook', error);
        console.error('💥 Operation failed. Starting rollback...', errorInfo);

        // Execute rollback
        const rollbackErrors = await rollbackManager.execute();

        if (rollbackErrors.length > 0) {
            console.warn('⚠️ Rollback completed with errors:', rollbackErrors);
        } else {
            console.log('✅ Rollback completed successfully');
        }

        return {
            success: false,
            error: error,
            errorDetails: errorInfo,
            rollbackErrors: rollbackErrors.length > 0 ? rollbackErrors : undefined,
            created: { ...state },
        };
    }
}

export default createFullBook;
