// Profile.js
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import authApi from '../../api/authApi';

const cx = classNames.bind(styles);

function Profile() {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await authApi.info();
            setUserInfo(response.data.result);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch user information');
            console.error('Error fetching user info:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
            localStorage.removeItem('access_token');
            window.location.href = '/';
        } catch (err) {
            console.error('Logout error:', err);
            localStorage.removeItem('access_token');
            window.location.href = '/';
        }
    };

    if (loading) {
        return (
            <div className={cx('profile-container')}>
                <div className={cx('loading')}>
                    <div className={cx('spinner')}></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cx('profile-container')}>
                <div className={cx('error-message')}>
                    <div className={cx('error-icon')}>⚠️</div>
                    <h3>Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={fetchUserInfo} className={cx('retry-btn')}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('profile-container')}>
            <div className={cx('profile-header')}>
                <h1 className={cx('profile-title')}>User Profile</h1>
                <button onClick={handleLogout} className={cx('logout-btn')}>
                    Logout
                </button>
            </div>

            {userInfo && (
                <div className={cx('profile-content')}>
                    {/* Welcome Section */}
                    <div className={cx('welcome-section')}>
                        <div className={cx('avatar')}>
                            {userInfo.firstName?.charAt(0)}
                            {userInfo.lastName?.charAt(0)}
                        </div>
                        <div className={cx('welcome-text')}>
                            <h2>
                                Welcome back, {userInfo.firstName} {userInfo.lastName}! 👋
                            </h2>
                            <p>Here's your profile information</p>
                        </div>
                    </div>

                    {/* Personal Information Section */}
                    <div className={cx('profile-section')}>
                        <h2 className={cx('section-title')}>Personal Information</h2>
                        <div className={cx('info-grid')}>
                            <InfoItem label="Username" value={userInfo.userName} />
                            <InfoItem label="First Name" value={userInfo.firstName} />
                            <InfoItem label="Last Name" value={userInfo.lastName} />
                            <InfoItem label="Email" value={userInfo.email} />
                            <InfoItem label="Phone Number" value={userInfo.phoneNumber} />
                            <InfoItem label="Address" value={userInfo.address} />
                            <InfoItem label="Loyalty Points" value={userInfo.loyaltyPoints} isPoints={true} />
                        </div>
                    </div>

                    {/* Account Summary Section */}
                    <div className={cx('profile-section')}>
                        <h2 className={cx('section-title')}>Account Summary</h2>
                        <div className={cx('summary-cards')}>
                            <SummaryCard
                                title="Loyalty Status"
                                value={getLoyaltyStatus(userInfo.loyaltyPoints)}
                                className={getLoyaltyClass(userInfo.loyaltyPoints)}
                            />
                            <SummaryCard title="Member Since" value="2024" />
                            <SummaryCard title="Account Type" value="Premium Member" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper Component for Info Items
const InfoItem = ({ label, value, isPoints = false }) => (
    <div className={cx('info-item')}>
        <span className={cx('info-label')}>{label}</span>
        <span className={cx('info-value', { points: isPoints })}>{value || value === 0 ? value : 'N/A'}</span>
    </div>
);

// Helper Component for Summary Cards
const SummaryCard = ({ title, value, className = '' }) => (
    <div className={cx('summary-card', className)}>
        <h3 className={cx('summary-title')}>{title}</h3>
        <p className={cx('summary-value')}>{value}</p>
    </div>
);

// Helper functions
const getLoyaltyStatus = (points) => {
    if (points >= 1000) return 'Gold Member 🥇';
    if (points >= 500) return 'Silver Member 🥈';
    if (points >= 100) return 'Bronze Member 🥉';
    return 'New Member 🌟';
};

const getLoyaltyClass = (points) => {
    if (points >= 1000) return 'gold';
    if (points >= 500) return 'silver';
    if (points >= 100) return 'bronze';
    return 'new-member';
};

export default Profile;
