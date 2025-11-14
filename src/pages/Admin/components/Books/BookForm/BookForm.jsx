// src/components/Admin/Books/BookForm.jsx
import React, { useState, useEffect } from 'react';
import Checkbox from '../../../../../Layouts/components/Checkbox';
import QuantityInput from '../../../../../Layouts/components/QuantityInput';
import Button from '../../../../../Layouts/components/Button';
import classNames from 'classnames/bind';
import styles from './BookForm.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import Input from '../../../../../Layouts/Input';

const cx = classNames.bind(styles);

function FormField({ id, label, name, value, onChange, type = 'text', placeholder, error, required = false }) {
    return (
        <div className={cx('form-group', { invalid: !!error })}>
            {label && (
                <label htmlFor={id ?? name}>
                    {label} {required && <span className={cx('required')}>*</span>}
                </label>
            )}
            <Input
                primary
                scale
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

function NumberField({
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    step = 1,
    min = 0,
    max = 999999,
    unit = '',
}) {
    return (
        <div className={cx('form-group', { invalid: !!error })}>
            <label htmlFor={name}>
                {label} {required && <span className={cx('required')}>*</span>}
            </label>
            <div className={cx('number-input-container')}>
                <QuantityInput
                    value={value || 0}
                    onChange={(newValue) => onChange({ target: { name, value: newValue } })}
                    min={min}
                    max={max}
                    step={step}
                    size="medium"
                />
                {unit && <span className={cx('unit')}>{unit}</span>}
            </div>
            {error && <p className={cx('error')}>{error}</p>}
        </div>
    );
}

export default function BookForm({
    mode = 'create',
    initialData = null,
    categories = [],
    onSubmit,
    submitting = false,
}) {
    const initialFormState = {
        sku: '',
        slug: '',
        productName: '',
        price: '',
        salePrice: '',
        stockQuantity: 0,
        weightG: '',
        isActive: true,
        featured: false,
        categoryIds: [],
        url: '',
        fileName: '',
        mimeType: 'image/jpeg',
        width: 800,
        height: 600,
        sizeBytes: 102400,
        authorName: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [file, setFile] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData((prev) => ({
                ...prev,
                sku: initialData.sku ?? '',
                slug: initialData.slug ?? '',
                productName: initialData.productName ?? '',
                price: initialData.price ?? '',
                salePrice: initialData.salePrice ?? '',
                stockQuantity: initialData.stockQuantity ?? 0,
                weightG: initialData.weightG ?? '',
                isActive: initialData.isActive ?? true,
                featured: initialData.featured ?? false,
                categoryIds: (initialData.categories ?? []).map((c) => c.categoryId),
                url: initialData.url ?? '',
                fileName: initialData.fileName ?? '',
                mimeType: initialData.mimeType ?? 'image/jpeg',
                width: initialData.width ?? 800,
                height: initialData.height ?? 600,
                sizeBytes: initialData.sizeBytes ?? 0,
                authorName: initialData.authorName ?? '',
            }));
        }
    }, [initialData]);

    // basic handlers
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    };
    const handleFormInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        handleInputChange(name, val);
    };
    const handleCheckboxChange = (field) => (e) => handleInputChange(field, e.target.checked);
    const handleCategoryChange = (categoryId) => (e) => {
        const { checked } = e.target;
        setFormData((prev) => {
            const cur = [...(prev.categoryIds || [])];
            if (checked) {
                if (!cur.includes(categoryId)) return { ...prev, categoryIds: [...cur, categoryId] };
            } else {
                return { ...prev, categoryIds: cur.filter((id) => id !== categoryId) };
            }
            return prev;
        });
    };

    // file handlers
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0] ?? null;
        setFile(selectedFile);
        if (selectedFile) {
            setFormData((prev) => ({
                ...prev,
                fileName: selectedFile.name,
                mimeType: selectedFile.type,
                sizeBytes: selectedFile.size,
            }));
        }
    };
    const removeCover = () => {
        setFile(null);
        setFormData((prev) => ({ ...prev, url: '', fileName: '', mimeType: '', sizeBytes: 0 }));
    };

    // validation helpers
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    // Full validation — used for create
    const validateFullForm = () => {
        const errors = {};
        if (!formData.sku?.trim()) errors.sku = 'Vui lòng điền vào trường này.';
        if (!formData.slug?.trim()) errors.slug = 'Vui lòng điền vào trường này.';
        if (!formData.productName?.trim()) errors.productName = 'Vui lòng điền vào trường này.';
        if (formData.price === '' || isNaN(formData.price) || parseFloat(formData.price) < 0)
            errors.price = 'Giá phải là số hợp lệ.';
        if (formData.stockQuantity === '' || isNaN(formData.stockQuantity) || parseInt(formData.stockQuantity) < 0)
            errors.stockQuantity = 'Số lượng tồn kho phải là số hợp lệ.';
        if (formData.weightG && (isNaN(formData.weightG) || parseFloat(formData.weightG) < 0))
            errors.weightG = 'Trọng lượng phải là số hợp lệ.';
        if (formData.url && !isValidUrl(formData.url)) errors.url = 'Vui lòng nhập URL hợp lệ.';
        if (!Array.isArray(formData.categoryIds) || formData.categoryIds.length === 0)
            errors.categoryIds = 'Vui lòng chọn ít nhất một thể loại.';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Partial validation — used for edit: validate only fields with values (or changed)
    const validatePartialForm = () => {
        const errors = {};

        // slug: nếu user nhập slug thì check format
        if (formData.slug && formData.slug.toString().trim() !== '') {
            if (!/^[a-z0-9-]+$/.test(String(formData.slug))) {
                errors.slug = 'Slug chỉ chứa chữ thường, số và dấu "-".';
            }
        }

        // productName: nếu có nhập thì non-empty
        if (formData.productName && formData.productName.toString().trim() === '') {
            errors.productName = 'Vui lòng nhập tên sản phẩm nếu muốn cập nhật.';
        }

        // price: chỉ validate khi người dùng nhập giá (không rỗng)
        if (formData.price !== '' && formData.price !== null && formData.price !== undefined) {
            if (isNaN(formData.price) || Number(formData.price) < 0) {
                errors.price = 'Price phải là số >= 0.';
            }
        }

        // stockQuantity: nếu người dùng thay đổi
        if (formData.stockQuantity !== '' && formData.stockQuantity !== null && formData.stockQuantity !== undefined) {
            if (isNaN(formData.stockQuantity) || Number(formData.stockQuantity) < 0) {
                errors.stockQuantity = 'Stock quantity phải là số nguyên >= 0.';
            }
        }

        // url: nếu có nhập -> check
        if (formData.url && formData.url.toString().trim() !== '') {
            if (!isValidUrl(formData.url)) errors.url = 'Cover URL không hợp lệ.';
        }

        // categoryIds: nếu user thay đổi categories (dữ liệu rỗng hoặc chiều dài === 0) -> báo lỗi
        // BUT: trong edit, nếu user muốn clear categories intentionally, backend sẽ xử lý.
        // Ở đây ta chỉ báo lỗi khi admin gửi mảng rỗng (tùy em muốn buộc hay cho phép).
        if (Array.isArray(formData.categoryIds) && formData.categoryIds.length === 0) {
            // optional: comment out this line if you want to allow clearing categories
            // errors.categoryIds = 'Vui lòng chọn ít nhất một thể loại.';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // prepare request payload (same as before)
    const prepareFullBookRequest = () => {
        const request = {
            sku: formData.sku,
            slug: formData.slug,
            productName: formData.productName,
            price: formData.price === '' ? undefined : parseFloat(formData.price),
            salePrice: formData.salePrice === '' ? undefined : parseFloat(formData.salePrice),
            stockQuantity: formData.stockQuantity === '' ? undefined : parseInt(formData.stockQuantity) || 0,
            weightG: formData.weightG === '' ? undefined : parseFloat(formData.weightG),
            isActive: formData.isActive,
            featured: formData.featured,
            categoryIds: formData.categoryIds || [],
            ...(formData.url && {
                url: formData.url,
                fileName: formData.fileName || formData.url.split('/').pop(),
                mimeType: formData.mimeType,
                width: formData.width,
                height: formData.height,
                sizeBytes: formData.sizeBytes,
            }),
            ...(formData.authorName && { authorName: formData.authorName }),
        };
        return request;
    };

    // submit
    const handleSubmitLocal = async (e) => {
        e.preventDefault();
        setMessage('');
        setFieldErrors({});

        // create -> full validation
        if (mode === 'create') {
            if (!validateFullForm()) {
                setMessage('Vui lòng sửa các lỗi validation bên dưới.');
                return;
            }
        } else {
            // edit -> partial validation only
            if (!validatePartialForm()) {
                setMessage('Vui lòng sửa các trường hợp hợp lệ trước khi gửi.');
                return;
            }
        }

        const payload = prepareFullBookRequest();
        if (typeof onSubmit === 'function') {
            await onSubmit(payload, file, { setMessage, setFieldErrors });
        }
    };

    // Render
    return (
        <form className={cx('form')} onSubmit={handleSubmitLocal}>
            <div className={cx('headerContainer')}>
                <h3 className={cx('header')}>{mode === 'edit' ? 'Edit Book' : 'Create Book'}</h3>
            </div>

            {/* Product fields */}
            <div className={cx('fieldGroup')}>
                <FormField
                    name="sku"
                    label="SKU"
                    value={formData.sku}
                    onChange={handleFormInputChange}
                    error={fieldErrors.sku}
                    required={mode === 'create'}
                />
                <FormField
                    name="slug"
                    label="Slug"
                    value={formData.slug}
                    onChange={handleFormInputChange}
                    error={fieldErrors.slug}
                    required={mode === 'create'}
                />
                <FormField
                    name="productName"
                    label="Product Name"
                    value={formData.productName}
                    onChange={handleFormInputChange}
                    error={fieldErrors.productName}
                    required={mode === 'create'}
                />
            </div>

            <div className={cx('number-field')}>
                <NumberField
                    name="price"
                    label="Price"
                    value={formData.price}
                    onChange={handleFormInputChange}
                    error={fieldErrors.price}
                    required={mode === 'create'}
                    step={1000}
                    min={0}
                />
                <NumberField
                    name="salePrice"
                    label="Sale Price"
                    value={formData.salePrice}
                    onChange={handleFormInputChange}
                    error={fieldErrors.salePrice}
                    step={1000}
                    min={0}
                />
                <NumberField
                    name="stockQuantity"
                    label="Stock Quantity"
                    value={formData.stockQuantity}
                    onChange={handleFormInputChange}
                    error={fieldErrors.stockQuantity}
                    required={mode === 'create'}
                    step={1}
                    min={0}
                />
                <NumberField
                    name="weightG"
                    label="Weight G"
                    value={formData.weightG}
                    onChange={handleFormInputChange}
                    error={fieldErrors.weightG}
                    step={50}
                    min={0}
                />
                <div className={cx('checkboxGroup')}>
                    <Checkbox
                        name="isActive"
                        label="Active"
                        checked={formData.isActive}
                        onChange={handleCheckboxChange('isActive')}
                        variant="success"
                        size="medium"
                    />
                    <Checkbox
                        name="featured"
                        label="Featured"
                        checked={formData.featured}
                        onChange={handleCheckboxChange('featured')}
                        variant="primary"
                        size="medium"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className={cx('categorySection')}>
                <div className={cx('form-group', { invalid: !!fieldErrors.categoryIds })}>
                    <label>Categories {mode === 'create' && <span className={cx('required')}>*</span>}</label>
                    <div className={cx('categoryTree')}>
                        {categories.map((cat) => (
                            <div key={cat.categoryId} style={{ marginLeft: (cat.level ?? 0) * 20 }}>
                                <Checkbox
                                    name={`category-${cat.categoryId}`}
                                    label={cat.categoryName}
                                    checked={formData.categoryIds?.includes(cat.categoryId) || false}
                                    onChange={handleCategoryChange(cat.categoryId)}
                                    variant="info"
                                    size="medium"
                                />
                            </div>
                        ))}
                    </div>
                    {fieldErrors.categoryIds && <p className={cx('error')}>{fieldErrors.categoryIds}</p>}
                </div>
            </div>

            {/* Cover */}
            <h4 className={cx('sectionTitle')}>Cover (Optional)</h4>
            <div className={cx('coverSection')}>
                <div className={cx('fileRow')}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        id="cover-upload"
                        className={cx('fileInput')}
                    />
                    <label htmlFor="cover-upload" className={cx('fileButton')}>
                        📁 Upload Cover
                    </label>
                    {file && <span className={cx('fileName')}>{file.name}</span>}
                    {!file && formData.url && (
                        <div className={cx('existingCover')}>
                            <img src={formData.url} alt="cover preview" className={cx('coverPreview')} />
                            <button type="button" className={cx('btn-link')} onClick={removeCover}>
                                <FontAwesomeIcon icon={faTrash} /> Remove
                            </button>
                        </div>
                    )}
                </div>
                <div className={cx('or')}>OR</div>
                <FormField
                    name="url"
                    label="Cover URL"
                    value={formData.url}
                    placeholder="Cover URL (if no file)"
                    onChange={handleFormInputChange}
                    error={fieldErrors.url}
                />
            </div>

            {/* Author */}
            <h4 className={cx('sectionTitle')}>Author (Optional)</h4>
            <div className={cx('authorSection')}>
                <FormField
                    name="authorName"
                    label="Author Name"
                    value={formData.authorName}
                    onChange={handleFormInputChange}
                />
                <div className={cx('author-info-tip')}>
                    <FontAwesomeIcon icon={faInfoCircle} className={cx('info-icon')} />
                    <span>Chỉ cần nhập tên tác giả. Chi tiết về tác giả có thể được thêm sau.</span>
                </div>
            </div>

            <div className={cx('actions')}>
                <Button type="submit" disabled={submitting} className={cx('submitButton')} primary={!submitting}>
                    {submitting
                        ? mode === 'edit'
                            ? 'Updating...'
                            : 'Creating...'
                        : mode === 'edit'
                        ? 'Update Book'
                        : 'Create Book'}
                </Button>
            </div>

            {message && (
                <div
                    className={cx('message', {
                        error: Object.keys(fieldErrors).length > 0,
                        success: !Object.keys(fieldErrors).length,
                    })}
                >
                    {message}
                </div>
            )}
        </form>
    );
}
