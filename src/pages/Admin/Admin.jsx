import React, { useState, useEffect, useCallback, useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './Admin.module.scss';
import adminApi from '../../api/adminApi';
import productApi from '../../api/productApi';
import Button from '../../Layouts/components/Button';

const cx = classNames.bind(styles);

function FormField({ id, label, name, value, onChange, type = 'text', placeholder, error, step, min }) {
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
                step={step}
                min={min}
                aria-invalid={!!error}
            />
            {error && <p className={cx('error')}>{error}</p>}
        </div>
    );
}

function CheckboxField({ id, label, name, checked, onChange }) {
    return (
        <label className={cx('checkbox')} htmlFor={id ?? name}>
            <input id={id ?? name} type="checkbox" name={name} checked={!!checked} onChange={onChange} />
            <span>{label}</span>
        </label>
    );
}

const normalizeListResponse = (resp) => {
    const data = resp?.data ?? resp;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.result)) return data.result;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
};

const normalizeProduct = (p) => ({
    id: p.id ?? p.productId ?? p.idProduct,
    sku: p.sku,
    productName: p.productName ?? p.product_name,
    price: p.price,
    salePrice: p.salePrice,
    stockQuantity: p.stockQuantity,
    weightG: p.weightG,
    isActive: p.isActive ?? p.active ?? p.is_active,
    featured: p.featured,
    ...p,
});

function Admin() {
    // data
    const [products, setProducts] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [listError, setListError] = useState('');

    // UI / filters / search
    const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'inactive'
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDebounce, setSearchDebounce] = useState(''); // actual debounced query

    // modal/form
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formModel, setFormModel] = useState({
        sku: '',
        slug: '',
        productName: '',
        price: '',
        salePrice: '',
        stockQuantity: '',
        weightG: '',
        isActive: true,
        featured: false,
    });
    const [formErrors, setFormErrors] = useState({});
    const [formLoading, setFormLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // fetch all products
    const fetchProducts = useCallback(async () => {
        try {
            setLoadingList(true);
            setListError('');
            const resp = await productApi.getAll();
            const list = normalizeListResponse(resp).map(normalizeProduct);
            setProducts(list);
        } catch (err) {
            console.error('Failed to fetch products', err);
            setListError('Không thể tải danh sách sản phẩm.');
            setProducts([]);
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // debounce searchQuery -> searchDebounce
    useEffect(() => {
        const t = setTimeout(() => setSearchDebounce(searchQuery.trim()), 350);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // optional: if you want server-side search instead of client-side,
    // replace the useMemo below with an effect that calls productApi.searchByName(searchDebounce).

    // filteredProducts: apply filter + local-search (case-insensitive)
    const filteredProducts = useMemo(() => {
        const q = (searchDebounce || '').toLowerCase();
        let list = products;

        if (filter === 'active') {
            list = list.filter((p) => p.isActive === true || String(p.isActive) === 'true' || p.isActive === 1);
        } else if (filter === 'inactive') {
            list = list.filter((p) => !(p.isActive === true || String(p.isActive) === 'true' || p.isActive === 1));
        }

        if (!q) return list;

        return list.filter((p) => {
            const name = (p.productName ?? '').toString().toLowerCase();
            const sku = (p.sku ?? '').toString().toLowerCase();
            return name.includes(q) || sku.includes(q);
        });
    }, [products, filter, searchDebounce]);

    // show success toast shorter
    useEffect(() => {
        if (!successMessage) return;
        const id = setTimeout(() => setSuccessMessage(''), 3000);
        return () => clearTimeout(id);
    }, [successMessage]);

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormErrors({});
        setFormModel({
            sku: '',
            slug: '',
            productName: '',
            price: '',
            salePrice: '',
            stockQuantity: '',
            weightG: '',
            isActive: true,
            featured: false,
        });
        setShowForm(true);
    };

    const handleOpenEdit = (item) => {
        setEditingId(item.id);
        setFormErrors({});
        setFormModel({
            sku: item.sku ?? '',
            slug: item.slug ?? '',
            productName: item.productName ?? '',
            price: item.price ?? '',
            salePrice: item.salePrice ?? '',
            stockQuantity: item.stockQuantity ?? '',
            weightG: item.weightG ?? '',
            isActive: item.isActive ?? true,
            featured: item.featured ?? false,
        });
        setShowForm(true);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormModel((prev) => ({ ...prev, [name]: val }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = (m) => {
        const errs = {};
        if (!m.sku?.trim()) errs.sku = 'SKU is required';
        if (!m.productName?.trim()) errs.productName = 'Product name is required';
        if (m.price === '' || isNaN(m.price)) errs.price = 'Price must be a valid number';
        if (m.stockQuantity === '' || isNaN(m.stockQuantity))
            errs.stockQuantity = 'Stock quantity must be a valid number';
        return errs;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setFormLoading(true);
        setSuccessMessage('');

        const validationErrors = validateForm(formModel);
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            setFormLoading(false);
            return;
        }

        const payload = {
            ...formModel,
            sku: formModel.sku?.trim(),
            slug: formModel.slug?.trim(),
            productName: formModel.productName?.trim(),
            price: formModel.price === '' ? null : Number(formModel.price),
            salePrice: formModel.salePrice === '' ? null : Number(formModel.salePrice),
            stockQuantity: formModel.stockQuantity === '' ? null : Number(formModel.stockQuantity),
            weightG: formModel.weightG === '' ? null : Number(formModel.weightG),
        };

        try {
            if (editingId) {
                await adminApi.updateProduct(editingId, payload);
                setSuccessMessage('Cập nhật sản phẩm thành công.');
            } else {
                await adminApi.createProduct(payload);
                setSuccessMessage('Tạo sản phẩm thành công.');
            }
            await fetchProducts();
            setShowForm(false);
        } catch (err) {
            console.error('Submit error', err);
            const resp = err?.response?.data;
            let errs = { _server: 'An error occurred. Please try again.' };
            if (resp) {
                if (typeof resp.result === 'object') errs = resp.result;
                else if (resp.message) errs._server = resp.message;
            }
            setFormErrors(errs);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const conf = window.confirm('Bạn có chắc muốn xóa (soft-delete) sản phẩm này?');
        if (!conf) return;

        // optimistic remove
        const prev = products;
        setProducts((p) => p.filter((x) => x.id !== id));
        setSuccessMessage('');
        try {
            // Prefer backend soft-delete via DELETE if implemented
            await adminApi.deleteProduct(id);
            setSuccessMessage('Xóa thành công.');
            // refresh to ensure server state consistency
            await fetchProducts();
        } catch (err) {
            console.warn('delete fallback/update', err);
            // fallback: try update isActive=false
            try {
                await adminApi.updateProduct(id, { isActive: false });
                setSuccessMessage('Xóa (soft-delete) thành công.');
                await fetchProducts();
            } catch (err2) {
                console.error('Delete failed - rollback', err2);
                setProducts(prev); // rollback
                alert('Xóa thất bại. Thử lại.');
            }
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('card')}>
                <h2 className={cx('title')}>Admin — Products</h2>

                {/* Toolbar */}
                <div
                    className={cx('toolbar')}
                    style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}
                >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Button onClick={handleOpenCreate}>+ Add Product</Button>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                    </div>

                    {/* Search input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
                        <input
                            className={cx('input')}
                            type="text"
                            placeholder="Tìm theo tên hoặc SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: 360,
                                maxWidth: '60%',
                                padding: '8px 10px',
                                borderRadius: 8,
                                border: '1px solid rgba(0,0,0,0.08)',
                            }}
                        />
                    </div>

                    <div style={{ color: '#6b7280' }}>
                        {loadingList ? 'Loading...' : `${filteredProducts.length} / ${products.length} sản phẩm`}
                    </div>
                </div>

                {listError && <div className={cx('server-error', 'message')}>{listError}</div>}

                {/* Table */}
                <div style={{ overflowX: 'auto', marginTop: 12 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: 8 }}>#</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>SKU</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Price</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Stock</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Active</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Featured</th>
                                <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!filteredProducts.length && !loadingList ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: 12 }}>
                                        Không có sản phẩm
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p, idx) => (
                                    <tr key={p.id ?? idx} style={{ borderTop: '1px solid #eee' }}>
                                        <td style={{ padding: 8 }}>{idx + 1}</td>
                                        <td style={{ padding: 8 }}>{p.sku}</td>
                                        <td style={{ padding: 8 }}>{p.productName}</td>
                                        <td style={{ padding: 8 }}>{p.price}</td>
                                        <td style={{ padding: 8 }}>{p.stockQuantity}</td>
                                        <td style={{ padding: 8 }}>{p.isActive ? 'Yes' : 'No'}</td>
                                        <td style={{ padding: 8 }}>{p.featured ? 'Yes' : 'No'}</td>
                                        <td style={{ padding: 8 }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <Button primary onClick={() => handleOpenEdit(p)}>
                                                    Edit
                                                </Button>
                                                <Button outline onClick={() => handleDelete(p.id)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {successMessage && (
                    <div className={cx('message', 'success')} style={{ marginTop: 12 }}>
                        {successMessage}
                    </div>
                )}
            </div>

            {/* Modal form */}
            {showForm && (
                <div
                    role="dialog"
                    aria-labelledby="modal-title"
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
                    <div style={{ width: 1100, maxWidth: '95%', background: 'white', borderRadius: 10, padding: 18 }}>
                        <h3 id="modal-title">{editingId ? 'Edit Product' : 'Add Product'}</h3>

                        {formErrors._server && (
                            <div className={cx('server-error', 'message')}>{formErrors._server}</div>
                        )}

                        <form onSubmit={handleFormSubmit}>
                            <div
                                className={cx('input')}
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}
                            >
                                <FormField
                                    name="sku"
                                    label="SKU"
                                    value={formModel.sku}
                                    placeholder="SKU"
                                    onChange={handleFormChange}
                                    error={formErrors.sku}
                                />
                                <FormField
                                    name="slug"
                                    label="Slug"
                                    value={formModel.slug}
                                    placeholder="slug-lowercase"
                                    onChange={handleFormChange}
                                    error={formErrors.slug}
                                />
                                <FormField
                                    name="productName"
                                    label="Product Name"
                                    value={formModel.productName}
                                    placeholder="Product Name"
                                    onChange={handleFormChange}
                                    error={formErrors.productName}
                                />
                                <FormField
                                    name="price"
                                    label="Price"
                                    type="number"
                                    value={formModel.price}
                                    onChange={handleFormChange}
                                    error={formErrors.price}
                                />
                                <FormField
                                    name="salePrice"
                                    label="Sale Price"
                                    type="number"
                                    value={formModel.salePrice}
                                    onChange={handleFormChange}
                                    error={formErrors.salePrice}
                                />
                                <FormField
                                    name="stockQuantity"
                                    label="Stock Quantity"
                                    type="number"
                                    value={formModel.stockQuantity}
                                    onChange={handleFormChange}
                                    error={formErrors.stockQuantity}
                                />
                                <FormField
                                    name="weightG"
                                    label="Weight (g)"
                                    type="number"
                                    value={formModel.weightG}
                                    onChange={handleFormChange}
                                    error={formErrors.weightG}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <CheckboxField
                                        name="isActive"
                                        label="Active"
                                        checked={formModel.isActive}
                                        onChange={handleFormChange}
                                    />
                                    <CheckboxField
                                        name="featured"
                                        label="Featured"
                                        checked={formModel.featured}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div
                                    className={cx('actions')}
                                    style={{
                                        gridColumn: '1 / -1',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: 12,
                                    }}
                                >
                                    <Button type="button" onClick={() => setShowForm(false)} disabled={formLoading}>
                                        Cancel
                                    </Button>
                                    <Button primary type="submit" disabled={formLoading}>
                                        {formLoading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;
