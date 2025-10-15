import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import styles from './CartButton.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function CartButton() {
    return (
        <div className={cx('cart-wrapper')}>
            <FontAwesomeIcon icon={faShoppingCart} className={cx('icon-btn')} />
            <span className={cx('badge')}>1</span>
        </div>
    );
}

export default CartButton;
