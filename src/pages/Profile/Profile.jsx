import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import authApi from '../../api/authApi';
import customerApi from '../../api/customerApi';
import { useAuth } from '../../contexts/Auth/AuthContext';
import Button from '../../Layouts/components/Button';

const cx = classNames.bind(styles);

function Profile() {
    const { isAuthenticated, user, refreshUserData, setUser } = useAuth();
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
            setUserInfo(null);
            return;
        }
        fetchUserInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const fetchUserInfo = async () => {
        try {
            setLoading(true);
            setError(null);
            setImageError(false);

            const response = await customerApi.getMyProfile();
            const payload = response.data?.result ?? response.data ?? null;
            if (!payload) throw new Error('No user data found in response');
            setUserInfo(payload);
            if (setUser) {
                setUser((prev) => ({ ...(prev || {}), ...payload }));
            }
        } catch (err) {
            console.error('Error fetching user info:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch user information');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event?.target?.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setImageError(false);

            const formData = new FormData();
            formData.append('file', file);

            const response = await customerApi.uploadProfileImage(formData);

            let newImagePath = response.data?.result ?? response.data ?? null;

            let relativePath = newImagePath;

            if (newImagePath.includes('/Store/uploads/')) {
                const match = newImagePath.match(/\/Store\/(uploads\/profile-images\/[^?]+)/);
                if (match) {
                    relativePath = match[1];
                }
            }

            const updatedUserData = {
                profileImage: relativePath,
                profileImageFull: newImagePath,
                updatedAt: new Date().toISOString(),
            };

            if (setUser) {
                setUser((prev) => (prev ? { ...prev, ...updatedUserData } : prev));
            }

            setUserInfo((prev) => ({
                ...(prev || {}),
                ...updatedUserData,
            }));

            await fetchUserInfo();
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = async () => {
        if (!window.confirm('Are you sure you want to remove your profile image?')) return;
        try {
            setUploading(true);
            await customerApi.removeProfileImage();
            if (setUser) {
                setUser((prev) => (prev ? { ...prev, profileImage: null, updatedAt: new Date().toISOString() } : prev));
            }
            setUserInfo((prev) => ({ ...(prev || {}), profileImage: null }));
            setImageError(false);
            if (refreshUserData) {
                await refreshUserData();
            }
        } catch (err) {
            console.error('Error removing image:', err);
            alert(err.response?.data?.message || 'Failed to remove image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('access_token');
            window.location.href = '/';
        }
    };

    const HOST = 'http://52.62.234.97:8080';

    const buildImageUrl = (imagePath) => {
        if (!imagePath) return null;

        let cleaned = imagePath.replace(/^\/+/, '');

        if (!cleaned.startsWith('Store/') && !cleaned.startsWith('uploads/')) {
            cleaned = `Store/${cleaned}`;
        } else if (cleaned.startsWith('uploads/')) {
            cleaned = `Store/${cleaned}`;
        }

        const finalUrl = `${HOST}/${cleaned}${getTsQuery()}`;
        return finalUrl;
    };

    function getTsQuery() {
        const ts =
            userInfo?.updatedAt || user?.updatedAt
                ? new Date(userInfo?.updatedAt || user?.updatedAt).getTime()
                : undefined;
        return ts ? `?t=${ts}` : '';
    }

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
                <Button shine scale onClick={handleLogout} className={cx('logout-btn')}>
                    Logout
                </Button>
            </div>

            <div className={cx('profile-content')}>
                <div className={cx('welcome-section')}>
                    <div className={cx('avatar-section')}>
                        <div className={cx('avatar-container')} onClick={handleImageClick}>
                            {userInfo.profileImage && !imageError ? (
                                <img
                                    src={buildImageUrl(userInfo.profileImage)}
                                    alt="Profile"
                                    className={cx('avatar-image')}
                                    onError={handleImageError}
                                />
                            ) : null}

                            {shouldShowPlaceholder && (
                                <div className={cx('avatar-placeholder')}>
                                    {(userInfo.firstName?.charAt(0) || 'U') + (userInfo.lastName?.charAt(0) || '')}
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
                            <Button
                                shine
                                outline
                                scale
                                onClick={handleImageClick}
                                className={cx('avatar-btn', 'change-btn')}
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Change Photo'}
                            </Button>
                            {userInfo.profileImage && !imageError && (
                                <Button
                                    shine
                                    scale
                                    onClick={handleRemoveImage}
                                    className={cx('avatar-btn', 'remove-btn')}
                                    disabled={uploading}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className={cx('welcome-text')}>
                        <h2>
                            Welcome back, {userInfo.firstName || 'User'} {userInfo.lastName || ''}
                        </h2>
                        <p>Here's your profile information</p>
                    </div>
                </div>

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
            </div>
        </div>
    );
}

const InfoItem = ({ label, value, isPoints = false }) => (
    <div className={cx('info-item')}>
        <span className={cx('info-label')}>{label}</span>
        <span className={cx('info-value', { points: isPoints })}>{value || value === 0 ? value : 'N/A'}</span>
    </div>
);

export default Profile;
