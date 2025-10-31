import React, { useState, useEffect } from 'react';
import { createFullBook, validateFullBookCreation } from '../../../../utils/createFullBook';
import Button from '../../../../Layouts/components/Button';
import Checkbox from '../../../../Layouts/components/Checkbox';
import QuantityInput from '../../../../Layouts/components/QuantityInput';
import styles from './CreateBookForm.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import categoryApi from '../../../../api/categoryApi';

const cx = classNames.bind(styles);

// FormField Component (giữ nguyên)
function FormField({ id, label, name, value, onChange, type = 'text', placeholder, error, required = false }) {
    return (
        <div className={cx('form-group', { invalid: !!error })}>
            {label && (
                <label htmlFor={id ?? name}>
                    {label} {required && <span className={cx('required')}>*</span>}
                </label>
            )}
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

// NumberField Component (giữ nguyên)
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

function CreateBookForm() {
    // Initial State - Đơn giản hóa author data
    const initialFormState = {
        // Product data
        sku: '',
        slug: '',
        productName: '',
        price: '',
        salePrice: '',
        stockQuantity: 0,
        weightG: '',
        isActive: true,
        featured: false,

        // Category data
        categoryIds: [],

        // Asset data
        url: '',
        fileName: '',
        mimeType: 'image/jpeg',
        width: 800,
        height: 600,
        sizeBytes: 102400,

        // Author data - Chỉ cần authorName
        authorName: '',
        // Bỏ các trường author details không cần thiết
        // authorBio: '',
        // authorBornDate: '',
        // authorDeathDate: '',
        // authorNationality: 'OTHER',
    };

    // State Management (giữ nguyên)
    const [formData, setFormData] = useState(initialFormState);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // Fetch categories on component mount (giữ nguyên)
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const response = await categoryApi.getAllCategories();
            const activeCategories = response.data.result.filter((cat) => cat.isActive);
            setCategories(activeCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Handlers (giữ nguyên)
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

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleFormInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        handleInputChange(name, val);
    };

    const handleCheckboxChange = (field) => (e) => {
        handleInputChange(field, e.target.checked);
    };

    const handleCategoryChange = (categoryId) => (e) => {
        const { checked } = e.target;
        setFormData((prev) => {
            const currentCategoryIds = [...(prev.categoryIds || [])];

            if (checked) {
                if (!currentCategoryIds.includes(categoryId)) {
                    return { ...prev, categoryIds: [...currentCategoryIds, categoryId] };
                }
            } else {
                return { ...prev, categoryIds: currentCategoryIds.filter((id) => id !== categoryId) };
            }

            return prev;
        });
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setFile(null);
        setMessage('');
        setFieldErrors({});
    };

    // Validation (giữ nguyên)
    const validateForm = () => {
        const errors = {};

        if (!formData.sku?.trim()) {
            errors.sku = 'Vui lòng điền vào trường này.';
        }

        if (!formData.slug?.trim()) {
            errors.slug = 'Vui lòng điền vào trường này.';
        }

        if (!formData.productName?.trim()) {
            errors.productName = 'Vui lòng điền vào trường này.';
        }

        if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
            errors.price = 'Giá phải là số hợp lệ.';
        }

        if (formData.stockQuantity === '' || isNaN(formData.stockQuantity) || parseInt(formData.stockQuantity) < 0) {
            errors.stockQuantity = 'Số lượng tồn kho phải là số hợp lệ.';
        }

        if (formData.weightG && (isNaN(formData.weightG) || parseFloat(formData.weightG) < 0)) {
            errors.weightG = 'Trọng lượng phải là số hợp lệ.';
        }

        if (formData.url && !isValidUrl(formData.url)) {
            errors.url = 'Vui lòng nhập URL hợp lệ.';
        }

        if (formData.categoryIds && formData.categoryIds.length === 0) {
            errors.categoryIds = 'Vui lòng chọn ít nhất một thể loại.';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    // Request Preparation - Đơn giản hóa
    const prepareFullBookRequest = () => {
        const request = {
            // Product data
            sku: formData.sku,
            slug: formData.slug,
            productName: formData.productName,
            price: parseFloat(formData.price) || 0,
            salePrice: parseFloat(formData.salePrice) || 0,
            stockQuantity: parseInt(formData.stockQuantity) || 0,
            weightG: parseFloat(formData.weightG) || 0,
            isActive: formData.isActive,
            featured: formData.featured,

            // Category data
            categoryIds: formData.categoryIds || [],

            // Asset data (optional)
            ...(formData.url && {
                url: formData.url,
                fileName: formData.fileName || formData.url.split('/').pop(),
                mimeType: formData.mimeType,
                width: formData.width,
                height: formData.height,
                sizeBytes: formData.sizeBytes,
            }),

            // Author data (optional) - Chỉ cần authorName
            ...(formData.authorName && {
                authorName: formData.authorName,
                // Bỏ các trường author details
            }),
        };

        console.log('📦 Prepared full book request:', request);
        return request;
    };

    // Form Submission (giữ nguyên)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        if (!validateForm()) {
            setMessage('Vui lòng sửa các lỗi validation bên dưới.');
            setLoading(false);
            return;
        }

        try {
            const fullBookRequest = prepareFullBookRequest();

            const validation = validateFullBookCreation(fullBookRequest);
            if (!validation.isValid) {
                setMessage('Validation failed: ' + validation.errors.join(', '));
                setLoading(false);
                return;
            }

            const result = await createFullBook(fullBookRequest);

            if (result.success) {
                setMessage('Tạo sách thành công!');
                resetForm();
            } else {
                handleSubmissionError(result);
            }
        } catch (error) {
            console.error('Submission error:', error);
            setMessage(`Lỗi: ${error?.message ?? 'Đã xảy ra lỗi không xác định.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmissionError = (result) => {
        console.log('🔍 Error result:', result);

        if (result.errorDetails?.response?.message) {
            setMessage(`Lỗi: ${result.errorDetails.response.message}`);
        } else if (result.error?.message) {
            setMessage(`Lỗi: ${result.error.message}`);
        } else {
            setMessage('Tạo thất bại. Vui lòng thử lại.');
        }
    };

    // Render Methods
    const renderProductFields = () => (
        <>
            <div className={cx('fieldGroup')}>
                <FormField
                    name="sku"
                    label="SKU"
                    value={formData.sku}
                    placeholder="SKU"
                    onChange={handleFormInputChange}
                    error={fieldErrors.sku}
                    required
                />
                <FormField
                    name="slug"
                    label="Slug"
                    value={formData.slug}
                    placeholder="slug-lowercase"
                    onChange={handleFormInputChange}
                    error={fieldErrors.slug}
                    required
                />
                <FormField
                    name="productName"
                    label="Product Name"
                    value={formData.productName}
                    placeholder="Product Name"
                    onChange={handleFormInputChange}
                    error={fieldErrors.productName}
                    required
                />
            </div>
            <div className={cx('number-field')}>
                <NumberField
                    name="price"
                    label="Price"
                    value={formData.price}
                    onChange={handleFormInputChange}
                    error={fieldErrors.price}
                    required
                    step={1000}
                    min={0}
                    max={100000000}
                />

                <NumberField
                    name="salePrice"
                    label="Sale Price"
                    value={formData.salePrice}
                    onChange={handleFormInputChange}
                    error={fieldErrors.salePrice}
                    step={1000}
                    min={0}
                    max={100000000}
                />

                <NumberField
                    name="stockQuantity"
                    label="Stock Quantity"
                    value={formData.stockQuantity}
                    onChange={handleFormInputChange}
                    error={fieldErrors.stockQuantity}
                    required
                    step={1}
                    min={0}
                    max={9999}
                />

                <NumberField
                    name="weightG"
                    label="Weight G"
                    value={formData.weightG}
                    onChange={handleFormInputChange}
                    error={fieldErrors.weightG}
                    step={50}
                    min={0}
                    max={100000}
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
        </>
    );

    const renderCategoryFields = () => {
        const buildCategoryTree = (categories, parentId = 0, level = 0) => {
            const children = categories.filter((cat) => cat.parentId === parentId);
            if (children.length === 0) return null;

            return children.map((category) => (
                <div key={category.categoryId} style={{ marginLeft: `${level * 20}px` }}>
                    <Checkbox
                        name={`category-${category.categoryId}`}
                        label={category.categoryName}
                        checked={formData.categoryIds?.includes(category.categoryId) || false}
                        onChange={handleCategoryChange(category.categoryId)}
                        variant="info"
                        size="medium"
                    />
                    {buildCategoryTree(categories, category.categoryId, level + 1)}
                </div>
            ));
        };
        return (
            <div className={cx('categorySection')}>
                <div className={cx('form-group', { invalid: !!fieldErrors.categoryIds })}>
                    <label>
                        Categories <span className={cx('required')}>*</span>
                    </label>
                    {categoriesLoading ? (
                        <div className={cx('loading-categories')}>Đang tải thể loại...</div>
                    ) : (
                        <div className={cx('categoryTree')}>{buildCategoryTree(categories)}</div>
                    )}
                    {fieldErrors.categoryIds && <p className={cx('error')}>{fieldErrors.categoryIds}</p>}
                </div>
            </div>
        );
    };

    const renderCoverFields = () => (
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
    );

    // Author Fields - Đơn giản hóa chỉ còn authorName
    const renderAuthorFields = () => (
        <div className={cx('authorSection')}>
            <FormField
                name="authorName"
                label="Author Name"
                value={formData.authorName}
                placeholder="Author name"
                onChange={handleFormInputChange}
            />

            {/* Thêm tooltip giải thích */}
            <div className={cx('author-info-tip')}>
                <FontAwesomeIcon icon={faInfoCircle} className={cx('info-icon')} />
                <span>Chỉ cần nhập tên tác giả. Chi tiết về tác giả có thể được thêm sau.</span>
            </div>
        </div>
    );

    return (
        <form className={cx('form')} onSubmit={handleSubmit}>
            <div className={cx('headerContainer')}>
                <Button to="/admin" back>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
                <h3 className={cx('header')}>Create Book</h3>
            </div>

            {renderProductFields()}

            <h4 className={cx('sectionTitle')}>Categories</h4>
            {renderCategoryFields()}

            <h4 className={cx('sectionTitle')}>Cover (Optional)</h4>
            {renderCoverFields()}

            <hr className={cx('divider')} />

            <h4 className={cx('sectionTitle')}>Author (Optional)</h4>
            {renderAuthorFields()}

            <div className={cx('actions')}>
                <Button type="submit" disabled={loading} className={cx('submitButton')} primary={!loading}>
                    {loading ? 'Creating...' : 'Create Book'}
                </Button>
                <Button type="button" onClick={resetForm} className={cx('resetButton')} outline>
                    Reset
                </Button>
            </div>

            {message && (
                <div
                    className={cx('message', {
                        error:
                            Object.keys(fieldErrors).length > 0 ||
                            message.includes('Lỗi') ||
                            message.includes('failed'),
                        success: Object.keys(fieldErrors).length === 0 && message.includes('thành công'),
                    })}
                >
                    {message}
                </div>
            )}
        </form>
    );
}

export default CreateBookForm;
