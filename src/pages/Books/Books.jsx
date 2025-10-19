import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Books.module.scss';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { BookItem } from '../../components/BookItem';
import Tippy from '@tippyjs/react/headless';
import { Wrapper as PopperWrapper } from '../../Layouts/Popper';
import productApi from '../../api/productApi';

const cx = classNames.bind(styles);

function Books() {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Most Popular');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [openCategory, setOpenCategory] = useState(false);
    const [openSort, setOpenSort] = useState(false);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await productApi.getAll();

                let booksData = [];
                if (Array.isArray(data)) {
                    booksData = data;
                } else if (Array.isArray(data?.result)) {
                    booksData = data.result;
                } else if (Array.isArray(data?.data)) {
                    booksData = data.data;
                } else if (Array.isArray(data?.items)) {
                    booksData = data.items;
                }

                setBooks(booksData);
            } catch (err) {
                console.error('Lỗi khi tải sách:', err);
                setError('Không thể tải danh sách sách.');
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const categories = [
        { id: 1, name: 'All' },
        { id: 2, name: 'Fiction' },
        { id: 3, name: 'Self-help' },
        { id: 4, name: 'Biography' },
        { id: 5, name: 'Sci-fi' },
        { id: 6, name: 'Thriller' },
    ];

    const sorts = ['Most Popular', 'Highest Rated', 'Price: Low to High', 'Price: High to Low'];

    const filteredBooks = books.filter((book) => {
        const search = searchQuery.toLowerCase();

        const matchesSearch =
            book.productName?.toLowerCase().includes(search) ||
            book.bookAuthors?.some((a) => a.authorName.toLowerCase().includes(search));

        const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const sortedBooks = [...filteredBooks].sort((a, b) => {
        switch (sortBy) {
            case 'Price: Low to High':
                return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
            case 'Price: High to Low':
                return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
            default:
                return 0;
        }
    });

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                {/* Header */}
                <div className={cx('header')}>
                    <h1>All Books</h1>
                    <p>Discover from our collection of {books.length} books</p>
                </div>

                {/* Filters */}
                <div className={cx('filters')}>
                    <div className={cx('filter-group')}>
                        {/* Search */}
                        <div className={cx('search')}>
                            <Search className={cx('icon')} />
                            <input
                                type="text"
                                placeholder="Search books or authors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Category Dropdown */}
                        <Tippy
                            offset={[-90, 10]}
                            interactive
                            placement="bottom"
                            visible={openCategory}
                            onClickOutside={() => setOpenCategory(false)}
                            render={(attrs) => (
                                <div className={cx('dropdown')} tabIndex="-1" {...attrs}>
                                    <PopperWrapper>
                                        {categories.map((cat) => (
                                            <div
                                                key={cat.id}
                                                className={cx('dropdown-item')}
                                                onClick={() => {
                                                    setSelectedCategory(cat.name);
                                                    setOpenCategory(false);
                                                }}
                                            >
                                                {cat.name}
                                            </div>
                                        ))}
                                    </PopperWrapper>
                                </div>
                            )}
                        >
                            <div className={cx('select')} onClick={() => setOpenCategory(!openCategory)}>
                                <SlidersHorizontal className={cx('icon')} />
                                <span>{selectedCategory}</span>
                                <ChevronDown className={cx('chevron')} />
                            </div>
                        </Tippy>

                        {/* Sort Dropdown */}
                        <Tippy
                            offset={[-90, 10]}
                            placement="bottom"
                            interactive
                            visible={openSort}
                            onClickOutside={() => setOpenSort(false)}
                            render={(attrs) => (
                                <div className={cx('dropdown')} tabIndex="-1" {...attrs}>
                                    <PopperWrapper>
                                        {sorts.map((sort) => (
                                            <div
                                                key={sort}
                                                className={cx('dropdown-item')}
                                                onClick={() => {
                                                    setSortBy(sort);
                                                    setOpenSort(false);
                                                }}
                                            >
                                                {sort}
                                            </div>
                                        ))}
                                    </PopperWrapper>
                                </div>
                            )}
                        >
                            <div className={cx('select')} onClick={() => setOpenSort(!openSort)}>
                                <span>{sortBy}</span>
                                <ChevronDown className={cx('chevron')} />
                            </div>
                        </Tippy>
                    </div>
                </div>

                {/* Result Info */}
                <div className={cx('result-info')}>
                    <p>
                        Showing {sortedBooks.length} {sortedBooks.length === 1 ? 'book' : 'books'}
                    </p>
                </div>

                {/* Books Grid */}
                {loading ? (
                    <div className={cx('loading')}>Đang tải sách...</div>
                ) : error ? (
                    <div className={cx('error')}>{error}</div>
                ) : sortedBooks.length > 0 ? (
                    <div className={cx('books-grid')}>
                        {sortedBooks.map((book) => (
                            <BookItem key={book.productId} book={book} />
                        ))}
                    </div>
                ) : (
                    <div className={cx('no-results')}>
                        <Search />
                        <h3>No books found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Books;
