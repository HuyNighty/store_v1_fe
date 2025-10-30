import React from 'react';
import classNames from 'classnames/bind';
import styles from './OrderStatus.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClock,
    faCreditCard,
    faShippingFast,
    faCheckCircle,
    faTimesCircle,
    faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const STATUS_CONFIG = {
    PENDING: {
        label: 'Chờ xác nhận',
        icon: faClock,
        color: 'warning',
        description: 'Đơn hàng đang chờ xác nhận từ cửa hàng',
        progress: 0,
    },
    PAID: {
        label: 'Đã thanh toán',
        icon: faCreditCard,
        color: 'info',
        description: 'Đơn hàng đã được thanh toán thành công',
        progress: 25,
    },
    SHIPPED: {
        label: 'Đang giao hàng',
        icon: faShippingFast,
        color: 'primary',
        description: 'Đơn hàng đang được vận chuyển',
        progress: 50,
    },
    DELIVERED: {
        label: 'Đã giao hàng',
        icon: faBoxOpen,
        color: 'success',
        description: 'Đơn hàng đã được giao thành công',
        progress: 75,
    },
    COMPLETED: {
        label: 'Hoàn thành',
        icon: faCheckCircle,
        color: 'success',
        description: 'Đơn hàng đã hoàn tất',
        progress: 100,
    },
    CANCELLED: {
        label: 'Đã hủy',
        icon: faTimesCircle,
        color: 'danger',
        description: 'Đơn hàng đã bị hủy',
        progress: 0,
    },
};

function OrderStatus({ status, showProgress = true, size = 'medium' }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

    return (
        <div className={cx('order-status', size)}>
            <div className={cx('status-info')}>
                <div className={cx('status-icon', config.color)}>
                    <FontAwesomeIcon icon={config.icon} />
                </div>
                <div className={cx('status-details')}>
                    <span className={cx('status-label', config.color)}>{config.label}</span>
                    <p className={cx('status-description')}>{config.description}</p>
                </div>
            </div>

            {showProgress && status !== 'CANCELLED' && (
                <div className={cx('progress-container')}>
                    <div className={cx('progress-bar')}>
                        <div
                            className={cx('progress-fill', config.color)}
                            style={{ width: `${config.progress}%` }}
                        ></div>
                    </div>
                    <div className={cx('progress-steps')}>
                        {Object.entries(STATUS_CONFIG).map(([key, value]) => {
                            if (key === 'CANCELLED') return null;
                            return (
                                <div
                                    key={key}
                                    className={cx('step', {
                                        active: config.progress >= value.progress,
                                        current: status === key,
                                    })}
                                >
                                    <div className={cx('step-dot')}></div>
                                    <span className={cx('step-label')}>{value.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderStatus;
