import React from 'react';
import classNames from 'classnames/bind';
import styles from './BookImages.module.scss';

const cx = classNames.bind(styles);

function BookImages({ productName, productAssets, featured, discountPercent, selectedImage, onImageSelect }) {
    const allImages = productAssets.length > 0 ? productAssets : [{ url: '/images/default-book.jpg' }];
    const mainImage = allImages[selectedImage]?.url;

    return (
        <div className={cx('images-section')}>
            <div className={cx('main-image')}>
                <img src={mainImage} alt={productName} />
                {featured && <span className={cx('featured-badge')}>Nổi bật</span>}
                {discountPercent > 0 && <span className={cx('discount-badge')}>-{discountPercent}%</span>}
            </div>
            <div className={cx('thumbnail-images')}>
                {allImages.map((asset, index) => (
                    <div
                        key={index}
                        className={cx('thumbnail-container', { active: selectedImage === index })}
                        onClick={() => onImageSelect(index)}
                    >
                        <img src={asset.url} alt={`${productName} ${index + 1}`} className={cx('thumbnail')} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BookImages;
