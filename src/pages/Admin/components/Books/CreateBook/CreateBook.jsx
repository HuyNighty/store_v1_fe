import React, { useState, useEffect } from 'react';
import BookForm from '../BookForm';
import { createFullBook, validateFullBookCreation } from '../../../../../utils/createFullBook';
import categoryApi from '../../../../../api/categoryApi';

export default function CreateBook({ onSaved = null }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await categoryApi.getAllCategories();
                const active = res.data.result.filter((c) => c.isActive);
                setCategories(active);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        })();
    }, []);

    const handleSubmit = async (payload, file, helpers = {}) => {
        const { setMessage } = helpers;
        setLoading(true);
        try {
            const validation = validateFullBookCreation(payload);
            if (!validation.isValid) {
                if (typeof setMessage === 'function') setMessage('Validation failed: ' + validation.errors.join(', '));
                setLoading(false);
                return;
            }

            const result = await createFullBook(payload, file);
            if (result.success) {
                if (typeof setMessage === 'function') setMessage('Tạo sách thành công!');
                if (typeof onSaved === 'function') onSaved(result.data);
            } else {
                if (typeof setMessage === 'function') setMessage(result.message || 'Tạo thất bại');
            }
        } catch (err) {
            console.error(err);
            if (typeof setMessage === 'function') setMessage('Lỗi hệ thống.');
        } finally {
            setLoading(false);
        }
    };

    return <BookForm mode="create" categories={categories} onSubmit={handleSubmit} submitting={loading} />;
}
