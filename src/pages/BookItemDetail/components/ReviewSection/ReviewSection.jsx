import React from 'react';
import classNames from 'classnames/bind';
import styles from './ReviewSection.module.scss';
import ReviewForm from '../ReviewForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faStar,
    faCrown,
    faCheckCircle,
    faEllipsisVertical,
    faTrash,
    faEdit,
} from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react/headless';
import { Wrapper as PopperWrapper } from '../../../../Layouts/Popper';

const cx = classNames.bind(styles);

function ReviewSection({
    averageRating,
    reviews,
    renderStars,
    userReview,
    userRating,
    hoverRating,
    reviewComment,
    isSubmittingReview,
    handleStarClick,
    handleStarHover,
    setReviewComment,
    handleSubmitReview,
    handleDeleteReview,
    currentUserId,
}) {
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;

        if (/^https?:\/\//i.test(imagePath)) {
            try {
                const url = new URL(imagePath);
                imagePath = url.pathname || imagePath;
            } catch (err) {
                console.warn('getImageUrl: invalid absolute url', imagePath);
            }
        }

        let cleaned = imagePath.replace(/^\/+/, '');

        if (!cleaned.startsWith('Store/')) {
            cleaned = `Store/${cleaned}`;
        }

        return `/${cleaned}`;
    };

    const renderAvatar = (review) => {
        const hasProfileImage = review.profileImage || review.user?.profileImage;
        const profileImageUrl = review.profileImage || review.user?.profileImage;
        const firstName = review.firstName || review.user?.firstName || '';
        const lastName = review.lastName || review.user?.lastName || '';
        const userName = review.userName || 'Độc giả';
        const isAdmin = review.userName === 'admin1';

        const getInitials = () => {
            if (firstName && lastName) {
                return firstName.charAt(0) + lastName.charAt(0);
            }
            if (firstName) {
                return firstName.charAt(0);
            }
            if (userName) {
                return userName.charAt(0).toUpperCase();
            }
            return 'U';
        };

        return (
            <div className={cx('avatar-container')}>
                {hasProfileImage && profileImageUrl ? (
                    <>
                        <img
                            src={getImageUrl(profileImageUrl)}
                            alt="Avatar"
                            className={cx('review-avatar', { 'admin-border': isAdmin })}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                                const placeholder = e.currentTarget.nextElementSibling;
                                if (placeholder) {
                                    placeholder.style.display = 'flex';
                                }
                            }}
                        />
                        <div
                            className={cx('avatar-placeholder', 'fallback', { 'admin-placeholder': isAdmin })}
                            style={{ display: 'none' }}
                            aria-hidden="true"
                        >
                            {getInitials()}
                            {isAdmin && <FontAwesomeIcon icon={faCrown} className={cx('crown-icon')} />}
                        </div>
                    </>
                ) : (
                    <div className={cx('avatar-placeholder', { 'admin-placeholder': isAdmin })}>
                        {getInitials()}
                        {isAdmin && <FontAwesomeIcon icon={faCrown} className={cx('crown-icon')} />}
                    </div>
                )}
                {isAdmin && (
                    <div className={cx('admin-badge')}>
                        <FontAwesomeIcon icon={faCrown} />
                    </div>
                )}
            </div>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Hôm nay';
        } else if (diffDays === 1) {
            return 'Hôm qua';
        } else if (diffDays < 7) {
            return `${diffDays} ngày trước`;
        } else {
            return date.toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        }
    };

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((review) => {
            const roundedRating = Math.round(review.rating);
            if (roundedRating >= 1 && roundedRating <= 5) {
                distribution[roundedRating]++;
            }
        });
        return distribution;
    };

    const ratingDistribution = getRatingDistribution();

    return (
        <div className={cx('reviews-container')}>
            <div className={cx('section-header')}>
                <h2 className={cx('section-title')}>Đánh giá sản phẩm</h2>
                <div className={cx('section-divider')}></div>
            </div>

            <div className={cx('rating-overview')}>
                <div className={cx('overview-card')}>
                    <div className={cx('overview-content')}>
                        <div className={cx('overview-main')}>
                            <div className={cx('average-score')}>
                                <span className={cx('score-number')}>{averageRating.toFixed(1)}</span>
                                <span className={cx('score-total')}>/5.0</span>
                            </div>
                            <div className={cx('score-stars')}>{renderStars(averageRating)}</div>
                            <div className={cx('total-count')}>
                                <span className={cx('count-number')}>{reviews.length}</span>
                                <span className={cx('count-text')}> đánh giá</span>
                            </div>
                        </div>
                        <div className={cx('overview-progress')}>
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = ratingDistribution[star];
                                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                return (
                                    <div key={star} className={cx('progress-item')}>
                                        <div className={cx('progress-label')}>
                                            <span>{star} sao</span>
                                            <span className={cx('progress-count')}>{count}</span>
                                        </div>
                                        <div className={cx('progress-bar')}>
                                            <div
                                                className={cx('progress-fill')}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className={cx('progress-percentage')}>{percentage.toFixed(0)}%</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx('review-form-section')}>
                <h3 className={cx('form-title')}>Đánh giá của bạn</h3>
                <ReviewForm
                    userReview={userReview}
                    userRating={userRating}
                    hoverRating={hoverRating}
                    reviewComment={reviewComment}
                    isSubmittingReview={isSubmittingReview}
                    renderStars={renderStars}
                    handleStarClick={handleStarClick}
                    handleStarHover={handleStarHover}
                    setReviewComment={setReviewComment}
                    handleSubmitReview={handleSubmitReview}
                    handleDeleteReview={handleDeleteReview}
                />
            </div>

            <div className={cx('reviews-list-section')}>
                <div className={cx('list-header')}>
                    <h3 className={cx('list-title')}>
                        Đánh giá từ độc giả
                        <span className={cx('list-count')}> ({reviews.length})</span>
                    </h3>

                    {reviews.length > 0 && (
                        <Tippy
                            offset={[0, 10]}
                            interactive
                            placement="bottom-end"
                            render={(attrs) => (
                                <div className={cx('sort-dropdown')} tabIndex="-1" {...attrs}>
                                    <PopperWrapper>
                                        <div className={cx('sort-option')} role="button" tabIndex={0}>
                                            Mới nhất
                                        </div>
                                        <div className={cx('sort-option')} role="button" tabIndex={0}>
                                            Đánh giá cao nhất
                                        </div>
                                        <div className={cx('sort-option')} role="button" tabIndex={0}>
                                            Đánh giá thấp nhất
                                        </div>
                                        <div className={cx('sort-divider')}></div>
                                        <div className={cx('sort-option')} role="button" tabIndex={0}>
                                            Chỉ xem đã duyệt
                                        </div>
                                    </PopperWrapper>
                                </div>
                            )}
                        >
                            <button className={cx('sort-button')}>
                                <span>Sắp xếp</span>
                                <FontAwesomeIcon icon={faEllipsisVertical} className={cx('sort-icon')} />
                            </button>
                        </Tippy>
                    )}
                </div>

                {reviews.length > 0 ? (
                    <div className={cx('reviews-grid')}>
                        {reviews.map((review, index) => {
                            const isAdmin = review.userName === 'admin1';
                            const isVerified = review.isVerified || isAdmin;
                            const canEdit = currentUserId && (review.userId === currentUserId || isAdmin);

                            return (
                                <div
                                    key={review.reviewId || index}
                                    className={cx('review-card', { 'admin-card': isAdmin })}
                                >
                                    <div className={cx('card-header')}>
                                        <div className={cx('user-info')}>
                                            {renderAvatar(review)}
                                            <div className={cx('user-details')}>
                                                <div className={cx('user-name-row')}>
                                                    <span className={cx('user-name', { 'admin-name': isAdmin })}>
                                                        {review.userName || 'Độc giả'}
                                                    </span>
                                                    {isAdmin && (
                                                        <span className={cx('admin-tag')}>
                                                            <FontAwesomeIcon icon={faCrown} />
                                                            <span>Quản trị viên</span>
                                                        </span>
                                                    )}
                                                    {isVerified && !isAdmin && (
                                                        <span className={cx('verified-tag')}>
                                                            <FontAwesomeIcon icon={faCheckCircle} />
                                                            <span>Đã xác thực</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={cx('review-meta')}>
                                                    <div className={cx('review-stars')}>
                                                        {renderStars(review.rating)}
                                                        <span className={cx('rating-text')}>
                                                            {review.rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <span className={cx('review-date')}>
                                                        {formatDate(review.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {canEdit && (
                                            <Tippy
                                                offset={[0, 10]}
                                                interactive
                                                placement="bottom-end"
                                                render={(attrs) => (
                                                    <div className={cx('action-dropdown')} tabIndex="-1" {...attrs}>
                                                        <PopperWrapper>
                                                            <div
                                                                className={cx('action-option')}
                                                                role="button"
                                                                tabIndex={0}
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                                <span>Chỉnh sửa</span>
                                                            </div>
                                                            <div
                                                                className={cx('action-option', 'delete')}
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={() =>
                                                                    handleDeleteReview &&
                                                                    handleDeleteReview(review.reviewId)
                                                                }
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                                <span>Xóa</span>
                                                            </div>
                                                        </PopperWrapper>
                                                    </div>
                                                )}
                                            >
                                                <button className={cx('action-button')}>
                                                    <FontAwesomeIcon icon={faEllipsisVertical} />
                                                </button>
                                            </Tippy>
                                        )}
                                    </div>

                                    <div className={cx('card-body')}>
                                        <p className={cx('review-content')}>
                                            {review.comment || 'Không có nội dung đánh giá.'}
                                        </p>
                                    </div>

                                    {review.isApproved === false && (
                                        <div className={cx('card-footer')}>
                                            <div className={cx('pending-badge')}>
                                                <span className={cx('pending-icon')}>⏳</span>
                                                <span>Đang chờ duyệt</span>
                                            </div>
                                        </div>
                                    )}

                                    {isAdmin && <div className={cx('admin-glow')}></div>}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={cx('no-reviews-container')}>
                        <div className={cx('no-reviews-icon')}>⭐</div>
                        <h4 className={cx('no-reviews-title')}>Chưa có đánh giá nào</h4>
                        <p className={cx('no-reviews-text')}>Hãy là người đầu tiên chia sẻ cảm nhận về sản phẩm này!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReviewSection;
