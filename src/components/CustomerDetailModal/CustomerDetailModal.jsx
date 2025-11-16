import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './CustomerDetailModal.module.scss';
import { useToast } from '../../contexts/Toast/ToastContext';
import Button from '../../Layouts/components/Button';
import customerApi from '../../api/customerApi';

const cx = classNames.bind(styles);

function CustomerDetailModal({ customerId, isOpen, onClose }) {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen && customerId) {
            fetchCustomerDetail();
        }
    }, [isOpen, customerId]);

    const fetchCustomerDetail = async () => {
        setLoading(true);
        try {
            const response = await customerApi.getCustomerById(customerId);
            setCustomer(response.data.result);
        } catch (error) {
            console.error('Error fetching customer details:', error);
            addToast('Lỗi khi tải thông tin khách hàng', 'error');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (!isOpen) return null;

    return (
        <div className={cx('modal-overlay')} onClick={onClose}>
            <div className={cx('modal-content')} onClick={(e) => e.stopPropagation()}>
                <div className={cx('modal-header')}>
                    <h2>Thông tin khách hàng</h2>
                    <button className={cx('close-btn')} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={cx('modal-body')}>
                    {loading ? (
                        <div className={cx('loading')}>
                            <div className={cx('spinner')}></div>
                            <p>Đang tải thông tin...</p>
                        </div>
                    ) : customer ? (
                        <div className={cx('customer-info')}>
                            <div className={cx('info-section')}>
                                <h3>Thông tin cơ bản</h3>
                                <div className={cx('info-grid')}>
                                    <div className={cx('info-item')}>
                                        <label>User ID:</label>
                                        <span>{customer.userId || 'N/A'}</span>
                                    </div>
                                    <div className={cx('info-item')}>
                                        <label>Họ tên:</label>
                                        <span>{customer.firstName + ' ' + customer.lastName || 'N/A'}</span>
                                    </div>
                                    <div className={cx('info-item')}>
                                        <label>Email:</label>
                                        <span>{customer.email || 'N/A'}</span>
                                    </div>
                                    <div className={cx('info-item')}>
                                        <label>Điện thoại:</label>
                                        <span>{customer.phoneNumber || 'N/A'}</span>
                                    </div>
                                    <div className={cx('info-item')}>
                                        <label>Trạng thái:</label>
                                        <span className={cx('status', { active: customer.isActive })}>
                                            {customer.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {customer.customer && (
                                <div className={cx('info-section')}>
                                    <h3>Thông tin chi tiết</h3>
                                    <div className={cx('info-grid')}>
                                        <div className={cx('info-item')}>
                                            <label>Họ:</label>
                                            <span>{customer.customer.lastName || 'N/A'}</span>
                                        </div>
                                        <div className={cx('info-item')}>
                                            <label>Tên:</label>
                                            <span>{customer.customer.firstName || 'N/A'}</span>
                                        </div>
                                        <div className={cx('info-item')}>
                                            <label>Ngày sinh:</label>
                                            <span>{formatDate(customer.customer.dateOfBirth)}</span>
                                        </div>
                                        <div className={cx('info-item')}>
                                            <label>Giới tính:</label>
                                            <span>
                                                {customer.customer.gender === 'MALE'
                                                    ? 'Nam'
                                                    : customer.customer.gender === 'FEMALE'
                                                    ? 'Nữ'
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={cx('info-section')}>
                                <h3>Thống kê</h3>
                                <div className={cx('stats-grid')}>
                                    <div className={cx('stat-item')}>
                                        <label>Tổng đơn hàng:</label>
                                        <span>{customer.totalOrders || 0}</span>
                                    </div>
                                    <div className={cx('stat-item')}>
                                        <label>Đơn hàng thành công:</label>
                                        <span>{customer.completedOrders || 0}</span>
                                    </div>
                                    <div className={cx('stat-item')}>
                                        <label>Tổng chi tiêu:</label>
                                        <span className={cx('amount')}>
                                            {customer.totalSpent ? (customer.totalSpent / 1000).toLocaleString() : 0}
                                            .000 đ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={cx('error')}>
                            <p>Không tìm thấy thông tin khách hàng</p>
                        </div>
                    )}
                </div>

                <div className={cx('modal-footer')}>
                    <Button onClick={onClose}>Đóng</Button>
                    {customer && (
                        <Button primary to={`/admin/customers/${customerId}`}>
                            Quản lý khách hàng
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CustomerDetailModal;
