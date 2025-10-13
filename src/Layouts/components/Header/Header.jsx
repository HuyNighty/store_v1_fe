import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Header() {
    return (
        <header className={cx('wrapper')}>
            <div className={cx('content')}>
                <div className={cx('logo')}>
                    <div className={cx('logo-icon')}>
                        <span>B</span>
                    </div>
                    <span className={cx('logo-text')}>BookStore</span>
                </div>

                <nav className={cx('nav')}>
                    <button>Home</button>
                    <button>Books</button>
                    <button>Profile</button>
                </nav>

                <div className={cx('actions')}>
                    <FontAwesomeIcon icon={faSearch} className={cx('icon-btn')} />
                    <div className={cx('cart-wrapper')}>
                        <FontAwesomeIcon icon={faShoppingCart} className={cx('icon-btn')} />
                        <span className={cx('badge')}>3</span>
                    </div>
                    <FontAwesomeIcon icon={faUser} className={cx('icon-btn')} />
                </div>
            </div>
        </header>
    );
}

export default Header;
