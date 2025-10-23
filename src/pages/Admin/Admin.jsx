import React, { useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './Admin.module.scss';

import adminApi from '../../api/adminApi';
import Button from '../../Layouts/components/Button';

const cx = classNames.bind(styles);

function FormField({ id, label, name, value, placeholder, type = 'text', onChange, error, step, min }) {
    return (
        <div className={cx('form-group', { invalid: !!error })}>
            {label && <label htmlFor={id ?? name}>{label}</label>}
            <input
                id={id ?? name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                step={step}
                min={min}
                aria-invalid={!!error}
                inputMode={type === 'number' ? 'decimal' : undefined}
            />
            {error && <p className={cx('error')}>{error}</p>}
        </div>
    );
}

function CheckboxField({ id, label, name, checked, onChange }) {
    return (
        <label className={cx('checkbox')} htmlFor={id ?? name}>
            <input
                id={id ?? name}
                type="checkbox"
                name={name}
                checked={!!checked}
                onChange={onChange}
                aria-checked={!!checked}
            />
            <span>{label}</span>
        </label>
    );
}
const slugRegex = /^[a-z0-9-]+$/;

const preparePayload = (product) => ({
    ...product,
    sku: product.sku?.trim() || null,
    slug: product.slug?.trim() || null,
    productName: product.productName?.trim() || null,
    price: product.price === '' || product.price == null ? null : Number(product.price),
    salePrice: product.salePrice === '' || product.salePrice == null ? null : Number(product.salePrice),
    stockQuantity: product.stockQuantity === '' || product.stockQuantity == null ? null : Number(product.stockQuantity),
    weightG: product.weightG === '' || product.weightG == null ? null : Number(product.weightG),
});

function Admin() {
    const [product, setProduct] = useState({
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

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = useCallback((e) => {
        const { name, type, value, checked } = e.target;
        const next = type === 'checkbox' ? checked : value;
        setProduct((prev) => ({ ...prev, [name]: next }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setSuccessMsg('');
    }, []);

    const validateClient = (p) => {
        const errs = {};
        if (!p.sku || !p.sku.trim()) errs.sku = 'SKU is required';
        if (!p.slug || !p.slug.trim()) errs.slug = 'Slug is required';
        else if (!slugRegex.test(p.slug.trim()))
            errs.slug = 'Slug must contain only lowercase letters, numbers and dashes';
        if (!p.productName || !p.productName.trim()) errs.productName = 'Product name is required';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setErrors({});
        setSuccessMsg('');

        const clientErrs = validateClient(product);
        if (Object.keys(clientErrs).length) {
            setErrors(clientErrs);
            return;
        }

        const payload = preparePayload(product);

        setLoading(true);
        try {
            await adminApi.createProduct(payload);
            setSuccessMsg('Product created successfully!');
            setProduct({
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
        } catch (err) {
            const resp = err?.response?.data;
            if (resp?.result && typeof resp.result === 'object') {
                setErrors(resp.result);
            } else if (resp?.message) {
                setErrors({ _server: resp.message });
            } else {
                setErrors({ _server: 'Failed to create product. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('card')}>
                <h2 className={cx('title')}>Admin — Create Product</h2>

                {successMsg && <div className={cx('message', 'success')}>{successMsg}</div>}
                {errors._server && <div className={cx('message', 'server-error')}>{errors._server}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={cx('input')}>
                        <FormField
                            name="sku"
                            label="SKU"
                            placeholder="SKU"
                            value={product.sku}
                            onChange={handleChange}
                            error={errors.sku}
                        />

                        <FormField
                            name="slug"
                            label="Slug"
                            placeholder="lowercase, numbers, dashes"
                            value={product.slug}
                            onChange={handleChange}
                            error={errors.slug}
                        />

                        <FormField
                            name="productName"
                            label="Product Name"
                            placeholder="Product name"
                            value={product.productName}
                            onChange={handleChange}
                            error={errors.productName}
                            id="productName"
                        />
                        <div className={cx('form-group', 'full')} style={{ display: 'none' }} />

                        <FormField
                            name="price"
                            label="Price"
                            type="number"
                            placeholder="Price"
                            value={product.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            error={errors.price}
                        />

                        <FormField
                            name="salePrice"
                            label="Sale Price"
                            type="number"
                            placeholder="Sale price"
                            value={product.salePrice}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            error={errors.salePrice}
                        />

                        <FormField
                            name="stockQuantity"
                            label="Stock Quantity"
                            type="number"
                            placeholder="Stock quantity"
                            value={product.stockQuantity}
                            onChange={handleChange}
                            step="1"
                            min="0"
                            error={errors.stockQuantity}
                        />

                        <FormField
                            name="weightG"
                            label="Weight (g)"
                            type="number"
                            placeholder="Weight in grams"
                            value={product.weightG}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            error={errors.weightG}
                        />

                        <div className={cx('full')}>
                            <CheckboxField
                                name="isActive"
                                label="Active"
                                checked={product.isActive}
                                onChange={handleChange}
                            />
                            <CheckboxField
                                name="featured"
                                label="Featured"
                                checked={product.featured}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={cx('actions')}>
                            <Button primary disabled={loading}>
                                {loading ? 'Adding...' : 'Add Product'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Admin;
