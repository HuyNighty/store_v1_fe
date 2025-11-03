import React from 'react';
import classNames from 'classnames/bind';
import styles from './ReviewForm.module.scss';
import Button from '../../../../Layouts/components/Button';

const cx = classNames.bind(styles);

function ReviewForm({
    userReview,
    userRating,
    hoverRating,
    reviewComment,
    isSubmittingReview,
    renderStars,
    handleStarClick,
    handleStarHover,
    setReviewComment,
    handleSubmitReview,
    handleDeleteReview,
}) {
    return (
        <div className={cx('write-review')}>
            <h4>{userReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá của bạn'}</h4>
            <div className={cx('review-form')}>
                <div className={cx('rating-input')}>
                    <label>Đánh giá của bạn:</label>
                    <div className={cx('interactive-stars')} onMouseLeave={() => handleStarHover(0)}>
                        {renderStars(userRating, true, handleStarClick, handleStarHover, hoverRating)}
                        <span className={cx('rating-text')}>
                            {userRating > 0 ? `${userRating} sao` : 'Chọn số sao'}
                        </span>
                    </div>
                </div>
                <div className={cx('comment-input')}>
                    <label>Nhận xét:</label>
                    <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                        rows="5"
                        maxLength="1000"
                    />
                    <div className={cx('char-count')}>{reviewComment.length}/1000 ký tự</div>
                </div>
                <div className={cx('review-actions')}>
                    <Button
                        primary
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview || userRating === 0 || !reviewComment.trim()}
                    >
                        {isSubmittingReview ? 'Đang gửi...' : userReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                    </Button>
                    {userReview && (
                        <Button outline onClick={handleDeleteReview} disabled={isSubmittingReview}>
                            Xóa đánh giá
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReviewForm;
