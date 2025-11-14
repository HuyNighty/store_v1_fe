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
import QuantityInput from '../../Layouts/components/QuantityInput';
import Input from '../../Layouts/Input';
import Button from '../../Layouts/components/Button';

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
    // --- states
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Most Popular');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [openCategory, setOpenCategory] = useState(false);
    const [openSort, setOpenSort] = useState(false);
    const [openRating, setOpenRating] = useState(false);

    // advanced filters (client)
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('0');
    const [onlyFeatured, setOnlyFeatured] = useState(false);
    const [inStockOnly, setInStockOnly] = useState(false);

    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState(null);

    const debouncedSearch = useDebounced(searchQuery, 300);

    // quantity map: key -> quantity (for each book)
    const [quantities, setQuantities] = useState({});

    // helper to extract array from various backend shapes
    const extractArray = (payload) => {
        if (!payload) return [];
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload.result)) return payload.result;
        if (Array.isArray(payload.data)) return payload.data;
        if (Array.isArray(payload.data?.result)) return payload.data.result;
        if (Array.isArray(payload.items)) return payload.items;
        return [];
    };

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const res = await categoryApi.getAllCategories();

                let categoriesData = [];
                if (res && res.data && Array.isArray(res.data.result)) {
                    categoriesData = res.data.result;
                } else if (Array.isArray(res?.result)) {
                    categoriesData = res.result;
                } else if (Array.isArray(res?.data)) {
                    categoriesData = res.data;
                } else if (Array.isArray(res)) {
                    categoriesData = res;
                }

                categoriesData = categoriesData.filter((cat) => {
                    const isActive = cat.isActive ?? cat.active ?? cat.activeFlag ?? true;
                    if (typeof isActive === 'string') return isActive.toLowerCase() === 'true' || isActive === '1';
                    if (typeof isActive === 'number') return isActive === 1;
                    return Boolean(isActive);
                });

                categoriesData = categoriesData.filter((cat) => {
                    const categoryName = cat.categoryName ?? cat.name ?? '';
                    return categoryName.trim() !== '';
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

    // Fetch books (unchanged logic)
    useEffect(() => {
        const isActiveTrue = (v) => {
            if (v === true) return true;
            if (v === false) return false;
            if (typeof v === 'number') return v === 1;
            if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
            return Boolean(v);
        };

        const toNumberOrUndefined = (val) => {
            if (val === null || val === undefined || val === '') return undefined;
            const n = Number(val);
            return Number.isFinite(n) ? n : undefined;
        };

        const fetchBooks = async () => {
            try {
                setLoading(true);
                setError(null);

                if (debouncedSearch && debouncedSearch.trim().length >= 3) {
                    const res = await productApi.searchByName(debouncedSearch.trim());
                    const booksData = extractArray(res);
                    setBooks(
                        (booksData || []).filter((b) => {
                            const val = b.isActive ?? b.active ?? b.is_active ?? b.activeFlag;
                            return isActiveTrue(val);
                        }),
                    );
                    return;
                }

                const catIdNum = toNumberOrUndefined(selectedCategoryId);
                const minP = toNumberOrUndefined(minPrice);
                const maxP = toNumberOrUndefined(maxPrice);

                const hasServerFilter = catIdNum !== undefined || minP !== undefined || maxP !== undefined;

                if (hasServerFilter) {
                    const filters = {};
                    if (catIdNum !== undefined) filters.categoryId = catIdNum;
                    if (minP !== undefined) filters.minPrice = minP;
                    if (maxP !== undefined) filters.maxPrice = maxP;

                    const res = await productApi.filterProducts(filters);
                    const booksData = extractArray(res);
                    setBooks(
                        (booksData || []).filter((b) => {
                            const val = b.isActive ?? b.active ?? b.is_active ?? b.activeFlag;
                            return isActiveTrue(val);
                        }),
                    );
                    return;
                }

                const res = await productApi.getAll();
                const booksData = extractArray(res);
                setBooks(
                    (booksData || []).filter((b) => {
                        const val = b.isActive ?? b.active ?? b.is_active ?? b.activeFlag;
                        return isActiveTrue(val);
                    }),
                );
            } catch (err) {
                console.error('Lỗi khi tải sách:', err);
                setError('Không thể tải danh sách sách.');
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [debouncedSearch, selectedCategoryId, minPrice, maxPrice]);

    // --- helpers (normalize ids)
    const normalizeId = (v) => {
        if (v === null || v === undefined) return null;
        if (typeof v === 'number') {
            if (v === 0) return '0';
            return String(v);
        }
        const s = String(v).trim();
        if (s === '' || s === '0') return '0';
        return s;
    };

    // Build category tree (unchanged)
    const buildCategoryTree = (categoriesList) => {
        if (!Array.isArray(categoriesList) || categoriesList.length === 0) return [];

        const nodesById = new Map();
        const childrenMap = new Map();

        categoriesList.forEach((raw) => {
            const rawId = raw.categoryId ?? raw.id ?? raw._id ?? raw.code;
            const id = normalizeId(rawId);
            const parentRaw = raw.parentId ?? raw.parent ?? raw.parent_id ?? null;
            const parentId = normalizeId(parentRaw);

            const node = {
                original: raw,
                id,
                parentId,
                categoryName: raw.categoryName ?? raw.name ?? raw.title ?? '—',
                description: raw.description ?? raw.desc ?? raw.note,
            };

            nodesById.set(id, node);

            const list = childrenMap.get(parentId) ?? [];
            list.push(node);
            childrenMap.set(parentId, list);
        });

        for (const [p, arr] of childrenMap.entries()) {
            arr.sort((a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''));
        }

        const roots = childrenMap.get(null) || [];
        const zeroRoots = childrenMap.get('0') || [];

        const out = [];
        const visited = new Set();

        const visit = (node, level = 0) => {
            out.push({
                ...node.original,
                categoryId: node.id,
                level,
                displayName: node.categoryName,
                description: node.description,
            });
            visited.add(node.id);
            const kids = childrenMap.get(node.id) || [];
            for (const kid of kids) visit(kid, level + 1);
        };

        const visitRoots = (arr) => {
            for (const r of arr) {
                if (!visited.has(r.id)) visit(r, 0);
            }
        };

        visitRoots(roots);
        visitRoots(zeroRoots);

        for (const node of nodesById.values()) {
            if (!visited.has(node.id)) {
                visit(node, 0);
            }
        }

        return out;
    };

    const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

    const sorts = ['Most Popular', 'Highest Rated', 'Price: Low to High', 'Price: High to Low'];

    // Filtered books (apply search + category + new client filters)
    const filteredBooks = useMemo(() => {
        const search = (debouncedSearch || '').trim().toLowerCase();
        const selCatId = normalizeId(selectedCategoryId);

        const minP = parseFloat(minPrice === '' ? NaN : minPrice);
        const maxP = parseFloat(maxPrice === '' ? NaN : maxPrice);
        const minR = parseFloat(minRating || '0');

        return (books || []).filter((book) => {
            const productName = String(book.productName || book.name || '').toLowerCase();
            const topAuthor = String(book.authorName || '').toLowerCase();

            const authorMatch =
                Array.isArray(book.bookAuthors) &&
                book.bookAuthors.some((a) => {
                    if (!a) return false;
                    if (typeof a === 'string') return a.toLowerCase().includes(search);
                    const aname = String(a.authorName || a.name || '').toLowerCase();
                    return aname.includes(search);
                });

            const matchesSearch = !search || productName.includes(search) || topAuthor.includes(search) || authorMatch;

            if (!matchesSearch) return false;

            if (selCatId) {
                let matchesCategory = false;
                if (Array.isArray(book.categories)) {
                    matchesCategory = book.categories
                        .map((c) => normalizeId(c.categoryId ?? c.id ?? c._id ?? c.code))
                        .includes(selCatId);
                }
                if (!matchesCategory && Array.isArray(book.categoryIds)) {
                    matchesCategory = book.categoryIds.map((v) => normalizeId(v)).includes(selCatId);
                }
                if (!matchesCategory && Array.isArray(book.productCategory)) {
                    matchesCategory = book.productCategory
                        .map((pc) => normalizeId(pc.category?.categoryId ?? pc.category?.id ?? pc.category?._id))
                        .includes(selCatId);
                }
                if (!matchesCategory) return false;
            }

            const price = Number(book.salePrice ?? book.price ?? book.listPrice ?? 0);
            if (!isNaN(minP) && price < minP) return false;
            if (!isNaN(maxP) && price > maxP) return false;

            const rating = Number(book.rating ?? book.averageRating ?? book.avgRating ?? 0);
            if (!isNaN(minR) && rating < minR) return false;

            if (onlyFeatured && !(book.featured ?? book.isFeatured ?? book.is_featured)) return false;

            if (inStockOnly) {
                const stock = Number(book.stockQuantity ?? book.stock ?? book.qty ?? 0);
                if (isNaN(stock) || stock <= 0) return false;
            }

            return true;
        });
    }, [books, debouncedSearch, selectedCategoryId, minPrice, maxPrice, minRating, onlyFeatured, inStockOnly]);

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
        if (!category || category === 'All') {
            setSelectedCategory('All');
            setSelectedCategoryId(null);
        } else {
            const id = normalizeId(category.categoryId ?? category.id ?? category._id ?? category.code);
            const name = category.categoryName ?? category.name ?? category.title ?? category.displayName ?? 'Category';
            setSelectedCategory(name);
            setSelectedCategoryId(id === '0' ? null : id);
        }
        setOpenCategory(false);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setSelectedCategoryId(null);
        setMinPrice('');
        setMaxPrice('');
        setMinRating('0');
        setOnlyFeatured(false);
        setInStockOnly(false);
    };

    // quantity handlers for per-book selector
    const handleQuantityChange = (key, newValue) => {
        setQuantities((prev) => ({ ...prev, [key]: newValue }));
    };

    const addToCart = (book, qty) => {
        const q = Number(qty) || 0;
        // TODO: replace with real cart action
        console.log('Add to cart:', { bookId: book.productId ?? book.id ?? book.sku, qty: q });
    };

    // Debug: Log categories để kiểm tra
    useEffect(() => {
        console.log('Categories state:', categories);
        console.log('Category tree:', categoryTree);
    }, [categories, categoryTree]);

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
                                            All
                                        </div>
                                        {categoriesLoading ? (
                                            <div className={cx('dropdown-loading')}>Loading categories...</div>
                                        ) : categoryTree.length > 0 ? (
                                            categoryTree.map((cat) => (
                                                <div
                                                    key={cat.categoryId ?? cat.id}
                                                    className={cx('dropdown-item', 'category-item')}
                                                    style={{ paddingLeft: `${12 + (cat.level || 0) * 16}px` }}
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
                                                </div>
                                            ))
                                        ) : (
                                            <div className={cx('dropdown-loading')}>No categories available</div>
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

                    <div className={cx('filter-group', 'advanced-filters')}>
                        <div className={cx('filter-item')}>
                            <label>Price</label>
                            <div className={cx('price-inputs')}>
                                <QuantityInput
                                    value={minPrice === '' ? '' : Number(minPrice)}
                                    onChange={(v) => setMinPrice(v === '' ? '' : String(v))}
                                    min={0}
                                    step={1000}
                                    size="small"
                                    placeholder="Min"
                                    enforceMinOnBlur={false}
                                />
                                <span>-</span>
                                <QuantityInput
                                    value={maxPrice === '' ? '' : Number(maxPrice)}
                                    onChange={(v) => setMaxPrice(v === '' ? '' : String(v))}
                                    min={0}
                                    step={1000}
                                    size="small"
                                    placeholder="Max"
                                    enforceMinOnBlur={false}
                                />
                            </div>
                        </div>

                        <div className={cx('filter-item')}>
                            {/* Min Rating (Popper) */}
                            <Tippy
                                offset={[-90, 10]}
                                placement="bottom"
                                interactive
                                visible={openRating}
                                onClickOutside={() => setOpenRating(false)}
                                render={(attrs) => (
                                    <div className={cx('dropdown')} tabIndex="-1" {...attrs}>
                                        <PopperWrapper>
                                            <div
                                                role="listbox"
                                                aria-label="Minimum rating"
                                                className={cx('rating-list')}
                                            >
                                                {['0', '1', '2', '3', '4', '4.5'].map((r) => (
                                                    <div
                                                        key={r}
                                                        role="option"
                                                        tabIndex={0}
                                                        aria-selected={String(minRating) === r}
                                                        className={cx('dropdown-item', {
                                                            selected: String(minRating) === r,
                                                        })}
                                                        onClick={() => {
                                                            setMinRating(r);
                                                            setOpenRating(false);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                setMinRating(r);
                                                                setOpenRating(false);
                                                            }
                                                        }}
                                                    >
                                                        {r === '0' ? 'Any' : `≥ ${r}`}
                                                    </div>
                                                ))}
                                            </div>
                                        </PopperWrapper>
                                    </div>
                                )}
                            >
                                <div className={cx('filter-item')}>
                                    <label id="min-rating-label">Min Rating</label>
                                    <button
                                        type="button"
                                        className={cx('select')}
                                        aria-haspopup="listbox"
                                        aria-expanded={openRating}
                                        aria-labelledby="min-rating-label"
                                        onClick={() => {
                                            setOpenRating((s) => !s);
                                            setOpenCategory(false);
                                            setOpenSort(false);
                                        }}
                                    >
                                        <span>{minRating === '0' ? 'Any' : `≥ ${minRating}`}</span>
                                        <ChevronDown className={cx('chevron')} />
                                    </button>
                                </div>
                            </Tippy>
                        </div>

                        <div className={cx('filter-item', 'toggles')}>
                            <Input
                                scale
                                type="checkbox"
                                id="filter-featured"
                                name="onlyFeatured"
                                label="Featured"
                                checked={onlyFeatured}
                                onChange={() => setOnlyFeatured((s) => !s)}
                                small
                            />
                            <Input
                                scale
                                type="checkbox"
                                id="filter-instock"
                                name="inStockOnly"
                                label="In stock"
                                checked={inStockOnly}
                                onChange={() => setInStockOnly((s) => !s)}
                                small
                            />
                        </div>

                        <div className={cx('filter-actions')}>
                            <Button shine scale className={cx('btn-reset')} onClick={resetFilters}>
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Result Info */}
                <div className={cx('result-info')}>
                    <p>
                        Showing {sortedBooks.length} {sortedBooks.length === 1 ? 'book' : 'books'}
                        {selectedCategoryId && ` in "${selectedCategory}"`}
                        {onlyFeatured && ' · Featured'}
                        {inStockOnly && ' · In stock'}
                        {(!isNaN(parseFloat(minPrice)) || !isNaN(parseFloat(maxPrice))) &&
                            ` · Price ${minPrice || 0} - ${maxPrice || '∞'}`}
                        {minRating && minRating !== '0' && ` · Rating ≥ ${minRating}`}
                    </p>
                </div>

                {/* Books Grid */}
                {loading ? (
                    <div className={cx('loading')}>Đang tải sách...</div>
                ) : error ? (
                    <div className={cx('error')}>{error}</div>
                ) : sortedBooks.length > 0 ? (
                    <div className={cx('books-grid')}>
                        {sortedBooks.map((book) => {
                            const key = book.productId ?? book.id ?? book.sku ?? book.code ?? Math.random();
                            const qty = quantities[key] ?? 1;
                            return (
                                <div key={key} className={cx('book-card')}>
                                    <BookItem book={book} />
                                </div>
                            );
                        })}
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
