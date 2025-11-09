// src/pages/Books/Books.jsx
import { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './Books.module.scss';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { BookItem } from '../../components/BookItem';
import Tippy from '@tippyjs/react/headless';
import { Wrapper as PopperWrapper } from '../../Layouts/Popper';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';

const cx = classNames.bind(styles);

// Hook debounce nhỏ gọn
function useDebounced(value, delay = 250) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

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

    const debouncedSearch = useDebounced(searchQuery, 250);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const res = await categoryApi.getAllCategories();
                const payload = res?.data ?? res;
                let categoriesData = [];

                if (Array.isArray(payload)) categoriesData = payload;
                else if (Array.isArray(payload.result)) categoriesData = payload.result;
                else if (Array.isArray(payload.data)) categoriesData = payload.data;

                // normalize and only active categories
                categoriesData = (categoriesData || []).filter((cat) => {
                    const isActive = cat.isActive ?? cat.active ?? cat.activeFlag ?? true;
                    if (typeof isActive === 'string') return isActive.toLowerCase() === 'true' || isActive === '1';
                    if (typeof isActive === 'number') return isActive === 1;
                    return Boolean(isActive);
                });
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

    // Fetch books
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

                const res = await productApi.getAll();
                const payload = res?.data ?? res;
                let booksData = [];

                if (Array.isArray(payload)) booksData = payload;
                else if (Array.isArray(payload.result)) booksData = payload.result;
                else if (Array.isArray(payload.data)) booksData = payload.data;
                else if (Array.isArray(payload.items)) booksData = payload.items;

                // FILTER: only active products
                booksData = (booksData || []).filter((b) => {
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

    // Build category tree (supports parentId null/0/undefined)
    const buildCategoryTree = (categoriesList, parentId = null, level = 0) => {
        if (!Array.isArray(categoriesList) || categoriesList.length === 0) return [];

        const normalizeParent = (cat) => cat.parentId ?? cat.parent_id ?? cat.parent ?? null;

        const children = categoriesList.filter((cat) => {
            const pid = normalizeParent(cat);
            // treat root as parentId === null OR pid === 0
            if (parentId === null) return pid === null || pid === 0 || pid === undefined;
            return String(pid) === String(parentId);
        });

        if (children.length === 0) return [];

        return children.flatMap((category) => {
            const id = category.categoryId ?? category.id;
            const displayName = '  '.repeat(level) + (category.categoryName ?? category.name ?? '—');
            const node = { ...category, level, displayName, categoryId: id };
            return [node, ...buildCategoryTree(categoriesList, id, level + 1)];
        });
    };

    const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

    const sorts = ['Most Popular', 'Highest Rated', 'Price: Low to High', 'Price: High to Low'];

    // Filtered books (memoized & safe)
    const filteredBooks = useMemo(() => {
        const search = (debouncedSearch || '').trim().toLowerCase();

        return (books || []).filter((book) => {
            const productName = String(book.productName || book.name || '').toLowerCase();
            const topAuthor = String(book.authorName || '').toLowerCase();

            // authors array safe check
            const authorMatch =
                Array.isArray(book.bookAuthors) &&
                book.bookAuthors.some((a) => {
                    if (!a) return false;
                    if (typeof a === 'string') return a.toLowerCase().includes(search);
                    const aname = String(a.authorName || a.name || '').toLowerCase();
                    return aname.includes(search);
                });

            const matchesSearch = !search || productName.includes(search) || topAuthor.includes(search) || authorMatch;

            // category match - coerce to string
            const matchesCategory =
                selectedCategoryId == null ||
                (Array.isArray(book.categories) &&
                    book.categories.some((cat) => String(cat.categoryId ?? cat.id) === String(selectedCategoryId))) ||
                (Array.isArray(book.categoryIds) &&
                    book.categoryIds.map(String).includes(String(selectedCategoryId))) ||
                (Array.isArray(book.productCategory) &&
                    book.productCategory.some(
                        (pc) => String(pc.category?.categoryId ?? pc.category?.id) === String(selectedCategoryId),
                    ));

            return matchesSearch && matchesCategory;
        });
    }, [books, debouncedSearch, selectedCategoryId]);

    // Sorted books (memoized)
    const sortedBooks = useMemo(() => {
        const arr = [...filteredBooks];
        arr.sort((a, b) => {
            const aPrice = Number(a.salePrice ?? a.price) || 0;
            const bPrice = Number(b.salePrice ?? b.price) || 0;
            const aRating = Number(a.rating ?? a.averageRating) || 0;
            const bRating = Number(b.rating ?? b.averageRating) || 0;
            const aPop = Number(a.popularity ?? a.soldCount) || 0;
            const bPop = Number(b.popularity ?? b.soldCount) || 0;

            switch (sortBy) {
                case 'Price: Low to High':
                    return aPrice - bPrice;
                case 'Price: High to Low':
                    return bPrice - aPrice;
                case 'Highest Rated':
                    return bRating - aRating;
                default:
                    return bPop - aPop;
            }
        });
        return arr;
    }, [filteredBooks, sortBy]);

    const handleCategorySelect = (category) => {
        if (category === 'All') {
            setSelectedCategory('All');
            setSelectedCategoryId(null);
        } else {
            setSelectedCategory(category.categoryName ?? category.displayName ?? 'Category');
            setSelectedCategoryId(category.categoryId ?? category.categoryId ?? category.id);
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
                                aria-label="Search books or authors"
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
                                            role="button"
                                            tabIndex={0}
                                            className={cx('dropdown-item')}
                                            onClick={() => handleCategorySelect('All')}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCategorySelect('All')}
                                        >
                                            All Categories
                                        </div>
                                        {categoriesLoading ? (
                                            <div className={cx('dropdown-loading')}>Loading categories...</div>
                                        ) : (
                                            categoryTree.map((cat) => (
                                                <div
                                                    key={cat.categoryId ?? cat.id ?? cat.displayName}
                                                    className={cx('dropdown-item', 'category-item')}
                                                    style={{ paddingLeft: `${12 + cat.level * 16}px` }}
                                                    onClick={() => handleCategorySelect(cat)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleCategorySelect(cat)}
                                                    role="button"
                                                    tabIndex={0}
                                                    title={cat.description}
                                                >
                                                    <span className={cx('category-name')}>
                                                        {cat.level > 0 && '└─ '}
                                                        {cat.categoryName ?? cat.name}
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
                            <button
                                type="button"
                                className={cx('select')}
                                onClick={() => {
                                    setOpenCategory((s) => !s);
                                    setOpenSort(false);
                                }}
                                aria-haspopup="listbox"
                                aria-expanded={openCategory}
                            >
                                <SlidersHorizontal className={cx('icon')} />
                                <span>{selectedCategory}</span>
                                <ChevronDown className={cx('chevron')} />
                            </button>
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
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => {
                                                    setSortBy(sort);
                                                    setOpenSort(false);
                                                }}
                                                onKeyDown={(e) =>
                                                    e.key === 'Enter' && (setSortBy(sort), setOpenSort(false))
                                                }
                                            >
                                                {sort}
                                            </div>
                                        ))}
                                    </PopperWrapper>
                                </div>
                            )}
                        >
                            <button
                                type="button"
                                className={cx('select')}
                                onClick={() => {
                                    setOpenSort((s) => !s);
                                    setOpenCategory(false);
                                }}
                                aria-haspopup="listbox"
                                aria-expanded={openSort}
                            >
                                <span>{sortBy}</span>
                                <ChevronDown className={cx('chevron')} />
                            </button>
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
                            <BookItem key={book.productId ?? book.id ?? book.sku ?? Math.random()} book={book} />
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
