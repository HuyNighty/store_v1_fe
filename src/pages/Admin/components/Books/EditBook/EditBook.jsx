// src/components/Admin/Books/EditBook.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './EditBook.module.scss';
import { updateFullBook } from '../../../../../utils/fullBookApi';
import BookForm from '../BookForm';
import categoryApi from '../../../../../api/categoryApi';
import adminApi from '../../../../../api/adminApi';
import Button from '../../../../../Layouts/components/Button';

const cx = classNames.bind(styles);

export default function EditBook({ productId: propProductId, initialData: propInitialData, onSaved = null }) {
    const { productId: urlProductId } = useParams();
    const location = useLocation();

    const [categories, setCategories] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const finalProductId = propProductId || urlProductId;
    const finalInitialData = propInitialData || location.state?.initialData || location.state?.book;

    const getValidProductId = (id) => {
        if (!id) return null;
        if (typeof id === 'string' && (id === 'undefined' || id === 'null' || id.trim() === '')) {
            return null;
        }
        const parsedId = parseInt(id);
        if (isNaN(parsedId) || parsedId <= 0) {
            return null;
        }
        return parsedId;
    };

    const validProductId = getValidProductId(finalProductId);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await categoryApi.getAllCategories();
                setCategories(res.data.result.filter((c) => c.isActive));
            } catch (err) {
                console.error('Failed to load categories', err);
                setError('Không thể tải danh sách danh mục');
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (finalInitialData) {
            setData(finalInitialData);
            return;
        }

        if (!validProductId) {
            setError(`ID sách không hợp lệ: "${finalProductId}"`);
            return;
        }

        const loadBookData = async () => {
            setLoadingInitial(true);
            setError(null);
            try {
                const res = await adminApi.getFullBook(validProductId);
                const payload = res?.data?.result ?? res?.data;
                setData(payload);
            } catch (err) {
                console.error('Failed to fetch product', err);
                setError('Không thể tải thông tin sách');
            } finally {
                setLoadingInitial(false);
            }
        };
        loadBookData();
    }, [finalInitialData, validProductId, finalProductId]);

    const mapServerErrors = (err) => {
        const resp = err?.response?.data ?? err?.response ?? err;
        if (!resp) return { _server: 'Lỗi máy chủ không xác định' };
        if (resp?.result && typeof resp.result === 'object') return resp.result;
        if (resp?.errors && typeof resp.errors === 'object') return resp.errors;
        if (resp?.fieldErrors && typeof resp.fieldErrors === 'object') return resp.fieldErrors;
        if (resp?.message) return { _server: resp.message };
        return { _server: 'Đã xảy ra lỗi. Vui lòng thử lại.' };
    };

    const validatePartialPayload = (payload) => {
        const errors = [];
        if (payload.slug != null && payload.slug !== '') {
            if (!/^[a-z0-9-]+$/.test(String(payload.slug))) {
                errors.push('Slug chỉ được chứa chữ thường, số và dấu gạch ngang.');
            }
        }
        if (payload.price != null && payload.price !== '') {
            if (isNaN(Number(payload.price)) || Number(payload.price) < 0) {
                errors.push('Giá phải là số lớn hơn hoặc bằng 0.');
            }
        }
        if (payload.salePrice != null && payload.salePrice !== '') {
            if (isNaN(Number(payload.salePrice)) || Number(payload.salePrice) < 0) {
                errors.push('Giá khuyến mãi phải là số lớn hơn hoặc bằng 0.');
            }
        }
        if (payload.stockQuantity != null && payload.stockQuantity !== '') {
            if (isNaN(Number(payload.stockQuantity)) || Number(payload.stockQuantity) < 0) {
                errors.push('Số lượng tồn kho phải là số nguyên không âm.');
            }
        }
        if (payload.weightG != null && payload.weightG !== '') {
            if (isNaN(Number(payload.weightG)) || Number(payload.weightG) < 0) {
                errors.push('Trọng lượng phải là số lớn hơn hoặc bằng 0.');
            }
        }
        if (payload.url != null && payload.url !== '') {
            try {
                new URL(String(payload.url));
            } catch (_) {
                errors.push('URL ảnh bìa không hợp lệ.');
            }
        }
        return errors;
    };

    const handleSubmit = async (payload, file, helpers = {}) => {
        const { setMessage, setFieldErrors } = helpers;

        if (!validProductId) {
            const errorMsg = `Lỗi: ID sách không hợp lệ ("${finalProductId}"). Không thể cập nhật.`;
            if (typeof setMessage === 'function') {
                setMessage(errorMsg);
            }
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const validationErrors = validatePartialPayload(payload);
            if (validationErrors.length > 0) {
                if (typeof setMessage === 'function') {
                    setMessage('Lỗi định dạng: ' + validationErrors.join(' | '));
                }
                setLoading(false);
                return;
            }

            const cleanPayload = Object.fromEntries(
                Object.entries(payload).filter(([_, value]) => {
                    if (value === null || value === undefined || value === '') return false;
                    if (Array.isArray(value) && value.length === 0) return false;
                    return true;
                }),
            );

            if (Object.keys(cleanPayload).length === 0 && !file) {
                if (typeof setMessage === 'function') {
                    setMessage('Không có thay đổi nào để cập nhật.');
                }
                setLoading(false);
                return;
            }

            const result = await updateFullBook(validProductId, cleanPayload, file);

            if (result.success) {
                setSuccess(true);
                if (typeof setMessage === 'function') {
                    setMessage('Cập nhật sách thành công!');
                }
                if (result.data) {
                    const updatedData = result.data.result ?? result.data;
                    setData(updatedData);
                    if (typeof onSaved === 'function') {
                        onSaved(updatedData);
                    }
                }
            } else {
                const serverResp =
                    result.errorDetails?.response ?? result.error?.response ?? result.errorDetails ?? null;
                if (serverResp && typeof serverResp === 'object') {
                    const maybeFieldErrors =
                        serverResp.fieldErrors ?? serverResp.errors ?? serverResp.result ?? serverResp;
                    if (maybeFieldErrors && typeof maybeFieldErrors === 'object' && !Array.isArray(maybeFieldErrors)) {
                        if (typeof setFieldErrors === 'function') {
                            setFieldErrors(maybeFieldErrors);
                        }
                        if (typeof setMessage === 'function' && serverResp.message) {
                            setMessage(serverResp.message);
                        }
                    } else {
                        if (typeof setMessage === 'function') {
                            setMessage(result.message || serverResp.message || 'Cập nhật thất bại');
                        }
                    }
                } else {
                    if (typeof setMessage === 'function') {
                        setMessage(result.message || 'Cập nhật thất bại');
                    }
                }
            }
        } catch (err) {
            console.error('Update error', err);
            const mapped = mapServerErrors(err);
            if (mapped && typeof mapped === 'object' && !Array.isArray(mapped)) {
                if (typeof setFieldErrors === 'function') {
                    setFieldErrors(mapped);
                }
                if (typeof setMessage === 'function') {
                    setMessage(mapped._server ?? 'Cập nhật thất bại.');
                }
            } else {
                if (typeof setMessage === 'function') {
                    setMessage(String(mapped || 'Cập nhật thất bại.'));
                }
            }
            setError('Đã xảy ra lỗi khi cập nhật sách');
        } finally {
            setLoading(false);
        }
    };

    if (!validProductId && !data) {
        return (
            <div className={cx('root')}>
                <div className={cx('center')}>
                    <div className={cx('errorIcon')}>📚</div>
                    <h2 className={cx('errorTitle')}>Không tìm thấy sách</h2>
                    <p className={cx('errorText')}>
                        ID sách không hợp lệ: "{finalProductId}". Vui lòng kiểm tra lại đường dẫn.
                    </p>
                    <div className={cx('actionsRow')}>
                        <button onClick={() => window.location.reload()} className={cx('btn', 'btnPrimary')}>
                            🔄 Thử lại
                        </button>
                        <button onClick={() => window.history.back()} className={cx('btn', 'btnSecondary')}>
                            ← Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loadingInitial && !data) {
        return (
            <div className={cx('root')}>
                <div className={cx('center')}>
                    <div className={cx('spinner')} />
                    <p className={cx('loadingText')}>Đang tải thông tin sách...</p>
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className={cx('root')}>
                <div className={cx('center')}>
                    <div className={cx('errorIcon')}>⚠️</div>
                    <h2 className={cx('errorTitle')}>Lỗi tải dữ liệu</h2>
                    <p className={cx('errorText')}>{error}</p>
                    <div className={cx('actionsRow')}>
                        <button onClick={() => window.location.reload()} className={cx('btn', 'btnPrimary')}>
                            🔄 Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('root')}>
            <div className={cx('header')}>
                <Button to="/">Quay về</Button>

                <h1 className={cx('headerTitle')}>Chỉnh sửa Sách</h1>
            </div>

            {success && <div className={cx('alert', 'success')}>✅ Cập nhật sách thành công!</div>}

            {error && <div className={cx('alert', 'error')}>❌ {error}</div>}

            <div className={cx('formContainer')}>
                {loading && (
                    <div className={cx('loadingOverlay')}>
                        <div className={cx('spinner')} />
                    </div>
                )}

                <BookForm
                    mode="edit"
                    initialData={data}
                    categories={categories}
                    onSubmit={handleSubmit}
                    submitting={loading || loadingInitial}
                />
            </div>
        </div>
    );
}
