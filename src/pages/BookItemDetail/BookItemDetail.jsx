import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './BookItemDetail.module.scss';
import Button from '../../Layouts/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHeart, faShare, faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/Toast/ToastContext';
import { useWishlist } from '../../contexts/WishlistContext';
import reviewApi from '../../api/reviewApi';

// Import components
import BookImages from './components/BookImages';
import BookInfo from './components/BookInfo';
import BookTabs from './components/BookTabs';

const cx = classNames.bind(styles);

function BookItemDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { book } = location.state || {};
    const { addToCart, isItemInCart, getItemQuantity, updateCartItem } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToast } = useToast();

    // State management
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Review state
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);

    // Định nghĩa các hàm trước useEffect
    const loadReviews = useCallback(async () => {
        if (!book?.productId) return;

        try {
            console.log('🔄 Loading reviews for product:', book.productId);
            const response = await reviewApi.getReviewsByProduct(book.productId);

            let reviewsData = [];

            if (response.data && response.data.result !== undefined) {
                if (Array.isArray(response.data.result)) {
                    reviewsData = response.data.result;
                }
            } else if (Array.isArray(response.data)) {
                reviewsData = response.data;
            }

            setReviews(reviewsData);
        } catch (error) {
            console.error('❌ Error loading reviews:', error);
            setReviews(book?.reviews || []);
        }
    }, [book?.productId]);

    const checkUserReview = useCallback(async () => {
        if (!book?.productId) return;

        try {
            const response = await reviewApi.getMyReviews();
            let userReviews = [];

            if (response.data && response.data.result && Array.isArray(response.data.result)) {
                userReviews = response.data.result;
            } else if (Array.isArray(response.data)) {
                userReviews = response.data;
            }

            if (userReviews.length > 0) {
                const existingReview = userReviews.find((review) => review.productId === book.productId);
                if (existingReview) {
                    setUserReview(existingReview);
                    setUserRating(existingReview.rating);
                    setReviewComment(existingReview.comment || '');
                } else {
                    setUserReview(null);
                    setUserRating(0);
                    setReviewComment('');
                }
            } else {
                setUserReview(null);
                setUserRating(0);
                setReviewComment('');
            }
        } catch (error) {
            console.error('❌ Error checking user review:', error);
            setUserReview(null);
            setUserRating(0);
            setReviewComment('');
        }
    }, [book?.productId]); // Chỉ phụ thuộc vào productId

    useEffect(() => {
        if (book?.productId) {
            setIsWishlisted(isInWishlist(book.productId));
        }
    }, [book, isInWishlist]);

    useEffect(() => {
        if (book?.productId) {
            console.log('📚 Loading reviews for new product');
            loadReviews();
        }
    }, [book?.productId, loadReviews]);

    useEffect(() => {
        if (book?.productId) {
            console.log('📚 Checking user review for new product');
            checkUserReview();
        }
    }, [book?.productId, checkUserReview]);

    // Render rating stars function
    const renderStars = (rating, interactive = false, onStarClick = null, onStarHover = null) => {
        const stars = [];
        const currentRating = interactive ? hoverRating || userRating : rating;
        const fullStars = Math.floor(currentRating);
        const hasHalfStar = currentRating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={cx('star', 'filled')}
                        onClick={() => interactive && onStarClick && onStarClick(i)}
                        onMouseEnter={() => interactive && onStarHover && onStarHover(i)}
                        onMouseLeave={() => interactive && onStarHover && onStarHover(0)}
                    />,
                );
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(
                    <FontAwesomeIcon
                        key="half"
                        icon={faStarHalfAlt}
                        className={cx('star', 'filled')}
                        onClick={() => interactive && onStarClick && onStarClick(i - 0.5)}
                        onMouseEnter={() => interactive && onStarHover && onStarHover(i - 0.5)}
                        onMouseLeave={() => interactive && onStarHover && onStarHover(0)}
                    />,
                );
            } else {
                stars.push(
                    <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={cx('star', 'empty')}
                        onClick={() => interactive && onStarClick && onStarClick(i)}
                        onMouseEnter={() => interactive && onStarHover && onStarHover(i)}
                        onMouseLeave={() => interactive && onStarHover && onStarHover(0)}
                    />,
                );
            }
        }

        return stars;
    };

    // Review handlers
    const handleStarClick = (rating) => {
        setUserRating(rating);
    };

    const handleStarHover = (rating) => {
        setHoverRating(rating);
    };

    const handleSubmitReview = async () => {
        if (!book?.productId) return;

        console.log('🔍 Submitting review:', {
            rating: userRating,
            comment: reviewComment,
            isNewReview: !userReview,
            productId: book.productId,
        });

        if (userRating === 0) {
            addToast('Vui lòng chọn số sao đánh giá', 'error');
            return;
        }

        if (!reviewComment.trim()) {
            addToast('Vui lòng nhập nội dung đánh giá', 'error');
            return;
        }

        setIsSubmittingReview(true);
        try {
            const reviewData = {
                rating: userRating,
                comment: reviewComment.trim(),
            };

            console.log('📤 Sending review data:', reviewData);

            let response;
            if (userReview) {
                // UPDATE existing review
                response = await reviewApi.updateReview(userReview.reviewId, reviewData);
                console.log('✅ Update response:', response);
                addToast('Đã cập nhật đánh giá thành công!', 'success');
            } else {
                // CREATE new review
                response = await reviewApi.createReview(book.productId, reviewData);
                console.log('✅ Create response:', response);
                addToast('Đã gửi đánh giá thành công!', 'success');

                // QUAN TRỌNG: Cập nhật ngay userReview với data mới
                // Giả sử API trả về review vừa tạo trong response
                if (response.data && response.data.result) {
                    const newReview = response.data.result;
                    setUserReview(newReview);
                }
            }

            // Reload danh sách reviews từ server
            await loadReviews();

            // Nếu là update, đảm bảo userReview được cập nhật
            if (userReview) {
                await checkUserReview();
            }
        } catch (error) {
            console.error('❌ Error submitting review:', error);
            console.error('❌ Error details:', error.response?.data);
            addToast(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá', 'error');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!userReview) return;

        if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            try {
                await reviewApi.deleteReview(userReview.reviewId);
                addToast('Đã xóa đánh giá thành công', 'success');

                setUserReview(null);
                setUserRating(0);
                setReviewComment('');
                setReviews((prev) => prev.filter((review) => review.reviewId !== userReview.reviewId));
            } catch (error) {
                console.error('Error deleting review:', error);
                addToast('Có lỗi xảy ra khi xóa đánh giá', 'error');
            }
        }
    };

    // Navigation and action handlers
    const handleBack = () => {
        navigate(-1);
    };

    const handleAddToCart = async () => {
        if (!book?.productId) return;

        if (stockQuantity === 0) {
            addToast('Sản phẩm đã hết hàng', 'error');
            return;
        }

        setAddingToCart(true);
        try {
            const result = await addToCart(book.productId, quantity);
            if (result.success) {
                addToast(result.message || 'Đã thêm vào giỏ hàng!', 'success');
            } else {
                addToast(result.error || 'Thêm vào giỏ hàng thất bại', 'error');
            }
        } catch (error) {
            addToast('Có lỗi xảy ra khi thêm vào giỏ hàng', 'error');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleUpdateCart = async () => {
        if (!book?.productId) return;

        setAddingToCart(true);
        try {
            const newTotalQuantity = cartQuantity + quantity;
            const result = await updateCartItem(book.productId, newTotalQuantity);

            if (result.success) {
                addToast(result.message || 'Đã cập nhật giỏ hàng!', 'success');
                setQuantity(1);
            } else {
                addToast(result.error || 'Cập nhật giỏ hàng thất bại', 'error');
            }
        } catch (error) {
            addToast('Có lỗi xảy ra khi cập nhật giỏ hàng', 'error');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        if (!book?.productId) return;

        if (stockQuantity === 0) {
            addToast('Sản phẩm đã hết hàng', 'error');
            return;
        }

        addToCart(book.productId, quantity).then(() => {
            navigate('/checkout');
        });
    };

    const handleWishlistToggle = () => {
        if (!book?.productId) return;

        if (isWishlisted) {
            removeFromWishlist(book.productId);
            setIsWishlisted(false);
            addToast('Đã xóa khỏi danh sách yêu thích', 'info');
        } else {
            addToWishlist(book);
            setIsWishlisted(true);
            addToast('Đã thêm vào danh sách yêu thích', 'success');
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: productName,
                text: description || `Khám phá cuốn sách "${productName}"`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            addToast('Đã sao chép link chia sẻ', 'success');
        }
    };

    if (!book) {
        return (
            <div className={cx('container')}>
                <div className={cx('error')}>
                    <h2>Không tìm thấy thông tin sách</h2>
                    <Button primary onClick={() => navigate('/')}>
                        Quay về trang chủ
                    </Button>
                </div>
            </div>
        );
    }

    // Destructure book data - ĐẶT SAU check book tồn tại
    const {
        productId,
        productName,
        productAssets = [],
        featured,
        bookAuthors = [],
        salePrice,
        price,
        rating = 0,
        reviewCount = 0,
        stockQuantity = 0,
        weightG = 0,
        description,
        categories = [],
        sku,
        publisher,
        publishedDate,
        pages,
        language,
        isbn,
    } = book;

    // Calculated values
    const displayPrice = salePrice ?? price;
    const discountPercent = salePrice && price ? Math.round((1 - salePrice / price) * 100) : 0;
    const isInCart = isItemInCart(productId);
    const cartQuantity = getItemQuantity(productId);
    const averageRating =
        reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : rating;

    return (
        <div className={cx('container')}>
            {/* Header */}
            <div className={cx('header')}>
                <Button shine outline back onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
                <h1>Chi tiết sách</h1>
            </div>

            {/* Breadcrumb */}
            <div className={cx('breadcrumb')}>
                <span onClick={() => navigate('/')}>Trang chủ</span>
                <span>/</span>
                <span onClick={() => navigate('/books')}>Sách</span>
                <span>/</span>
                <span className={cx('current')}>{productName}</span>
            </div>

            {/* Main Content */}
            <div className={cx('content')}>
                <BookImages
                    productName={productName}
                    productAssets={productAssets}
                    featured={featured}
                    discountPercent={discountPercent}
                    selectedImage={selectedImage}
                    onImageSelect={setSelectedImage}
                />

                <BookInfo
                    productName={productName}
                    sku={sku}
                    categories={categories}
                    bookAuthors={bookAuthors}
                    navigate={navigate}
                    averageRating={averageRating}
                    renderStars={renderStars}
                    reviewCount={reviewCount}
                    reviews={reviews}
                    setActiveTab={setActiveTab}
                    displayPrice={displayPrice}
                    salePrice={salePrice}
                    price={price}
                    discountPercent={discountPercent}
                    publisher={publisher}
                    publishedDate={publishedDate}
                    pages={pages}
                    language={language}
                    isbn={isbn}
                    weightG={weightG}
                    stockQuantity={stockQuantity}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    isInCart={isInCart}
                    cartQuantity={cartQuantity}
                    addingToCart={addingToCart}
                    handleAddToCart={handleAddToCart}
                    handleUpdateCart={handleUpdateCart}
                    handleBuyNow={handleBuyNow}
                    isWishlisted={isWishlisted}
                    handleWishlistToggle={handleWishlistToggle}
                    handleShare={handleShare}
                />
            </div>

            {/* Additional Info Tabs */}
            <BookTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                productName={productName}
                description={description}
                bookAuthors={bookAuthors}
                sku={sku}
                publisher={publisher}
                publishedDate={publishedDate}
                pages={pages}
                language={language}
                isbn={isbn}
                weightG={weightG}
                stockQuantity={stockQuantity}
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
}

export default BookItemDetail;
