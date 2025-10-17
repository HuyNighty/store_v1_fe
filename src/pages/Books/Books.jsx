import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Books.module.scss';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { BookItem } from '../../components/BookItem';
import Tippy from '@tippyjs/react/headless';
import { Wrapper as PopperWrapper } from '../../Layouts/Popper';

const cx = classNames.bind(styles);

function Books({ onNavigate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Most Popular');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [openCategory, setOpenCategory] = useState(false);
    const [openSort, setOpenSort] = useState(false);

    const books = [
        {
            id: 1,
            title: 'The Midnight Library',
            author: 'Matt Haig',
            price: 24.99,
            category: 'Fiction',
            image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
            rating: 4.5,
            reviews: 2847,
        },
        {
            id: 2,
            title: 'Atomic Habits',
            author: 'James Clear',
            price: 18.99,
            category: 'Self-help',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            rating: 4.8,
            reviews: 15234,
        },
        {
            id: 3,
            title: 'The Alchemist',
            author: 'Paulo Coelho',
            price: 15.5,
            category: 'Fiction',
            image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
            rating: 4.7,
            reviews: 8921,
        },
        {
            id: 4,
            title: 'Educated',
            author: 'Tara Westover',
            price: 22.99,
            category: 'Biography',
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
            rating: 4.6,
            reviews: 5678,
        },
        {
            id: 5,
            title: 'Where the Crawdads Sing',
            author: 'Delia Owens',
            price: 19.99,
            category: 'Fiction',
            image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
            rating: 4.4,
            reviews: 12345,
        },
        {
            id: 6,
            title: 'The Silent Patient',
            author: 'Alex Michaelides',
            price: 16.75,
            category: 'Thriller',
            image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
            rating: 4.2,
            reviews: 8765,
        },
        {
            id: 7,
            title: 'Dune',
            author: 'Frank Herbert',
            price: 29.99,
            category: 'Sci-fi',
            image: 'https://images.unsplash.com/photo-1554757380-2fb69b9b940c?w=400',
            rating: 4.9,
            reviews: 23456,
        },
        {
            id: 8,
            title: '1984',
            author: 'George Orwell',
            price: 14.99,
            category: 'Fiction',
            image: 'https://images.unsplash.com/photo-1531346680769-a1d79b57de2b?w=400',
            rating: 4.8,
            reviews: 18976,
        },
    ];

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
        const matchesSearch =
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedBooks = [...filteredBooks].sort((a, b) => {
        switch (sortBy) {
            case 'Price: Low to High':
                return a.price - b.price;
            case 'Price: High to Low':
                return b.price - a.price;
            case 'Highest Rated':
                return b.rating - a.rating;
            default:
                return b.reviews - a.reviews;
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

                        {/* Category dropdown */}
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
                                <span>{selectedCategory === 'All' ? 'All' : selectedCategory}</span>
                                <ChevronDown className={cx('chevron')} />
                            </div>
                        </Tippy>

                        {/* Sort dropdown */}
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
                {sortedBooks.length > 0 ? (
                    <div className={cx('books-grid')}>
                        {sortedBooks.map((book) => (
                            <BookItem key={book.id} book={book} />
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
