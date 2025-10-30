import classNames from 'classnames/bind';
import styles from './Admin.module.scss';

const cx = classNames.bind(styles);

import Button from '../../Layouts/components/Button';

function Admin() {
    return (
        <div className={cx('wrapper')}>
            <Button shine primary to="/admin-products">
                Add Product
            </Button>
            <Button shine primary to="/admin-books">
                Add Book
            </Button>
            <Button shine primary to="/admin-orders">
                Orders
            </Button>
        </div>
    );
}

export default Admin;
