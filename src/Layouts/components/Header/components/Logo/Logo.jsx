import styles from './Logo.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function Logo() {
    return (
        <Link to="/" className={cx('logo')}>
            <div className={cx('logo-icon')}>
                <span>B</span>
            </div>
            <span className={cx('logo-text')}>BookStore</span>
        </Link>
    );
}

export default Logo;
