import axiosClient from '../api/axiosClient';

export async function uploadAsset(file) {
    if (!file) throw new Error('No file provided for upload');

    const formData = new FormData();
    formData.append('file', file);

    // eslint-disable-next-line no-useless-catch
    try {
        const res = await axiosClient.post('/api/assets/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        // điều chỉnh theo response backend (chấp nhận { result: {...} } hoặc trực tiếp {...})
        const payload = res?.data?.result ?? res?.data;
        if (!payload) throw new Error('Upload response không đúng định dạng');

        return payload;
    } catch (err) {
        // ném error để caller quyết định
        throw err;
    }
}

export function normalizeRequest(req) {
    return {
        ...req,
        price: req.price !== undefined ? Number(req.price) : undefined,
        salePrice: req.salePrice !== undefined ? Number(req.salePrice) : undefined,
        stockQuantity: req.stockQuantity !== undefined ? Number(req.stockQuantity) : undefined,
        weightG: req.weightG !== undefined ? Number(req.weightG) : undefined,
        categoryIds: Array.isArray(req.categoryIds) ? req.categoryIds.map((id) => Number(id)) : req.categoryIds,
    };
}

export async function createFullBook(fullBookRequest, file = null) {
    try {
        const reqCopy = { ...fullBookRequest };

        if (file) {
            try {
                const asset = await uploadAsset(file);
                // chỉ gán những trường asset nếu chưa có giá trị trong request
                reqCopy.url = reqCopy.url || asset.url;
                reqCopy.fileName = reqCopy.fileName || asset.fileName || file.name;
                reqCopy.mimeType = reqCopy.mimeType || asset.mimeType || file.type;
                reqCopy.width = reqCopy.width || (asset.width ? Number(asset.width) : undefined);
                reqCopy.height = reqCopy.height || (asset.height ? Number(asset.height) : undefined);
                reqCopy.sizeBytes = reqCopy.sizeBytes || (asset.sizeBytes ? Number(asset.sizeBytes) : file.size);
            } catch (uploadErr) {
                return {
                    success: false,
                    data: null,
                    message: 'Upload cover thất bại.',
                    error: uploadErr,
                    errorDetails: {
                        message: uploadErr?.message,
                        response: uploadErr?.response?.data,
                        status: uploadErr?.response?.status,
                    },
                };
            }
        }

        const payload = normalizeRequest(reqCopy);

        // Gọi API tạo sách — kiểm tra lại path với backend của bạn
        const res = await axiosClient.post('/api/full-books', payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        return {
            success: true,
            data: res?.data ?? null,
            message: 'Book created successfully',
        };
    } catch (err) {
        const errorInfo = {
            message: err?.message,
            response: err?.response?.data,
            status: err?.response?.status,
            statusText: err?.response?.statusText,
        };

        return {
            success: false,
            data: null,
            message: err?.response?.data?.message || 'Failed to create book',
            error: err,
            errorDetails: errorInfo,
        };
    }
}

export const validateFullBookCreation = (fullBookRequest) => {
    const errors = [];

    if (!fullBookRequest) {
        errors.push('Dữ liệu rỗng.');
        return { isValid: false, errors };
    }

    if (!String(fullBookRequest.productName ?? '').trim()) errors.push('Product name is required.');
    if (!String(fullBookRequest.sku ?? '').trim()) errors.push('SKU is required.');
    if (!String(fullBookRequest.slug ?? '').trim()) errors.push('Slug is required.');

    // slug chỉ chứa lowercase letters, numbers, dashes
    if (fullBookRequest.slug && !/^[a-z0-9-]+$/.test(fullBookRequest.slug)) {
        errors.push('Slug must contain only lowercase letters, numbers and dashes.');
    }

    // price: >= 0 (match backend @DecimalMin("0.0"))
    if (fullBookRequest.price === undefined || fullBookRequest.price === null || fullBookRequest.price === '') {
        errors.push('Price is required.');
    } else if (isNaN(Number(fullBookRequest.price)) || Number(fullBookRequest.price) < 0) {
        errors.push('Price must be a number >= 0.');
    }

    // categoryIds: backend @NotNull -> đảm bảo mảng có phần tử
    if (!Array.isArray(fullBookRequest.categoryIds) || fullBookRequest.categoryIds.length === 0) {
        errors.push('Please choose at least one category.');
    }

    // optional: url nếu có phải là URL hợp lệ
    if (fullBookRequest.url) {
        try {
            new URL(fullBookRequest.url);
        } catch (_) {
            errors.push('Cover URL is not valid.');
        }
    }

    return { isValid: errors.length === 0, errors };
};

export async function updateFullBook(productId, fullBookRequest, file = null) {
    if (!productId) {
        return {
            success: false,
            message: 'Missing productId for update',
            error: { message: 'Missing productId' },
        };
    }

    try {
        const reqCopy = { ...fullBookRequest };

        if (file) {
            try {
                const asset = await uploadAsset(file);
                reqCopy.url = reqCopy.url || asset.url;
                reqCopy.fileName = reqCopy.fileName || asset.fileName || file.name;
                reqCopy.mimeType = reqCopy.mimeType || asset.mimeType || file.type;
                reqCopy.width = reqCopy.width || (asset.width ? Number(asset.width) : undefined);
                reqCopy.height = reqCopy.height || (asset.height ? Number(asset.height) : undefined);
                reqCopy.sizeBytes = reqCopy.sizeBytes || (asset.sizeBytes ? Number(asset.sizeBytes) : file.size);
            } catch (uploadErr) {
                return {
                    success: false,
                    message: 'Upload cover thất bại.',
                    error: uploadErr,
                    errorDetails: {
                        message: uploadErr?.message,
                        response: uploadErr?.response?.data,
                        status: uploadErr?.response?.status,
                    },
                };
            }
        }

        const payload = normalizeRequest(reqCopy);

        const res = await axiosClient.patch(`/api/full-books/${productId}`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        return {
            success: true,
            data: res?.data ?? null,
            message: 'Book updated successfully',
        };
    } catch (err) {
        const errorInfo = {
            message: err?.message,
            response: err?.response?.data,
            status: err?.response?.status,
            statusText: err?.response?.statusText,
        };

        return {
            success: false,
            data: null,
            message: err?.response?.data?.message || 'Failed to update book',
            error: err,
            errorDetails: errorInfo,
        };
    }
}

export default {
    createFullBook,
    updateFullBook,
    validateFullBookCreation,
    uploadAsset,
    normalizeRequest,
};
