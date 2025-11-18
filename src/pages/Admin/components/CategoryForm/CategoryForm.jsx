import React, { useState, useEffect, useCallback, useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './CategoryForm.module.scss';
import categoryApi from '../../../../api/categoryApi';
import Button from '../../../../Layouts/components/Button';
import Checkbox from '../../../../Layouts/components/Checkbox';

const cx = classNames.bind(styles);

function FormField({ id, label, name, value, onChange, type = 'text', placeholder, error }) {
    return (
        <div className={cx('form-group', { invalid: !!error })}>
            {label && <label htmlFor={id ?? name}>{label}</label>}
            <input
                id={id ?? name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value ?? ''}
                onChange={onChange}
                aria-invalid={!!error}
            />
            {error && <p className={cx('error')}>{error}</p>}
        </div>
    );
}

export default function CategoryForm() {
    const [categories, setCategories] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [listError, setListError] = useState('');
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formModel, setFormModel] = useState({
        categoryName: '',
        slug: '',
        parentId: 0,
        isActive: true,
        description: '',
        imageUrl: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [formLoading, setFormLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchCategories = useCallback(async (opts = {}) => {
        try {
            setLoadingList(true);
            setListError('');
            let resp;
            if (opts.search && opts.search.trim().length >= 2) {
                resp = await categoryApi.getAllPublic();
            } else {
                resp = await categoryApi.getAllPublic();
            }
            const list = (resp?.data ?? resp)?.map((c) => ({
                ...c,
                isActive: Boolean(c.isActive),
                parentId: c.parentId ?? 0,
            }));
            setCategories(list);
        } catch (err) {
            console.error(err);
            setListError('Không thể tải danh mục.');
            setCategories([]);
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        const t = setTimeout(() => setSearchDebounce(searchQuery.trim()), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const filteredCategories = useMemo(() => {
        let list = categories;
        if (filter === 'active') list = list.filter((c) => c.isActive);
        else if (filter === 'inactive') list = list.filter((c) => !c.isActive);

        const q = searchDebounce.toLowerCase();
        if (q) list = list.filter((c) => (c.categoryName ?? '').toLowerCase().includes(q));
        return list;
    }, [categories, filter, searchDebounce]);

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormErrors({});
        setFormModel({
            categoryName: '',
            slug: '',
            parentId: 0,
            isActive: true,
            description: '',
            imageUrl: '',
        });
        setShowForm(true);
    };

    const handleOpenEdit = (c) => {
        setEditingId(c.categoryId);
        setFormErrors({});
        setFormModel({
            categoryName: c.categoryName ?? '',
            slug: c.slug ?? '',
            parentId: c.parentId ?? 0,
            isActive: Boolean(c.isActive),
            description: c.description ?? '',
            imageUrl: c.imageUrl ?? '',
        });
        setShowForm(true);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormModel((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = (m) => {
        const errs = {};
        if (!m.categoryName?.trim()) errs.categoryName = 'Tên danh mục bắt buộc';
        if (!m.slug?.trim()) errs.slug = 'Slug bắt buộc';
        return errs;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setFormLoading(true);
        setSuccessMessage('');

        const errs = validateForm(formModel);
        if (Object.keys(errs).length) {
            setFormErrors(errs);
            setFormLoading(false);
            return;
        }

        try {
            const payload = { ...formModel };
            if (editingId) {
                await categoryApi.updateCategory(editingId, payload);
                setSuccessMessage('Cập nhật thành công.');
            } else {
                await categoryApi.createCategory(payload);
                setSuccessMessage('Tạo thành công.');
            }
            await fetchCategories();
            setShowForm(false);
        } catch (err) {
            console.error(err);
            setFormErrors({ _server: 'Lỗi server. Thử lại.' });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const conf = window.confirm('Xóa mềm danh mục này?');
        if (!conf) return;

        try {
            await categoryApi.delete(id);
            setSuccessMessage('Xóa thành công.');
            fetchCategories();
        } catch (err) {
            console.error(err);
            alert('Xóa thất bại');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('card')}>
                <div className={cx('header-content')}>
                    <h2 className={cx('title')}>Admin — Categories</h2>
                </div>

                <div className={cx('toolbar')}>
                    <Button onClick={handleOpenCreate}>+ Add Category</Button>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                            outline
                            onClick={() => setFilter('all')}
                            style={{ opacity: filter === 'all' ? 1 : 0.75 }}
                        >
                            All
                        </Button>
                        <Button
                            outline
                            onClick={() => setFilter('active')}
                            style={{ opacity: filter === 'active' ? 1 : 0.75 }}
                        >
                            Active
                        </Button>
                        <Button
                            outline
                            onClick={() => setFilter('inactive')}
                            style={{ opacity: filter === 'inactive' ? 1 : 0.75 }}
                        >
                            Inactive
                        </Button>
                    </div>

                    <input
                        type="text"
                        placeholder="Tìm theo tên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div>{loadingList ? 'Loading...' : `${filteredCategories.length} / ${categories.length}`}</div>
                </div>

                {listError && <div className={cx('server-error', 'message')}>{listError}</div>}

                <div style={{ overflowX: 'auto', marginTop: 12 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Parent</th>
                                <th>Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!filteredCategories.length && !loadingList ? (
                                <tr>
                                    <td colSpan="6">Không có danh mục</td>
                                </tr>
                            ) : (
                                filteredCategories.map((c, idx) => (
                                    <tr key={c.categoryId}>
                                        <td>{idx + 1}</td>
                                        <td>{c.categoryName}</td>
                                        <td>{c.slug}</td>
                                        <td>{c.parentId || '—'}</td>
                                        <td>{c.isActive ? 'Yes' : 'No'}</td>
                                        <td>
                                            <Button primary onClick={() => handleOpenEdit(c)}>
                                                Edit
                                            </Button>
                                            <Button outline onClick={() => handleDelete(c.categoryId)}>
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {successMessage && <div className={cx('message', 'success')}>{successMessage}</div>}
            </div>

            {showForm && (
                <div
                    role="dialog"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 60,
                    }}
                >
                    <div style={{ width: 600, background: 'white', borderRadius: 10, padding: 18 }}>
                        <h3>{editingId ? 'Edit Category' : 'Add Category'}</h3>

                        {formErrors._server && (
                            <div className={cx('server-error', 'message')}>{formErrors._server}</div>
                        )}

                        <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: 12 }}>
                            <FormField
                                name="categoryName"
                                label="Name"
                                value={formModel.categoryName}
                                onChange={handleFormChange}
                                error={formErrors.categoryName}
                            />
                            <FormField
                                name="slug"
                                label="Slug"
                                value={formModel.slug}
                                onChange={handleFormChange}
                                error={formErrors.slug}
                            />

                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <Checkbox
                                    name="isActive"
                                    label="Active"
                                    checked={formModel.isActive}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formModel.description}
                                    onChange={handleFormChange}
                                    placeholder="Mô tả danh mục..."
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label>Image URL</label>
                                <input name="imageUrl" value={formModel.imageUrl} onChange={handleFormChange} />
                                {formModel.imageUrl && (
                                    <img
                                        src={formModel.imageUrl}
                                        alt="preview"
                                        style={{ maxHeight: 100, marginTop: 6 }}
                                    />
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <Button type="button" onClick={() => setShowForm(false)} disabled={formLoading}>
                                    Cancel
                                </Button>
                                <Button primary type="submit" disabled={formLoading}>
                                    {formLoading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
