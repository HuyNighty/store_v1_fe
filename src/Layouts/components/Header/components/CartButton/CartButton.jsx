import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import styles from './CartButton.module.scss';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../../../contexts/Cart/CartContext';

const cx = classNames.bind(styles);

function CartButton({ isTransparent = false }) {
    const navigate = useNavigate();
    const { getTotalItems } = useCart();

    const totalItems = getTotalItems();

    const handleCartClick = (e) => {
        e.preventDefault();
        navigate('/cart');
    };

    return (
        <button
            type="button"
            aria-label="Giỏ hàng"
            className={cx('cart-wrapper', {
                transparent: isTransparent,
                solid: !isTransparent,
            })}
            onClick={handleCartClick}
        >
            <FontAwesomeIcon icon={faShoppingCart} className={cx('icon-btn')} />
            {totalItems > 0 && <span className={cx('badge')}>{totalItems > 99 ? '99+' : totalItems}</span>}
        </button>
    );
}
export default CartButton;
