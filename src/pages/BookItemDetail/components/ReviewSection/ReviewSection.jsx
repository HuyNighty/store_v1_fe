import React from 'react';
import classNames from 'classnames/bind';
import styles from './ReviewSection.module.scss';
import ReviewForm from '../ReviewForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

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
}) {
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;

        if (imagePath.startsWith('http')) {
            let fixedPath = imagePath;

            if (fixedPath.startsWith('https://52.62.234.97')) {
                fixedPath = fixedPath.replace('https://', 'http://');
            }

            if (fixedPath.includes('52.62.234.97') && !fixedPath.includes(':8080')) {
                fixedPath = fixedPath.replace('52.62.234.97', '52.62.234.97:8080');
            }

            return fixedPath;
        }

        let cleaned = imagePath.replace(/^\/+/, '');

        if (!cleaned.startsWith('Store/')) {
            cleaned = `Store/${cleaned}`;
        }

        const HOST = 'http://52.62.234.97:8080';
        const finalUrl = `${HOST}/${cleaned}`;
        console.log('🔄 ReviewSection - Final URL:', finalUrl);
        return finalUrl;
    };

    const renderAvatar = (review) => {
        const hasProfileImage = review.profileImage || review.user?.profileImage;
        const profileImageUrl = review.profileImage || review.user?.profileImage;
        const firstName = review.firstName || review.user?.firstName || '';
        const lastName = review.lastName || review.user?.lastName || '';
        const userName = review.userName || 'Độc giả';

        if (hasProfileImage && profileImageUrl) {
            return (
                <div className={cx('avatar-container')}>
                    <img
                        src={getImageUrl(profileImageUrl)}
                        alt="Avatar"
                        className={cx('review-avatar')}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            const placeholder = e.target.nextSibling;
                            if (placeholder) {
                                placeholder.style.display = 'flex';
                            }
                        }}
                    />

                    <div className={cx('avatar-placeholder', 'fallback')} style={{ display: 'none' }}>
                        {firstName ? firstName.charAt(0) + (lastName?.charAt(0) || '') : userName.charAt(0)}
                    </div>
                </div>
            );
        }

        return (
            <div className={cx('avatar-placeholder')}>
                {firstName ? firstName.charAt(0) + (lastName?.charAt(0) || '') : userName.charAt(0)}
            </div>
        );
    };

    return (
        <div className={cx('reviews-container')}>
            <div className={cx('review-summary')}>
                <div className={cx('average-rating')}>
                    <div className={cx('rating-number')}>{averageRating.toFixed(1)}</div>
                    <div className={cx('rating-stars')}>{renderStars(averageRating)}</div>
                    <div className={cx('total-reviews')}>{reviews.length} đánh giá</div>
                </div>
            </div>

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

            <div className={cx('reviews-list')}>
                <h4>Đánh giá từ độc giả</h4>
                {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <div key={review.reviewId || index} className={cx('review-item')}>
                            <div className={cx('review-header')}>
                                <div className={cx('reviewer-info')}>
                                    {renderAvatar(review)}
                                    <div className={cx('reviewer-details')}>
                                        <div className={cx('reviewer')}>{review.userName || 'Độc giả'}</div>
                                        <div className={cx('reviewer-email')}>{review.email || 'Độc giả'}</div>
                                        <div className={cx('review-rating')}>{renderStars(review.rating)}</div>
                                    </div>
                                </div>
                                <div className={cx('review-date')}>
                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                            <div className={cx('review-content')}>
                                <p>{review.comment}</p>
                            </div>
                            {review.isApproved === false && (
                                <div className={cx('review-status')}>
                                    <em>Đánh giá đang chờ duyệt</em>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className={cx('no-reviews')}>Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
            </div>
        </div>
    );
}

export default ReviewSection;
