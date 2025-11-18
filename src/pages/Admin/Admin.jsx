import classNames from 'classnames/bind';
import styles from './Admin.module.scss';
import Button from '../../Layouts/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBook,
    faShoppingCart,
    faBox,
    faTags,
    faUserCircle,
    faUsers,
    faChartBar,
    faCog,
    faEye,
    faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Admin() {
    const statsData = [
        {
            title: 'Total Books',
            value: '4',
            description: 'Total Stable Page',
            icon: faBook,
            color: '#d0a772ff',
            moreInfo: '15',
            to: '/admin/books/create',
        },
        {
            title: 'Total Products',
            value: '30',
            description: 'Total Portfolio',
            icon: faBox,
            color: '#a57b43ff',
            moreInfo: '50',
            to: '/admin-products',
        },
        {
            title: 'Total Orders',
            value: '65',
            description: 'Total Enquiries',
            icon: faShoppingCart,
            color: '#b58343ff',
            moreInfo: '20',
            to: '/admin-orders',
        },
        {
            title: 'Total Users',
            value: '70',
            description: 'Total Team',
            icon: faUsers,
            color: '#e4c59dff',
            moreInfo: 'More info',
            to: '/admin-users',
        },
        {
            title: 'Categories',
            value: '20',
            description: 'Total Services',
            icon: faTags,
            color: '#916935ff',
            moreInfo: 'More info',
            to: '/admin-categories',
        },
        {
            title: 'Authors',
            value: '50',
            description: 'Total User',
            icon: faUserCircle,
            color: '#633b06ff',
            moreInfo: 'More info',
            to: '/admin-authors',
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h1 className={cx('title')}>Dashboard</h1>
            </div>

            <div className={cx('stats-grid')}>
                {statsData.map((stat, index) => (
                    <div key={index} className={cx('stat-card')} style={{ backgroundColor: stat.color }}>
                        <div className={cx('stat-main')}>
                            <div className={cx('stat-icon')} style={{ backgroundColor: stat.color }}>
                                <FontAwesomeIcon icon={stat.icon} />
                            </div>
                            <div className={cx('stat-content')}>
                                <h3 className={cx('stat-value')}>{stat.value}</h3>
                                <p className={cx('stat-title')}>{stat.title}</p>
                                <p className={cx('stat-description')}>{stat.description}</p>
                            </div>
                        </div>
                        <div className={cx('stat-footer')}>
                            <span className={cx('more-info')}>{stat.moreInfo}</span>
                            <Button to={stat.to} text className={cx('view-btn')}>
                                <FontAwesomeIcon icon={faEye} />
                                View
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={cx('quick-actions')}>
                <h2 className={cx('section-title')}>Quick Actions</h2>
                <div className={cx('actions-grid')}>
                    <Button to="/admin-books" primary className={cx('action-btn')}>
                        <FontAwesomeIcon icon={faBook} />
                        Manage Books
                        <FontAwesomeIcon icon={faArrowRight} className={cx('arrow')} />
                    </Button>
                    <Button to="/admin-orders" success className={cx('action-btn')}>
                        <FontAwesomeIcon icon={faShoppingCart} />
                        View Orders
                        <FontAwesomeIcon icon={faArrowRight} className={cx('arrow')} />
                    </Button>
                    <Button to="/admin-products" warning className={cx('action-btn')}>
                        <FontAwesomeIcon icon={faBox} />
                        Manage Products
                        <FontAwesomeIcon icon={faArrowRight} className={cx('arrow')} />
                    </Button>
                    <Button to="/admin-analytics" info className={cx('action-btn')}>
                        <FontAwesomeIcon icon={faChartBar} />
                        Analytics
                        <FontAwesomeIcon icon={faArrowRight} className={cx('arrow')} />
                    </Button>
                    <Button to="/admin-category" info className={cx('action-btn')}>
                        <FontAwesomeIcon icon={faChartBar} />
                        Category
                        <FontAwesomeIcon icon={faArrowRight} className={cx('arrow')} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Admin;
