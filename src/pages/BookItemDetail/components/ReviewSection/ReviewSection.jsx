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
            return imagePath;
        }

        const baseUrl = 'http://localhost:8080';
        return `${baseUrl}/Store${imagePath}`;
    };

    // Hàm hiển thị avatar - ĐÃ SỬA
    const renderAvatar = (review) => {
        const hasProfileImage = review.profileImage || review.user?.profileImage;
        const profileImageUrl = review.profileImage || review.user?.profileImage;
        const firstName = review.firstName || review.user?.firstName || '';
        const lastName = review.lastName || review.user?.lastName || '';
        const userName = review.userName || 'Độc giả';

        // Nếu có ảnh, hiển thị ảnh với fallback
        if (hasProfileImage && profileImageUrl) {
            return (
                <div className={cx('avatar-container')}>
                    <img
                        src={getImageUrl(profileImageUrl)}
                        alt="Avatar"
                        className={cx('review-avatar')}
                        onError={(e) => {
                            // Khi ảnh lỗi, hiển thị placeholder với chữ cái đầu
                            e.target.style.display = 'none';
                        }}
                    />
                    {/* Fallback hiển thị khi ảnh lỗi */}
                    <div className={cx('avatar-placeholder', 'fallback')} style={{ display: 'none' }}>
                        {firstName ? firstName.charAt(0) + (lastName?.charAt(0) || '') : userName.charAt(0)}
                    </div>
                </div>
            );
        }

        // Nếu không có ảnh, hiển thị placeholder với chữ cái đầu
        return (
            <div className={cx('avatar-placeholder')}>
                {firstName ? firstName.charAt(0) + (lastName?.charAt(0) || '') : userName.charAt(0)}
            </div>
        );
    };

    return (
        <div className={cx('reviews-container')}>
            {/* Review Summary */}
            <div className={cx('review-summary')}>
                <div className={cx('average-rating')}>
                    <div className={cx('rating-number')}>{averageRating.toFixed(1)}</div>
                    <div className={cx('rating-stars')}>{renderStars(averageRating)}</div>
                    <div className={cx('total-reviews')}>{reviews.length} đánh giá</div>
                </div>
            </div>

            {/* Write Review Form */}
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

            {/* Reviews List */}
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
