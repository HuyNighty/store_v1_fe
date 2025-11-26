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
            title: 'Văn học & tiểu thuyết',
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

                <BookCarousel
                    id="featured"
                    image="https://i.pinimg.com/736x/22/5e/a9/225ea9ea0b2232b313e13d57aaeeab8e.jpg"
                />

                <BookCarousel
                    id="best-seller"
                    categoryName="Bán chạy"
                    title="Bán chạy"
                    limit={12}
                    booksPerPage={4}
                    image="https://i.pinimg.com/736x/bd/46/8d/bd468dd0fc8520c030bd66416ab17597.jpg"
                />

                <BookCarousel
                    id="classic"
                    categoryName="Khoa học & Thiên nhiên"
                    title="Khoa học & Thiên nhiên"
                    limit={12}
                    booksPerPage={4}
                    image="https://i.pinimg.com/736x/cf/6a/2a/cf6a2a034ffb96436d07f1922ec5e6f4.jpg"
                />

                <BookCarousel
                    id="sci-fi"
                    categoryName="Văn học & tiểu thuyết"
                    title="Văn học & tiểu thuyết"
                    limit={12}
                    booksPerPage={4}
                    image="https://i.pinimg.com/736x/30/d3/31/30d331212bde4b8b8b4d41fe7c1fcbf2.jpg"
                />
            </div>
        </>
    );
}

export default Home;
