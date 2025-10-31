import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Books.module.scss';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { BookItem } from '../../components/BookItem';
import Tippy from '@tippyjs/react/headless';
import { Wrapper as PopperWrapper } from '../../Layouts/Popper';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';

const cx = classNames.bind(styles);

function Books() {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Most Popular');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [openCategory, setOpenCategory] = useState(false);
    const [openSort, setOpenSort] = useState(false);
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch categories từ API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const response = await categoryApi.getAllCategories();

                let categoriesData = [];
                if (Array.isArray(response?.data?.result)) {
                    categoriesData = response.data.result;
                } else if (Array.isArray(response?.data)) {
                    categoriesData = response.data;
                }

                // Chỉ lấy categories active
                categoriesData = categoriesData.filter((cat) => cat.isActive);
                setCategories(categoriesData);
            } catch (err) {
                console.error('Lỗi khi tải categories:', err);
                setCategories([]);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Fetch books từ API
    useEffect(() => {
        const isActiveTrue = (v) => {
            if (v === true) return true;
            if (v === false) return false;
            if (typeof v === 'number') return v === 1;
            if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
            return Boolean(v);
        };

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

                // FILTER: chỉ giữ product active
                booksData = booksData.filter((b) => {
                    const val = b.isActive ?? b.active ?? b.is_active ?? b.activeFlag;
                    return isActiveTrue(val);
                });

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

    // Xây dựng category tree để hiển thị phân cấp
    const buildCategoryTree = (categories, parentId = 0, level = 0) => {
        const children = categories.filter((cat) => cat.parentId === parentId);
        if (children.length === 0) return [];

        let result = [];
        children.forEach((category) => {
            result.push({
                ...category,
                level,
                displayName: '  '.repeat(level) + category.categoryName,
            });
            const grandchildren = buildCategoryTree(categories, category.categoryId, level + 1);
            result = result.concat(grandchildren);
        });

        return result;
    };

    const categoryTree = buildCategoryTree(categories);

    const sorts = ['Most Popular', 'Highest Rated', 'Price: Low to High', 'Price: High to Low'];

    const filteredBooks = books.filter((book) => {
        const search = searchQuery.toLowerCase();

        const matchesSearch =
            book.productName?.toLowerCase().includes(search) ||
            book.bookAuthors?.some((a) => a.authorName?.toLowerCase().includes(search)) ||
            book.authorName?.toLowerCase().includes(search);

        // Lọc theo category
        const matchesCategory =
            selectedCategoryId === null ||
            (book.categories && book.categories.some((cat) => cat.categoryId === selectedCategoryId)) ||
            (book.categoryIds && book.categoryIds.includes(selectedCategoryId)) ||
            (book.productCategory && book.productCategory.some((pc) => pc.category?.categoryId === selectedCategoryId));

        return matchesSearch && matchesCategory;
    });

    const sortedBooks = [...filteredBooks].sort((a, b) => {
        switch (sortBy) {
            case 'Price: Low to High':
                return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
            case 'Price: High to Low':
                return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
            case 'Highest Rated':
                return (b.rating ?? b.averageRating ?? 0) - (a.rating ?? a.averageRating ?? 0);
            default:
                // Most Popular - có thể dựa vào số lượng bán hoặc view
                return (b.popularity ?? b.soldCount ?? 0) - (a.popularity ?? a.soldCount ?? 0);
        }
    });

    const handleCategorySelect = (category) => {
        if (category === 'All') {
            setSelectedCategory('All');
            setSelectedCategoryId(null);
        } else {
            setSelectedCategory(category.categoryName);
            setSelectedCategoryId(category.categoryId);
        }
        setOpenCategory(false);
    };

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
                                        <div
                                            className={cx('dropdown-item')}
                                            onClick={() => handleCategorySelect('All')}
                                        >
                                            All Categories
                                        </div>
                                        {categoriesLoading ? (
                                            <div className={cx('dropdown-loading')}>Loading categories...</div>
                                        ) : (
                                            categoryTree.map((cat) => (
                                                <div
                                                    key={cat.categoryId}
                                                    className={cx('dropdown-item', 'category-item')}
                                                    style={{ paddingLeft: `${12 + cat.level * 16}px` }}
                                                    onClick={() => handleCategorySelect(cat)}
                                                    title={cat.description}
                                                >
                                                    <span className={cx('category-name')}>
                                                        {cat.level > 0 && '└─ '}
                                                        {cat.categoryName}
                                                    </span>
                                                    {cat.description && (
                                                        <span className={cx('category-desc')}>{cat.description}</span>
                                                    )}
                                                </div>
                                            ))
                                        )}
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
                        {selectedCategoryId && ` in "${selectedCategory}"`}
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
