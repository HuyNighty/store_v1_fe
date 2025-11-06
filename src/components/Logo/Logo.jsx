import styles from './Logo.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function Logo({ className, isTransparent = false, ...props }) {
    const rootClass = cx('logo', { transparent: isTransparent });
    const combined = [rootClass, className].filter(Boolean).join(' ');

    return (
        <Link to="/" className={combined} {...props}>
            <div className={cx('logo-icon')}>
                <span>B</span>
            </div>
            <span className={cx('logo-text')}>BookStore</span>
        </Link>
    );
}

export default Logo;
