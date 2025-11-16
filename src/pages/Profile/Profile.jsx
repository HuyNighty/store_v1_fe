import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import customerApi from '../../api/customerApi';
import { useAuth } from '../../contexts/Auth/AuthContext';

const cx = classNames.bind(styles);

function getImageUrl(imagePath) {
    if (!imagePath) return null;
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    const base = 'http://localhost:8080';
    return `${base.replace(/\/$/, '')}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}

export default function Profile() {
    const { isAuthenticated } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            setUserInfo(null);
            return;
        }
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await customerApi.getMyProfile();
            const payload = res?.data?.result ?? res?.data ?? res;
            setUserInfo(payload || null);
            setImageError(false);
        } catch (err) {
            console.error('[Profile] fetch error', err);
            setUserInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const onSelectFile = () => fileRef.current?.click();

    const handleUpload = async (e) => {
        const file = e?.target?.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh.');
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            alert('Ảnh phải nhỏ hơn 8MB.');
            return;
        }

        try {
            setUploading(true);
            const fd = new FormData();
            fd.append('file', file);
            const res = await customerApi.uploadProfileImage(fd);
            const result = res?.data?.result ?? res?.data ?? res;
            setUserInfo((prev) => ({ ...(prev || {}), profileImage: result ?? result?.path ?? result }));
            setImageError(false);
        } catch (err) {
            console.error('[Profile] upload', err);
            alert(err?.response?.data?.message ?? 'Tải ảnh thất bại.');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleRemoveImage = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh đại diện?')) return;
        try {
            setUploading(true);
            await customerApi.removeProfileImage();
            setUserInfo((prev) => ({ ...(prev || {}), profileImage: null }));
            setImageError(false);
        } catch (err) {
            console.error('[Profile] remove image', err);
            alert('Xóa ảnh thất bại.');
        } finally {
            setUploading(false);
        }
    };

    const onImageError = () => setImageError(true);

    const fullName = `${userInfo?.firstName ?? ''} ${userInfo?.lastName ?? ''}`.trim() || userInfo?.userName || '—';
    const avatarUrl = userInfo?.profileImage ? getImageUrl(userInfo.profileImage) : null;

    if (loading) {
        return (
            <div className={cx('profile-root')}>
                <header className={cx('header', 'skeleton')}>
                    <div className={cx('header-inner')}>
                        <div className={cx('avatar-skel')} />
                        <div className={cx('text-skel')} />
                    </div>
                </header>
                <main className={cx('main', 'skeleton-main')}>
                    <div className={cx('stats-grid-skel')} />
                </main>
            </div>
        );
    }

    return (
        <div className={cx('profile-root')}>
            <header className={cx('header')}>
                <div className={cx('header-inner')}>
                    <div className={cx('avatar-block')}>
                        <div className={cx('avatar-wrap')}>
                            {avatarUrl && !imageError ? (
                                <img src={avatarUrl} alt="avatar" className={cx('avatar-img')} onError={onImageError} />
                            ) : (
                                <div className={cx('avatar-fallback')}>
                                    {(userInfo?.firstName || userInfo?.userName || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className={cx('avatar-actions')}>
                                <button className={cx('btn', 'btn-upload')} onClick={onSelectFile} disabled={uploading}>
                                    {uploading ? 'Đang tải...' : 'Đổi ảnh'}
                                </button>
                                {userInfo?.profileImage && !imageError && (
                                    <button
                                        className={cx('btn', 'btn-remove')}
                                        onClick={handleRemoveImage}
                                        disabled={uploading}
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={cx('header-info')}>
                        <h1 className={cx('name')}>{fullName}</h1>
                        <p className={cx('email')}>{userInfo?.email ?? '—'}</p>

                        <div className={cx('meta')}>
                            <div className={cx('meta-item')}>
                                <span className={cx('meta-label')}>Tham gia</span>
                                <span className={cx('meta-value')}>
                                    {userInfo?.createdAt ? new Date(userInfo.createdAt).getFullYear() : '—'}
                                </span>
                            </div>
                            <div className={cx('meta-sep')}>•</div>
                            <div className={cx('meta-item')}>
                                <span className={cx('meta-label')}>Quyền</span>
                                <span className={cx('meta-value')}>
                                    {(userInfo?.role || (userInfo?.roles && userInfo.roles[0])) ?? '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className={cx('main')}>
                <section className={cx('stats')}>
                    <div className={cx('stat-card')}>
                        <div className={cx('stat-left')}>
                            <div className={cx('stat-label')}>Đơn hàng</div>
                            <div className={cx('stat-value')}>{userInfo?.totalOrders ?? '—'}</div>
                        </div>
                        <div className={cx('stat-icon')}>🛍️</div>
                    </div>

                    <div className={cx('stat-card')}>
                        <div className={cx('stat-left')}>
                            <div className={cx('stat-label')}>Tổng chi tiêu</div>
                            <div className={cx('stat-value')}>
                                {typeof userInfo?.totalSpent === 'number'
                                    ? new Intl.NumberFormat('vi-VN').format(userInfo.totalSpent) + ' ₫'
                                    : userInfo?.totalSpent ?? '—'}
                            </div>
                        </div>
                        <div className={cx('stat-icon')}>💰</div>
                    </div>

                    <div className={cx('stat-card')}>
                        <div className={cx('stat-left')}>
                            <div className={cx('stat-label')}>Yêu thích</div>
                            <div className={cx('stat-value')}>{userInfo?.favoritesCount ?? '—'}</div>
                        </div>
                        <div className={cx('stat-icon')}>❤️</div>
                    </div>

                    <div className={cx('stat-card')}>
                        <div className={cx('stat-left')}>
                            <div className={cx('stat-label')}>Đánh giá</div>
                            <div className={cx('stat-value')}>{userInfo?.reviewsCount ?? '—'}</div>
                        </div>
                        <div className={cx('stat-icon')}>⭐</div>
                    </div>
                </section>

                <section className={cx('panel')}>
                    <div className={cx('panel-header')}>
                        <h2>Thông tin cá nhân</h2>
                    </div>

                    <div className={cx('info-grid')}>
                        <div className={cx('info-item')}>
                            <div className={cx('info-label')}>Username</div>
                            <div className={cx('info-value')}>{userInfo?.userName ?? '—'}</div>
                        </div>

                        <div className={cx('info-item')}>
                            <div className={cx('info-label')}>Họ</div>
                            <div className={cx('info-value')}>{userInfo?.firstName ?? '—'}</div>
                        </div>

                        <div className={cx('info-item')}>
                            <div className={cx('info-label')}>Tên</div>
                            <div className={cx('info-value')}>{userInfo?.lastName ?? '—'}</div>
                        </div>

                        <div className={cx('info-item')}>
                            <div className={cx('info-label')}>Email</div>
                            <div className={cx('info-value')}>{userInfo?.email ?? '—'}</div>
                        </div>

                        <div className={cx('info-item')}>
                            <div className={cx('info-label')}>Số điện thoại</div>
                            <div className={cx('info-value')}>{userInfo?.phoneNumber ?? '—'}</div>
                        </div>

                        <div className={cx('info-item', 'full')}>
                            <div className={cx('info-label')}>Địa chỉ</div>
                            <div className={cx('info-value')}>{userInfo?.address ?? '—'}</div>
                        </div>
                    </div>
                </section>
            </main>

            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        </div>
    );
}
