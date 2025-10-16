import classNames from 'classnames/bind';
import styles from './HomeContent.module.scss';

const cx = classNames.bind(styles);

function HomeContent() {
    return (
        <section className={cx('hero')}>
            <div className={cx('hero-inner')}>
                <div className={cx('title')}>
                    <span>Find Your Next Favorite Book</span>
                </div>
                <p className={cx('subtitle')}>
                    Discover thousands of books across every genre. From timeless classics to modern bestsellers.
                </p>
                <div className={cx('actions')}>
                    <button className={cx('btn', 'btn-primary')}>Shop Now</button>
                    <button className={cx('btn', 'btn-outline')}>Explore Featured</button>
                </div>
            </div>
        </section>
    );
}

export default HomeContent;
