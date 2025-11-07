import React, { useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ReviewForm.module.scss';
import Button from '../../../../Layouts/components/Button';
import { AuthContext } from '../../../../contexts/AuthContext';

const cx = classNames.bind(styles);

/**
 * Props
 * - userReview, userRating, hoverRating, reviewComment, isSubmittingReview
 * - renderStars (optional fallback)
 * - handleStarClick(rating: number), handleStarHover(rating: number)
 * - setReviewComment, handleSubmitReview, handleDeleteReview
 */
function ReviewForm({
    userReview,
    userRating = 0,
    hoverRating = 0,
    reviewComment = '',
    isSubmittingReview = false,
    renderStars,
    handleStarClick,
    handleStarHover,
    setReviewComment,
    handleSubmitReview,
    handleDeleteReview,
}) {
    const { user } = useContext(AuthContext) || {};
    const navigate = useNavigate();
    const starGroupRef = useRef(null);

    const handleLoginRedirect = () => {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('redirectPath', currentPath);
        navigate('/login');
    };

    // Fallback interactive star renderer (supports half-stars)
    const LocalInteractiveStars = ({ value = 0 }) => {
        const display = hoverRating || value;
        const stars = [];

        // helper to set rating (0.5 increments)
        const setRating = (r) => {
            if (typeof handleStarClick === 'function') handleStarClick(r);
        };

        // keyboard support on group: ArrowLeft/Right change by 0.5, Home/End to min/max
        const onGroupKeyDown = (e) => {
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(e.key)) {
                e.preventDefault();
                let next = userRating || 0;
                if (e.key === 'ArrowLeft') next = Math.max(0, (hoverRating || userRating) - 0.5);
                if (e.key === 'ArrowRight') next = Math.min(5, (hoverRating || userRating) + 0.5);
                if (e.key === 'Home') next = 0;
                if (e.key === 'End') next = 5;
                if (e.key === 'Enter' || e.key === ' ') {
                    // commit current hover or userRating if none
                    setRating(hoverRating || userRating || 0.5);
                    return;
                }
                if (typeof handleStarHover === 'function') handleStarHover(next);
            }
        };

        for (let i = 1; i <= 5; i++) {
            const full = display >= i;
            const half = !full && display >= i - 0.5;
            const starKey = `star-${i}`;

            stars.push(
                <span
                    key={starKey}
                    className={cx('star-wrapper')}
                    onMouseLeave={() => typeof handleStarHover === 'function' && handleStarHover(0)}
                    role="presentation"
                >
                    {/* left half (i - 0.5) */}
                    <button
                        type="button"
                        aria-label={`${i - 0.5} sao`}
                        className={cx('star-hit', 'left')}
                        onMouseEnter={() => typeof handleStarHover === 'function' && handleStarHover(i - 0.5)}
                        onClick={() => setRating(i - 0.5)}
                        onFocus={() => typeof handleStarHover === 'function' && handleStarHover(i - 0.5)}
                    />
                    {/* right half (i) */}
                    <button
                        type="button"
                        aria-label={`${i} sao`}
                        className={cx('star-hit', 'right')}
                        onMouseEnter={() => typeof handleStarHover === 'function' && handleStarHover(i)}
                        onClick={() => setRating(i)}
                        onFocus={() => typeof handleStarHover === 'function' && handleStarHover(i)}
                    />
                    {/* visible star icon */}
                    <span
                        className={cx('star', {
                            filled: full,
                            half: half,
                            empty: !full && !half,
                        })}
                        aria-hidden="true"
                    >
                        {/* simple unicode star — component using FontAwesome/ReactIcons can replace */}
                        {full ? '★' : half ? '⯨' : '☆'}
                    </span>
                </span>,
            );
        }

        return (
            <div
                className={cx('interactive-stars')}
                role="radiogroup"
                aria-label="Đánh giá bằng sao"
                tabIndex={0}
                ref={starGroupRef}
                onKeyDown={onGroupKeyDown}
                onMouseLeave={() => typeof handleStarHover === 'function' && handleStarHover(0)}
            >
                {stars}
            </div>
        );
    };

    // If no user -> show login prompt
    if (!user) {
        return (
            <div className={cx('write-review')}>
                <h4>Đánh giá sản phẩm</h4>
                <div className={cx('login-prompt')}>
                    <p>Bạn cần đăng nhập để viết đánh giá</p>
                    <Button primary onClick={handleLoginRedirect} type="button">
                        Đăng nhập để đánh giá
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('write-review')} aria-live="polite">
            <h4>{userReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá của bạn'}</h4>

            <div className={cx('review-form')}>
                <div className={cx('rating-input')}>
                    <label id="rating-label">Đánh giá của bạn:</label>

                    {/* Prefer caller's renderStars if it's a function and supports interactive mode */}
                    {typeof renderStars === 'function' ? (
                        // try-call with common signatures; if it errors, fallback to local
                        (function tryRender() {
                            try {
                                // common signatures: renderStars(value) or renderStars(value, interactive, onClick, onHover, hover)
                                if (renderStars.length >= 4) {
                                    return renderStars(userRating, true, handleStarClick, handleStarHover, hoverRating);
                                }
                                return renderStars(userRating, true);
                            } catch (err) {
                                return <LocalInteractiveStars value={userRating} />;
                            }
                        })()
                    ) : (
                        <LocalInteractiveStars value={userRating} />
                    )}

                    <div className={cx('rating-text')}>{userRating > 0 ? `${userRating} sao` : 'Chọn số sao'}</div>
                </div>

                <div className={cx('comment-input')}>
                    <label htmlFor="review-comment">Nhận xét:</label>
                    <textarea
                        id="review-comment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                        rows="5"
                        maxLength={1000}
                        aria-label="Nội dung nhận xét"
                        aria-describedby="char-count"
                    />
                    <div id="char-count" className={cx('char-count')}>
                        {reviewComment.length}/1000 ký tự
                    </div>
                </div>

                <div className={cx('review-actions')}>
                    <Button
                        primary
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview || userRating === 0 || !reviewComment.trim()}
                        type="button"
                    >
                        {isSubmittingReview ? 'Đang gửi...' : userReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                    </Button>

                    {userReview && (
                        <Button outline onClick={handleDeleteReview} disabled={isSubmittingReview} type="button">
                            Xóa đánh giá
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReviewForm;
