import React from 'react';
import classNames from 'classnames/bind';
import styles from './BookTabs.module.scss';
import ReviewSection from '../ReviewSection';

const cx = classNames.bind(styles);

function BookTabs({
    activeTab,
    setActiveTab,
    productName,
    description,
    bookAuthors,
    sku,
    publisher,
    publishedDate,
    pages,
    language,
    isbn,
    weightG,
    stockQuantity,
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
    const renderTabContent = () => {
        switch (activeTab) {
            case 'description':
                return (
                    <div className={cx('tab-panel')}>
                        <h3>Giới thiệu về "{productName}"</h3>
                        <p>
                            {description ||
                                `Cuốn sách "${productName}" là một tác phẩm đáng chú ý trong thể loại này. Thông tin chi tiết về nội dung sẽ được cập nhật sớm nhất.`}
                        </p>
                    </div>
                );

            case 'details':
                return (
                    <div className={cx('tab-panel')}>
                        <h3>Thông số kỹ thuật</h3>
                        <div className={cx('specs-grid')}>
                            <div className={cx('spec-item')}>
                                <strong>Tên sản phẩm:</strong>
                                <span>{productName}</span>
                            </div>
                            <div className={cx('spec-item')}>
                                <strong>SKU:</strong>
                                <span>{sku || 'N/A'}</span>
                            </div>
                            <div className={cx('spec-item')}>
                                <strong>Tác giả:</strong>
                                <span>{bookAuthors.map((a) => a.authorName).join(', ') || 'Đang cập nhật'}</span>
                            </div>
                            {publisher && (
                                <div className={cx('spec-item')}>
                                    <strong>Nhà xuất bản:</strong>
                                    <span>{publisher}</span>
                                </div>
                            )}
                            {publishedDate && (
                                <div className={cx('spec-item')}>
                                    <strong>Ngày xuất bản:</strong>
                                    <span>{new Date(publishedDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                            )}
                            {pages && (
                                <div className={cx('spec-item')}>
                                    <strong>Số trang:</strong>
                                    <span>{pages}</span>
                                </div>
                            )}
                            {language && (
                                <div className={cx('spec-item')}>
                                    <strong>Ngôn ngữ:</strong>
                                    <span>{language}</span>
                                </div>
                            )}
                            {isbn && (
                                <div className={cx('spec-item')}>
                                    <strong>ISBN:</strong>
                                    <span>{isbn}</span>
                                </div>
                            )}
                            <div className={cx('spec-item')}>
                                <strong>Trọng lượng:</strong>
                                <span>{weightG}g</span>
                            </div>
                            <div className={cx('spec-item')}>
                                <strong>Tình trạng:</strong>
                                <span>{stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
                            </div>
                        </div>
                    </div>
                );

            case 'reviews':
                return (
                    <div className={cx('tab-panel')}>
                        <ReviewSection
                            averageRating={averageRating}
                            reviews={reviews}
                            renderStars={renderStars}
                            userReview={userReview}
                            userRating={userRating}
                            hoverRating={hoverRating}
                            reviewComment={reviewComment}
                            isSubmittingReview={isSubmittingReview}
                            handleStarClick={handleStarClick}
                            handleStarHover={handleStarHover}
                            setReviewComment={setReviewComment}
                            handleSubmitReview={handleSubmitReview}
                            handleDeleteReview={handleDeleteReview}
                        />
                    </div>
                );

            case 'shipping':
                return (
                    <div className={cx('tab-panel')}>
                        <h3>Chính sách vận chuyển & Trả hàng</h3>
                        <div className={cx('shipping-info')}>
                            <h4>🚚 Vận chuyển</h4>
                            <ul>
                                <li>Miễn phí vận chuyển cho đơn hàng từ 300.000đ</li>
                                <li>Phí vận chuyển 20.000đ cho đơn hàng dưới 300.000đ</li>
                                <li>Giao hàng toàn quốc trong 2-4 ngày làm việc</li>
                                <li>Hỗ trợ giao hàng nhanh trong 24h (tính phí)</li>
                            </ul>

                            <h4>🔄 Đổi trả</h4>
                            <ul>
                                <li>Đổi trả trong vòng 7 ngày kể từ khi nhận hàng</li>
                                <li>Sách phải còn nguyên vẹn, không bị rách, bẩn</li>
                                <li>Miễn phí đổi trả do lỗi từ nhà sản xuất</li>
                                <li>Liên hệ hotline: 1800-xxxx để được hỗ trợ</li>
                            </ul>

                            <h4>🛡️ Bảo hành</h4>
                            <ul>
                                <li>Bảo hành chất lượng in ấn: 30 ngày</li>
                                <li>Đảm bảo sách chính hãng, không phải sách lậu</li>
                                <li>Hoàn tiền 100% nếu phát hiện sách giả</li>
                            </ul>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={cx('tabs-section')}>
            <div className={cx('tabs-header')}>
                <button
                    className={cx('tab', { active: activeTab === 'description' })}
                    onClick={() => setActiveTab('description')}
                >
                    Mô tả sản phẩm
                </button>
                <button
                    className={cx('tab', { active: activeTab === 'details' })}
                    onClick={() => setActiveTab('details')}
                >
                    Thông tin chi tiết
                </button>
                <button
                    className={cx('tab', { active: activeTab === 'reviews' })}
                    onClick={() => setActiveTab('reviews')}
                >
                    Đánh giá ({reviews.length})
                </button>
                <button
                    className={cx('tab', { active: activeTab === 'shipping' })}
                    onClick={() => setActiveTab('shipping')}
                >
                    Vận chuyển & Trả hàng
                </button>
            </div>

            <div className={cx('tabs-content')}>{renderTabContent()}</div>
        </div>
    );
}

export default BookTabs;
