import React from 'react';
import classNames from 'classnames/bind';
import styles from './ReviewSection.module.scss';
import ReviewForm from '../ReviewForm';

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
                                    <div className={cx('reviewer')}>{review.userName || 'Độc giả'}</div>
                                    <div className={cx('review-rating')}>{renderStars(review.rating)}</div>
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
