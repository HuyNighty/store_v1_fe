import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames/bind';
import styles from './HomeContent.module.scss';
import Button from '../../../../Layouts/components/Button';
import { Sparkles, ArrowRight, Star, Users, Award } from 'lucide-react';
import TextType from '../../../../components/Animations/TextType';

const cx = classNames.bind(styles);

function HomeContent() {
    const [bgLoaded, setBgLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        const imageUrl = 'https://i.pinimg.com/736x/3b/30/b6/3b30b6bc5b1a89ce7857999dd0672ef0.jpg';

        console.log('Đang tải ảnh nền:', imageUrl);

        img.src = imageUrl;
        img.onload = () => {
            console.log('Ảnh nền tải thành công');
            setBgLoaded(true);
        };
        img.onerror = () => {
            console.error('Không tải được ảnh nền');
            setBgLoaded(false);
        };
    }, []);

    const floatingBooks = [...Array(6)].map((_, i) => i);

    return (
        <>
            <section className={cx('hero', { 'no-bg': !bgLoaded })}>
                {floatingBooks.map((i) => (
                    <motion.div
                        key={i}
                        className={cx('floating-book')}
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            opacity: 0,
                        }}
                        animate={{
                            y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                            opacity: [0.1, 0.3, 0.1],
                            rotate: [0, 360],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    >
                        <Star className={cx('book-icon')} />
                    </motion.div>
                ))}

                <div className={cx('hero-inner')}>
                    <motion.div
                        className={cx('hero-badge')}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Sparkles className={cx('badge-icon')} />
                        Khám phá kiến thức vô tận
                    </motion.div>

                    <TextType
                        className={cx('title')}
                        text={[
                            'Thư viện Kiến thức Vô tận',
                            'Hàng ngàn sách — mọi chủ đề',
                            'Bắt đầu hành trình đọc ngay',
                        ]}
                        typingSpeed={70}
                        pauseDuration={1500}
                        deletingSpeed={30}
                        showCursor={true}
                        cursorCharacter="|"
                        cursorBlinkDuration={0.45}
                        hideCursorWhileTyping={false}
                        textColors={['white', '#f0f0e5ff', '#f7eac5ff']}
                        variableSpeed={{ min: 30, max: 120 }}
                        startOnVisible={true}
                        loop={true}
                    />

                    <p className={cx('subtitle')}>
                        Duyệt hàng nghìn đầu sách ở mọi thể loại. Từ cổ điển bất hủ đến sách bán chạy hiện đại — tìm câu
                        chuyện phù hợp với bạn ngay hôm nay.
                    </p>

                    <div className={cx('actions')}>
                        <Button to="/books" className={cx('btn', 'btn-primary')}>
                            Khám phá bộ sưu tập
                            <motion.div
                                whileHover={{ x: 5 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                            >
                                <ArrowRight className={cx('btn-icon')} />
                            </motion.div>
                        </Button>
                        <Button className={cx('btn', 'btn-outline')}>Xem sách bán chạy</Button>
                    </div>
                </div>

                <motion.div
                    className={cx('scroll-indicator')}
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <div className={cx('scroll-track')}>
                        <motion.div
                            className={cx('scroll-thumb')}
                            animate={{ y: [0, 16, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* <section className={cx('stats-section')}>
                <div className={cx('stats-container')}>
                    <div className={cx('stats-grid')}>
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                className={cx('stat-item')}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: stat.delay }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <motion.div
                                    className={cx('stat-icon')}
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <stat.icon className={cx('icon')} />
                                </motion.div>
                                <div className={cx('stat-value')}>{stat.value}</div>
                                <div className={cx('stat-label')}>{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section> */}
        </>
    );
}

export default HomeContent;
