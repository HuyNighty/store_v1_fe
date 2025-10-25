import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import styles from './CartButton.module.scss';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../../../contexts/CartContext';

const cx = classNames.bind(styles);

function CartButton() {
    const navigate = useNavigate();
    const { getTotalItems } = useCart();

    const totalItems = getTotalItems();

    const handleCartClick = () => {
        navigate('/cart');
    };

    return (
        <div className={cx('cart-wrapper')} onClick={handleCartClick}>
            <FontAwesomeIcon icon={faShoppingCart} className={cx('icon-btn')} />
            {totalItems > 0 && <span className={cx('badge')}>{totalItems}</span>}
        </div>
    );
}
export default CartButton;
