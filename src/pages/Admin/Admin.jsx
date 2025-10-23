// src/pages/Admin/Admin.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './Admin.module.scss';
import adminApi from '../../api/adminApi';
import productApi from '../../api/productApi';
import Button from '../../Layouts/components/Button';

const cx = classNames.bind(styles);

/* Small reusable fields */
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

/* Admin main */
function Admin() {
    const [products, setProducts] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [listError, setListError] = useState('');

    // modal / form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null); // null = create, otherwise edit id
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

    // fetch products
    const fetchProducts = useCallback(async () => {
        try {
            setLoadingList(true);
            setListError('');
            const resp = await productApi.getAll(); // returns axios response data
            const data = resp?.data ?? resp; // support both axios and raw
            // normalize arrays under data/result/items
            console.log('API Response:', data);
            let list = [];
            if (Array.isArray(data)) list = data;
            else if (Array.isArray(data.result)) list = data.result;
            else if (Array.isArray(data.data)) list = data.data;
            else if (Array.isArray(data.items)) list = data.items;
            // Normalize ID field
            list = list.map((product) => ({
                id: product.id ?? product.productId ?? product.idProduct,
                ...product,
            }));
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

    // Auto-clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // open create form
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
        setSuccessMessage('');
    };

    // open edit form (prefill)
    const handleOpenEdit = (item) => {
        setEditingId(item.id);
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
        setFormErrors({});
        setShowForm(true);
        setSuccessMessage('');
    };

    // delete product
    const handleDelete = async (id) => {
        const conf = window.confirm('Bạn có chắc muốn xóa sản phẩm này?');
        if (!conf) return;
        try {
            await adminApi.deleteProduct(id);
            setSuccessMessage('Xóa thành công.');
            // remove from local list
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error('Delete error', err);
            alert('Xóa thất bại. Thử lại.');
        }
    };

    // handle form input change
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormModel((prev) => ({ ...prev, [name]: val }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // prepare payload (same logic as trước)
    const preparePayload = (m) => ({
        ...m,
        sku: m.sku?.trim(),
        slug: m.slug?.trim(),
        productName: m.productName?.trim(),
        price: m.price === '' ? null : Number(m.price),
        salePrice: m.salePrice === '' ? null : Number(m.salePrice),
        stockQuantity: m.stockQuantity === '' ? null : Number(m.stockQuantity),
        weightG: m.weightG === '' ? null : Number(m.weightG),
    });

    // Client-side validation
    const validateForm = (model) => {
        const errors = {};
        if (!model.sku?.trim()) errors.sku = 'SKU is required';
        if (!model.productName?.trim()) errors.productName = 'Product name is required';
        if (model.price === '' || isNaN(model.price)) errors.price = 'Price must be a valid number';
        if (model.stockQuantity === '' || isNaN(model.stockQuantity))
            errors.stockQuantity = 'Stock quantity must be a valid number';
        // Add more validations as needed (e.g., for slug, weightG, etc.)
        return errors;
    };

    // submit form (create or update)
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

        const payload = preparePayload(formModel);

        try {
            if (editingId) {
                // update
                await adminApi.updateProduct(editingId, payload);
                setSuccessMessage('Cập nhật sản phẩm thành công.');
            } else {
                // create
                await adminApi.createProduct(payload);
                setSuccessMessage('Tạo sản phẩm thành công.');
            }

            // refresh list (simple approach)
            await fetchProducts();
            setShowForm(false);
        } catch (err) {
            // handle validation errors from backend
            const resp = err?.response?.data;
            let errors = { _server: 'An error occurred. Please try again.' };
            if (resp) {
                if (typeof resp.result === 'object') errors = resp.result;
                else if (resp.message) errors._server = resp.message;
                else if (resp.error) errors._server = resp.error;
            }
            setFormErrors(errors);
        } finally {
            setFormLoading(false);
        }
    };

    // Memoize table rows for performance
    const productRows = useMemo(
        () =>
            products.map((p, idx) => (
                <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: 8 }}>{idx + 1}</td>
                    <td style={{ padding: 8 }}>{p.sku}</td>
                    <td style={{ padding: 8 }}>{p.productName}</td>
                    <td style={{ padding: 8 }}>{p.price}</td>
                    <td style={{ padding: 8 }}>{p.stockQuantity}</td>
                    <td style={{ padding: 8 }}>{p.isActive ? 'Yes' : 'No'}</td>
                    <td style={{ padding: 8 }}>{p.featured ? 'Yes' : 'No'}</td>
                    <td>
                        <div className={cx('btn-crud')} style={{ display: 'flex', gap: 8 }}>
                            <Button onClick={() => handleOpenEdit(p)}>Edit</Button>
                            <Button onClick={() => handleDelete(p.id)}>Delete</Button>
                        </div>
                    </td>
                </tr>
            )),
        [products, handleOpenEdit, handleDelete],
    );

    return (
        <div className={cx('wrapper')}>
            <div className={cx('card')}>
                <h2 className={cx('title')}>Admin — Products</h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Button onClick={handleOpenCreate}>+ Add Product</Button>
                    </div>
                    <div style={{ color: '#6b7280' }}>{loadingList ? 'Loading...' : `${products.length} sản phẩm`}</div>
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
                                <th
                                    style={{
                                        textAlign: 'left',
                                        padding: 8,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        marginLeft: 50,
                                    }}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 && !loadingList ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: 12 }}>
                                        Không có sản phẩm
                                    </td>
                                </tr>
                            ) : (
                                productRows
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

            {/* Modal form (simple) */}
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
                    <div style={{ width: 1200, maxWidth: '95%', background: 'white', borderRadius: 10, padding: 18 }}>
                        <h3 id="modal-title">{editingId ? 'Edit Product' : 'Add Product'}</h3>

                        {formErrors._server && (
                            <div className={cx('server-error', 'message')}>{formErrors._server}</div>
                        )}

                        <form onSubmit={handleFormSubmit}>
                            <div className={cx('input')}>
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
                                    placeholder="Slug"
                                    onChange={handleFormChange}
                                    error={formErrors.slug}
                                />
                                <FormField
                                    name="productName"
                                    label="Product Name"
                                    placeholder="Product Name"
                                    value={formModel.productName}
                                    onChange={handleFormChange}
                                    error={formErrors.productName}
                                />
                                <FormField
                                    name="price"
                                    label="Price"
                                    type="number"
                                    placeholder="Price"
                                    value={formModel.price}
                                    onChange={handleFormChange}
                                    error={formErrors.price}
                                    step="10000"
                                    min="0"
                                />
                                <FormField
                                    name="salePrice"
                                    label="Sale Price"
                                    placeholder="Sale Price"
                                    type="number"
                                    value={formModel.salePrice}
                                    onChange={handleFormChange}
                                    error={formErrors.salePrice}
                                    step="10000"
                                    min="0"
                                />
                                <FormField
                                    name="stockQuantity"
                                    label="Stock Quantity"
                                    placeholder="Stock Quantity"
                                    type="number"
                                    value={formModel.stockQuantity}
                                    onChange={handleFormChange}
                                    error={formErrors.stockQuantity}
                                    step="1"
                                    min="0"
                                />
                                <FormField
                                    name="weightG"
                                    label="Weight (g)"
                                    placeholder="Weight"
                                    type="number"
                                    value={formModel.weightG}
                                    onChange={handleFormChange}
                                    error={formErrors.weightG}
                                    step="10"
                                    min="0"
                                />

                                <div className={cx('full')} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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

                                <div className={cx('actions')}>
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
