// ImageGrid.jsx (đã sửa)
import classNames from 'classnames/bind';
import styles from './ImageGrid.module.scss';
import Button from '../../../../Layouts/components/Button';
import AnimatedContent from '../../../../components/Animations/AnimatedContent';
import PixelTransition from '../../../../components/Animations/PixelTransition';
import Magnet from '../../../../components/Animations/Magnet';

const cx = classNames.bind(styles);

const images = [
    {
        id: 1,
        src: 'https://i.pinimg.com/736x/fb/c5/99/fbc59971ab9fea744589b2d1127b46b9.jpg',
        alt: 'Book Collection 1',
        title: 'Classic Literature',
    },
    {
        id: 2,
        src: 'https://i.pinimg.com/736x/8f/7e/a1/8f7ea1b81bf687ee9ec0d60a51f04081.jpg',
        alt: 'Book Collection 2',
        title: 'Modern Bestsellers',
    },
    {
        id: 3,
        src: 'https://i.pinimg.com/736x/3b/9d/c5/3b9dc5c8f44875fa3331de6e6b82fdc3.jpg',
        alt: 'Book Collection 3',
        title: 'Science Fiction',
    },
    {
        id: 4,
        src: 'https://i.pinimg.com/1200x/97/0c/7f/970c7f1ef944688fe2868898a8ef578a.jpg',
        alt: 'Book Collection 4',
        title: 'Mystery & Thriller',
    },
    {
        id: 5,
        src: 'https://i.pinimg.com/1200x/d9/92/93/d99293f59371ae9f78314621f7963f2f.jpg',
        alt: 'Book Collection 5',
        title: 'Romance',
    },
    {
        id: 6,
        src: 'https://i.pinimg.com/736x/51/f3/6d/51f36d15e40bdbdf0675acc6277cbc69.jpg',
        alt: 'Book Collection 6',
        title: 'Non-Fiction',
    },
];

function ImageGrid() {
    return (
        <AnimatedContent>
            <section className={cx('image-grid-section')}>
                <div className={cx('container')}>
                    <h2 className={cx('section-title')}>Featured Collections</h2>
                    <p className={cx('section-subtitle')}>Explore our curated book collections across various genres</p>

                    <div className={cx('image-grid')}>
                        {images.map((image, index) => (
                            <div key={image.id} className={cx('grid-item', `item-${index + 1}`)}>
                                <div className={cx('image-container')}>
                                    <PixelTransition
                                        firstContent={
                                            <img src={image.src} alt={image.alt} className={cx('grid-image')} />
                                        }
                                        secondContent={
                                            <div className={cx('image-overlay')}>
                                                <h3 className={cx('image-title')}>{image.title}</h3>
                                                <Magnet>
                                                    <Button shine className={cx('explore-btn')}>
                                                        Explore
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
