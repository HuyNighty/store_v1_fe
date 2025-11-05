import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import { BookCarousel } from '../../components/BookItem';
import HomeContent from './components/HomeContent';
import ImageGrid from './components/HomeContent/ImageGrid';

const cx = classNames.bind(styles);

function Home() {
    return (
        <>
            <div className={cx('wrapper')}>
                <div className={cx('home-content')}>
                    <HomeContent />
                </div>
                <ImageGrid />
                <BookCarousel />
            </div>
        </>
    );
}

export default Home;
