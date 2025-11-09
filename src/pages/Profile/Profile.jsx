// Profile.js - Sửa phần hiển thị ảnh
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import authApi from '../../api/authApi';
import customerApi from '../../api/customerApi';
import { useAuth } from '../../contexts/AuthContext';

const cx = classNames.bind(styles);

function Profile() {
    const { isAuthenticated } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            setError('Please login to view your profile');
            return;
        }
        fetchUserInfo();
    }, [isAuthenticated]);

    const fetchUserInfo = async () => {
        try {
            setLoading(true);
            setError(null);
            setImageError(false);

            const response = await customerApi.getMyProfile();

            if (response.data?.result) {
                setUserInfo(response.data.result);
            } else {
                throw new Error('No user data found in response');
            }
        } catch (err) {
            console.error('Error fetching user info:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch user information');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (JPEG, PNG, GIF, etc.)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        try {
            setUploading(true);
            setImageError(false);

            const response = await customerApi.uploadProfileImage(file);

            setUserInfo((prev) => ({
                ...prev,
                profileImage: response.data.result,
            }));
        } catch (err) {
            console.error('Error uploading image:', err);
            alert(err.response?.data?.message || 'Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = async () => {
        if (!window.confirm('Are you sure you want to remove your profile image?')) {
            return;
        }

        try {
            await customerApi.removeProfileImage();
            setUserInfo((prev) => ({
                ...prev,
                profileImage: null,
            }));
            setImageError(false);
        } catch (err) {
            console.error('Error removing image:', err);
            alert(err.response?.data?.message || 'Failed to remove image. Please try again.');
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageError = () => {
        console.error('🖼️ Image failed to load');
        setImageError(true);
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

    // Construct full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;

        // Nếu đã là full URL, return luôn
        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        // eslint-disable-next-line no-undef
        const baseUrl = 'http://localhost:8080';
        const fullUrl = `${baseUrl}/Store${imagePath}`;
        return fullUrl;
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

    if (!userInfo) {
        return (
            <div className={cx('profile-container')}>
                <div className={cx('error-message')}>
                    <div className={cx('error-icon')}>❓</div>
                    <h3>No Profile Data</h3>
                    <p>Unable to load profile information</p>
                    <button onClick={fetchUserInfo} className={cx('retry-btn')}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const shouldShowPlaceholder = !userInfo.profileImage || imageError;

    return (
        <div className={cx('profile-container')}>
            <div className={cx('profile-header')}>
                {/* <h1 className={cx('profile-title')}>User Profile</h1> */}
                <button onClick={handleLogout} className={cx('logout-btn')}>
                    Logout
                </button>
            </div>

            <div className={cx('profile-content')}>
                {/* Welcome Section */}
                <div className={cx('welcome-section')}>
                    <div className={cx('avatar-section')}>
                        <div className={cx('avatar-container')} onClick={handleImageClick}>
                            {userInfo.profileImage && !imageError ? (
                                <img
                                    src={getImageUrl(userInfo.profileImage)}
                                    alt="Profile"
                                    className={cx('avatar-image')}
                                    onError={handleImageError}
                                />
                            ) : null}

                            {shouldShowPlaceholder && (
                                <div className={cx('avatar-placeholder')}>
                                    {userInfo.firstName?.charAt(0) || 'U'}
                                    {userInfo.lastName?.charAt(0) || 'S'}
                                </div>
                            )}

                            {uploading && (
                                <div className={cx('upload-overlay')}>
                                    <div className={cx('upload-spinner')}></div>
                                </div>
                            )}

                            <div className={cx('avatar-edit-hint')}>Click to change photo</div>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />

                        <div className={cx('avatar-actions')}>
                            <button
                                onClick={handleImageClick}
                                className={cx('avatar-btn', 'change-btn')}
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Change Photo'}
                            </button>
                            {userInfo.profileImage && !imageError && (
                                <button
                                    onClick={handleRemoveImage}
                                    className={cx('avatar-btn', 'remove-btn')}
                                    disabled={uploading}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={cx('welcome-text')}>
                        <h2>
                            Welcome back, {userInfo.firstName || 'User'} {userInfo.lastName || ''}!
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
                            value={getLoyaltyStatus(userInfo.loyaltyPoints || 0)}
                            className={getLoyaltyClass(userInfo.loyaltyPoints || 0)}
                        />
                        <SummaryCard title="Member Since" value="2024" />
                        <SummaryCard title="Account Type" value="Premium Member" />
                    </div>
                </div>
            </div>
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
