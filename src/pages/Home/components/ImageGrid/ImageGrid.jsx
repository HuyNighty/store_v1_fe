import React from 'react';
import classNames from 'classnames/bind';
import styles from './ImageGrid.module.scss';
import Button from '../../../../Layouts/components/Button';
import AnimatedContent from '../../../../components/Animations/AnimatedContent';
import PixelTransition from '../../../../components/Animations/PixelTransition';
import Magnet from '../../../../components/Animations/Magnet';

const cx = classNames.bind(styles);

const defaultImages = [
    {
        id: 'g1',
        src: 'https://i.pinimg.com/736x/fb/c5/99/fbc59971ab9fea744589b2d1127b46b9.jpg',
        alt: 'Kinh điển',
        title: 'Kinh điển',
        targetId: 'classic',
        ctaText: 'Khám phá',
    },
    {
        id: 'g2',
        src: 'https://i.pinimg.com/736x/8f/7e/a1/8f7ea1b81bf687ee9ec0d60a51f04081.jpg',
        alt: 'Bán chạy',
        title: 'Bán chạy',
        targetId: 'best-seller',
        ctaText: 'Xem ngay',
    },
    {
        id: 'g3',
        src: 'https://i.pinimg.com/736x/3b/9d/c5/3b9dc5c8f44875fa3331de6e6b82fdc3.jpg',
        alt: 'Khoa học viễn tưởng',
        title: 'Khoa học viễn tưởng',
        targetId: 'sci-fi',
        ctaText: 'Khám phá',
    },
    {
        id: 'g4',
        src: 'https://i.pinimg.com/1200x/97/0c/7f/970c7f1ef944688fe2868898a8ef578a.jpg',
        alt: 'Hình sự - Kinh dị',
        title: 'Hình sự & Kinh dị',
        targetId: 'mystery',
        ctaText: 'Khám phá',
    },
    {
        id: 'g5',
        src: 'https://i.pinimg.com/1200x/d9/92/93/d99293f59371ae9f78314621f7963f2f.jpg',
        alt: 'Lãng mạn',
        title: 'Lãng mạn',
        targetId: 'romance',
        ctaText: 'Khám phá',
    },
    {
        id: 'g6',
        src: 'https://i.pinimg.com/736x/51/f3/6d/51f36d15e40bdbdf0675acc6277cbc69.jpg',
        alt: 'Phi hư cấu',
        title: 'Phi hư cấu',
        targetId: 'non-fiction',
        ctaText: 'Khám phá',
    },
];

function ImageGrid({ items = defaultImages }) {
    const handleItemClick = (item, e) => {
        e?.stopPropagation?.();

        const id =
            item?.targetId ??
            (typeof item.link === 'string' && item.link.startsWith('#') ? item.link.replace(/^#/, '') : null);

        if (id) {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                try {
                    el.focus({ preventScroll: true });
                } catch (err) {}
            } else {
                console.warn(`Không tìm thấy phần tử có id="${id}" để cuộn tới.`);
            }
            return;
        }

        if (item?.link) {
            window.location.href = item.link;
        }
    };

    const handleKeyDown = (item, e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleItemClick(item, e);
        }
    };

    return (
        <AnimatedContent>
            <section className={cx('image-grid-section')}>
                <div className={cx('container')}>
                    <h2 className={cx('section-title')}>Bộ sưu tập nổi bật</h2>
                    <p className={cx('section-subtitle')}>
                        Khám phá các bộ sưu tập sách được tuyển chọn theo nhiều chủ đề
                    </p>

                    <div className={cx('image-grid')}>
                        {items.map((image, index) => (
                            <div key={image.id ?? index} className={cx('grid-item', `item-${index + 1}`)}>
                                <div
                                    className={cx('image-container')}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={image.title ?? image.alt}
                                    onClick={(e) => handleItemClick(image, e)}
                                    onKeyDown={(e) => handleKeyDown(image, e)}
                                >
                                    <PixelTransition
                                        firstContent={
                                            <img src={image.src} alt={image.alt} className={cx('grid-image')} />
                                        }
                                        secondContent={
                                            <div className={cx('image-overlay')}>
                                                <h3 className={cx('image-title')}>{image.title}</h3>

                                                <Magnet>
                                                    <Button
                                                        scale
                                                        shine
                                                        className={cx('explore-btn')}
                                                        onClick={(e) => handleItemClick(image, e)}
                                                    >
                                                        {image.ctaText ?? 'Khám phá'}
                                                    </Button>
                                                </Magnet>
                                            </div>
                                        }
                                        gridSize={10}
                                        pixelColor="#a18f81ff"
                                        animationStepDuration={0.5}
                                        once={false}
                                        aspectRatio={null}
                                        className={cx('pixel-transition-wrapper')}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </AnimatedContent>
    );
}

export default ImageGrid;
