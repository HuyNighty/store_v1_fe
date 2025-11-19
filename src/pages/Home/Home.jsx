import React from 'react';
import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import HomeContent from './components/HomeContent';
import ImageGrid from './components/ImageGrid';
import FlowingMenu from './components/FollowingMenu';
import { BookCarousel } from '../../components/BookItem';

const cx = classNames.bind(styles);

function Home() {
    const Items = [
        {
            link: '#',
            text: 'Xu hướng',
            image: 'https://i.pinimg.com/1200x/40/07/79/400779b11c63675794518da05b7d7d8e.jpg',
        },
    ];

    const gridItems = [
        {
            id: 'g1',
            title: 'Kinh điển',
            targetId: 'classic',
            src: 'https://i.pinimg.com/736x/fb/c5/99/fbc59971ab9fea744589b2d1127b46b9.jpg',
            ctaText: 'Khám phá',
        },
        {
            id: 'g2',
            title: 'Bán chạy',
            targetId: 'best-seller',
            src: 'https://i.pinimg.com/736x/8f/7e/a1/8f7ea1b81bf687ee9ec0d60a51f04081.jpg',
            ctaText: 'Xem ngay',
        },
        {
            id: 'g3',
            title: 'Khoa học viễn tưởng',
            targetId: 'sci-fi',
            src: 'https://i.pinimg.com/736x/3b/9d/c5/3b9dc5c8f44875fa3331de6e6b82fdc3.jpg',
            ctaText: 'Khám phá',
        },
        {
            id: 'g4',
            title: 'Hình sự & Kinh dị',
            targetId: 'mystery',
            src: 'https://i.pinimg.com/1200x/97/0c/7f/970c7f1ef944688fe2868898a8ef578a.jpg',
            ctaText: 'Khám phá',
        },
        {
            id: 'g5',
            title: 'Lãng mạn',
            targetId: 'romance',
            src: 'https://i.pinimg.com/1200x/d9/92/93/d99293f59371ae9f78314621f7963f2f.jpg',
            ctaText: 'Khám phá',
        },
        {
            id: 'g6',
            title: 'Phi hư cấu',
            targetId: 'non-fiction',
            src: 'https://i.pinimg.com/736x/51/f3/6d/51f36d15e40bdbdf0675acc6277cbc69.jpg',
            ctaText: 'Khám phá',
        },
    ];

    return (
        <>
            <div className={cx('wrapper')}>
                <div className={cx('home-content')}>
                    <HomeContent />
                </div>

                <div className={cx('image-grid-container')}>
                    <ImageGrid items={gridItems} />
                </div>

                {/* <FlowingMenu items={Items} /> */}

                <BookCarousel />

                <BookCarousel id="best-seller" categoryName="Bán chạy" title="Bán chạy" limit={12} booksPerPage={4} />

                {/* <BookCarousel id="classic" categoryName="Kinh điển" title="Kinh điển" limit={12} booksPerPage={4} /> */}

                {/* <BookCarousel
                    id="sci-fi"
                    categoryName="Khoa học viễn tưởng"
                    title="Khoa học viễn tưởng"
                    limit={12}
                    booksPerPage={4}
                />

                <BookCarousel
                    id="mystery"
                    categoryName="Hình sự & Kinh dị"
                    title="Hình sự & Kinh dị"
                    limit={12}
                    booksPerPage={4}
                />

                <BookCarousel id="romance" categoryName="Lãng mạn" title="Lãng mạn" limit={12} booksPerPage={4} />

                <BookCarousel
                    id="non-fiction"
                    categoryName="Phi hư cấu"
                    title="Phi hư cấu"
                    limit={12}
                    booksPerPage={4}
                /> */}
            </div>
        </>
    );
}

export default Home;
