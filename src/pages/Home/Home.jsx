import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import { BookCarousel } from '../../components/BookItem';
import HomeContent from './components/HomeContent';
import ImageGrid from './components/ImageGrid';
import FlowingMenu from './components/FollowingMenu';

const cx = classNames.bind(styles);

function Home() {
    const demoItems = [
        {
            link: '#',
            text: 'Mojave',
            image: 'https://i.pinimg.com/1200x/40/07/79/400779b11c63675794518da05b7d7d8e.jpg',
        },
        { link: '#', text: 'Sonoma', image: 'https://i.pinimg.com/736x/0b/c4/f9/0bc4f9649242499a374bb3f7e5bb3fd4.jpg' },
        {
            link: '#',
            text: 'Monterey',
            image: 'https://i.pinimg.com/1200x/f6/00/ce/f600cef8a02b9dbe6afe15e61cdc9498.jpg',
        },
        {
            link: '#',
            text: 'Sequoia',
            image: 'https://i.pinimg.com/736x/c8/33/9f/c8339f7e660da971ab4fe0fb59f0dbf9.jpg',
        },
    ];

    return (
        <>
            <div className={cx('wrapper')}>
                <div className={cx('home-content')}>
                    <HomeContent />
                </div>
                <ImageGrid />
                <FlowingMenu items={demoItems} />
                <BookCarousel />
            </div>
        </>
    );
}

export default Home;
