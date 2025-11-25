import Header from '../components/Header';
import Footer from './Footer';
import classNames from 'classnames/bind';
import styles from './DefaultLayout.module.scss';
import AnimatedContent from '../../components/Animations/AnimatedContent';

const cx = classNames.bind(styles);

function DefaultLayout({ children, headerMode = 'auto' }) {
    return (
        <div className={cx('wrapper')}>
            <Header mode={headerMode} />
            <div
                className={cx('content')}
                style={{ paddingTop: headerMode === 'auto' ? 0 : 'var(--header-height, 72px)' }}
            >
                {children}
            </div>
            {/* <AnimatedContent> */}
            <Footer />
            {/* </AnimatedContent> */}
        </div>
    );
}

export default DefaultLayout;
