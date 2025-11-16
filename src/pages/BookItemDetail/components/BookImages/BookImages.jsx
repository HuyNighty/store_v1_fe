import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './BookImages.module.scss';

const cx = classNames.bind(styles);
const DEFAULT_SRC = '/images/default-book.jpg';

function BookImages({
    productName = '',
    productAssets = [],
    featured = false,
    discountPercent = 0,
    selectedImage = 0,
    onImageSelect = () => {},
}) {
    const allImages = useMemo(() => {
        if (Array.isArray(productAssets) && productAssets.length > 0) return productAssets;
        return [{ url: DEFAULT_SRC }];
    }, [productAssets]);

    const safeIndex = Math.max(0, Math.min(selectedImage, allImages.length - 1));
    const mainImage = allImages[safeIndex]?.url ?? DEFAULT_SRC;

    const handleImgError = (e) => {
        if (e?.target) e.target.src = DEFAULT_SRC;
    };

    const handleThumbKeyDown = (e, idx) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onImageSelect(idx);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onImageSelect(Math.max(0, idx - 1));
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            onImageSelect(Math.min(allImages.length - 1, idx + 1));
        }
    };

    return (
        <div className={cx('images-section')}>
            <div className={cx('main-image')}>
                <img
                    src={mainImage}
                    alt={productName || 'Book cover'}
                    onError={handleImgError}
                    loading="eager"
                    className={cx('main-img')}
                />
                {featured && <span className={cx('featured-badge')}>Nổi bật</span>}
                {discountPercent > 0 && <span className={cx('discount-badge')}>-{discountPercent}%</span>}
            </div>

            <div className={cx('thumbnail-images')} role="list" aria-label="Thumbnails">
                {allImages.map((asset, index) => {
                    const key = asset.id ?? asset.url ?? index;
                    const isActive = index === safeIndex;
                    return (
                        <button
                            key={key}
                            type="button"
                            className={cx('thumbnail-container', { active: isActive })}
                            onClick={() => onImageSelect(index)}
                            onKeyDown={(e) => handleThumbKeyDown(e, index)}
                            aria-pressed={isActive}
                            aria-label={`Chọn ảnh ${index + 1}`}
                        >
                            <img
                                src={asset.url ?? DEFAULT_SRC}
                                alt={`${productName} ${index + 1}`}
                                className={cx('thumbnail')}
                                onError={handleImgError}
                                loading="lazy"
                                width="80"
                                height="80"
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

BookImages.propTypes = {
    productName: PropTypes.string,
    productAssets: PropTypes.array,
    featured: PropTypes.bool,
    discountPercent: PropTypes.number,
    selectedImage: PropTypes.number,
    onImageSelect: PropTypes.func,
};

export default BookImages;
