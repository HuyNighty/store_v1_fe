// src/hooks/useProductImage.js
import { useState, useEffect } from 'react';
import productApi from '../api/productApi';

const useProductImage = (productId) => {
    const [imageUrl, setImageUrl] = useState('/images/default-book.jpg');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductImage = async () => {
            if (!productId) {
                setImageUrl('/images/default-book.jpg');
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const product = await productApi.getById(productId);
                const firstImage = product.productAssets?.[0]?.url;

                if (firstImage) {
                    setImageUrl(firstImage);
                } else {
                    setImageUrl('/images/default-book.jpg');
                }
            } catch (err) {
                console.error('Error fetching product image:', err);
                setError('Không thể tải ảnh sản phẩm');
                setImageUrl('/images/default-book.jpg');
            } finally {
                setLoading(false);
            }
        };

        fetchProductImage();
    }, [productId]);

    return { imageUrl, loading, error };
};

export default useProductImage;
