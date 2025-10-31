import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Author.module.scss';
import Button from '../../Layouts/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBook, faCalendar, faMapMarkerAlt, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import authorApi from '../../api/authorApi';
import { BookItem } from '../../components/BookItem';

const cx = classNames.bind(styles);

function Author() {
    const { authorId } = useParams();
    const navigate = useNavigate();
    const [author, setAuthor] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        const fetchAuthorData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Sử dụng API public endpoints
                const [authorResponse, booksResponse] = await Promise.all([
                    authorApi.getAuthorDetail(authorId), // Sửa thành getAuthorDetail
                    authorApi.getAuthorBooks(authorId),
                ]);

                // Lấy data từ response
                const authorData = authorResponse.data?.result || authorResponse.data;
                const booksData =
                    booksResponse.data?.result?.books || booksResponse.data?.books || booksResponse.data || [];

                setAuthor(authorData);
                setBooks(booksData);
            } catch (err) {
                console.error('Error fetching author data:', err);
                setError('Không thể tải thông tin tác giả');
            } finally {
                setLoading(false);
            }
        };

        if (authorId) {
            fetchAuthorData();
        }
    }, [authorId]);

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className={cx('container')}>
                <div className={cx('loading')}>Đang tải thông tin tác giả...</div>
            </div>
        );
    }

    if (error || !author) {
        return (
            <div className={cx('container')}>
                <div className={cx('error')}>
                    <h2>{error || 'Không tìm thấy thông tin tác giả'}</h2>
                    <Button primary onClick={handleBack}>
                        Quay lại
                    </Button>
                    <Button outline onClick={() => navigate('/books')} style={{ marginLeft: '10px' }}>
                        Xem sách
                    </Button>
                </div>
            </div>
        );
    }

    const { authorName, bio, bornDate, deathDate, nationality, portraitUrl, wikiUrl, totalBooks, averageRating } =
        author;

    const calculateAge = (born, death) => {
        try {
            const bornYear = new Date(born).getFullYear();
            const deathYear = death ? new Date(death).getFullYear() : new Date().getFullYear();
            return deathYear - bornYear;
        } catch (error) {
            console.error('Error calculating age:', error);
            return 0;
        }
    };

    const getNationalityText = (nationality) => {
        const nationalityMap = {
            VN: 'Việt Nam',
            US: 'Mỹ',
            UK: 'Anh',
            FR: 'Pháp',
            JP: 'Nhật Bản',
            CN: 'Trung Quốc',
            KR: 'Hàn Quốc',
            RU: 'Nga',
            OTHER: 'Khác',
        };
        return nationalityMap[nationality] || nationality;
    };

    const displayBooks = books.length > 0 ? books : [];

    return (
        <div className={cx('container')}>
            {/* Header */}
            <div className={cx('header')}>
                <Button shine outline back onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
                <h1>Thông tin tác giả</h1>
            </div>

            {/* Breadcrumb */}
            <div className={cx('breadcrumb')}>
                <span onClick={() => navigate('/')}>Trang chủ</span>
                <span>/</span>
                <span onClick={() => navigate('/books')}>Sách</span>
                <span>/</span>
                <span className={cx('current')}>{authorName}</span>
            </div>

            {/* Author Profile */}
            <div className={cx('author-profile')}>
                <div className={cx('author-portrait')}>
                    {imageLoading && <div className={cx('image-placeholder')}>Đang tải ảnh...</div>}
                    <img
                        src={portraitUrl || '/images/default-author.jpg'}
                        alt={authorName}
                        className={cx('portrait', { loading: imageLoading })}
                        onLoad={() => setImageLoading(false)}
                        onError={(e) => {
                            e.target.src = '/images/default-author.jpg';
                            setImageLoading(false);
                        }}
                        loading="lazy"
                    />
                </div>

                <div className={cx('author-info')}>
                    <h1 className={cx('author-name')}>{authorName}</h1>

                    <div className={cx('author-meta')}>
                        {nationality && (
                            <div className={cx('meta-item')}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                <span>Quốc tịch: {getNationalityText(nationality)}</span>
                            </div>
                        )}

                        {bornDate && (
                            <div className={cx('meta-item')}>
                                <FontAwesomeIcon icon={faCalendar} />
                                <span>
                                    {deathDate
                                        ? `${new Date(bornDate).getFullYear()} - ${new Date(
                                              deathDate,
                                          ).getFullYear()} (${calculateAge(bornDate, deathDate)} tuổi)`
                                        : `Sinh năm ${new Date(bornDate).getFullYear()}`}
                                </span>
                            </div>
                        )}

                        <div className={cx('meta-item')}>
                            <FontAwesomeIcon icon={faBook} />
                            <span>{totalBooks || displayBooks.length} tác phẩm</span>
                        </div>

                        {averageRating > 0 && (
                            <div className={cx('meta-item')}>
                                <FontAwesomeIcon icon={faStar} />
                                <span>Đánh giá: {averageRating.toFixed(1)}/5</span>
                            </div>
                        )}
                    </div>

                    {bio && (
                        <div className={cx('author-bio')}>
                            <h3>Tiểu sử</h3>
                            <p>{bio}</p>
                        </div>
                    )}

                    <div className={cx('author-actions')}>
                        {wikiUrl && (
                            <Button outline href={wikiUrl} target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faExternalLinkAlt} />
                                Wikipedia
                            </Button>
                        )}
                        <Button primary onClick={() => navigate('/books', { state: { searchAuthor: authorName } })}>
                            <FontAwesomeIcon icon={faBook} />
                            Xem tất cả sách
                        </Button>
                    </div>
                </div>
            </div>

            {/* Author's Books */}
            <div className={cx('books-section')}>
                <h2 className={cx('section-title')}>
                    <FontAwesomeIcon icon={faBook} />
                    Tác phẩm của {authorName}
                    <span className={cx('book-count')}>({displayBooks.length})</span>
                </h2>

                {displayBooks.length > 0 ? (
                    <div className={cx('books-grid')}>
                        {displayBooks.map((book) => (
                            <BookItem key={book.productId || book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <div className={cx('no-books')}>
                        <FontAwesomeIcon icon={faBook} className={cx('no-books-icon')} />
                        <p>Chưa có tác phẩm nào</p>
                        <Button primary onClick={() => navigate('/books')} style={{ marginTop: '15px' }}>
                            Khám phá sách
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Author;
