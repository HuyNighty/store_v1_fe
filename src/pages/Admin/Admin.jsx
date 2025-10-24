import classNames from 'classnames/bind';
import styles from './Admin.module.scss';

const cx = classNames.bind(styles);

import Button from '../../Layouts/components/Button';

function Admin() {
    return (
        <div className={cx('wrapper')}>
            <Button primary to="/admin-products">
                Add Product
            </Button>
            <Button primary to="/admin-books">
                Add Book
            </Button>
        </div>
    );
}

export default Admin;
