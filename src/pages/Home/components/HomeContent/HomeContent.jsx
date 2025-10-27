// HomeContent.js
import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './HomeContent.module.scss';
import ImageGrid from './ImageGrid';
import Button from '../../../../Layouts/components/Button';

const cx = classNames.bind(styles);

function HomeContent() {
    const [bgLoaded, setBgLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        const imageUrl = 'https://i.pinimg.com/736x/5e/a5/27/5ea52724a7d5a0e0d2362e7ffdf8ad60.jpg';

        console.log('Loading image:', imageUrl);

        img.src = imageUrl;
        img.onload = () => {
            console.log('Image loaded successfully');
            setBgLoaded(true);
        };
        img.onerror = () => {
            console.error('Failed to load image');
            setBgLoaded(false);
        };
    }, []);

    console.log('bgLoaded state:', bgLoaded);

    return (
        <>
            <section className={cx('hero', { 'no-bg': !bgLoaded })}>
                <div className={cx('hero-inner')}>
                    <div className={cx('title')}>
                        <span>Discover Your</span>
                        <span>Next Great Read</span>
                    </div>
                    <p className={cx('subtitle')}>
                        Browse thousands of books across all genres. From timeless classics to modern bestsellers, find
                        your perfect story today.
                    </p>
                    <div className={cx('actions')}>
                        <Button to="/books" className={cx('btn', 'btn-primary')}>
                            Browse Collection
                        </Button>
                        <Button className={cx('btn', 'btn-outline')}>View Bestsellers</Button>
                    </div>
                </div>
            </section>
            <ImageGrid />
        </>
    );
}

export default HomeContent;
