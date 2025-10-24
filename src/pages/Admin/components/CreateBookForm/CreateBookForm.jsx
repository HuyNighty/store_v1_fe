import React, { useState } from 'react';
import { createFullBook, validateFullBookCreation } from '../../../../utils/createFullBook';
import Button from '../../../../Layouts/components/Button';
import Checkbox from '../../../../Layouts/components/Checkbox';
import QuantityInput from '../../../../Layouts/components/QuantityInput';
import styles from './CreateBookForm.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

// FormField Component
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

const NATIONALITY_OPTIONS = [
    { value: 'VN', label: 'Vietnamese' },
    { value: 'US', label: 'American' },
    { value: 'UK', label: 'British' },
    { value: 'FR', label: 'French' },
    { value: 'JP', label: 'Japanese' },
    { value: 'CN', label: 'Chinese' },
    { value: 'KR', label: 'Korean' },
    { value: 'RU', label: 'Russian' },
    { value: 'OTHER', label: 'Other' },
];

function CreateBookForm() {
    // Initial State
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

        // Asset data
        url: '',
        fileName: '',
        mimeType: 'image/jpeg',
        width: 800,
        height: 600,
        sizeBytes: 102400,

        // Author data
        authorName: '',
        authorBio: '',
        authorBornDate: '',
        authorDeathDate: '',
        authorNationality: 'OTHER',
    };

    // State Management
    const [formData, setFormData] = useState(initialFormState);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Handlers
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
        // Clear error when user starts typing
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

    const resetForm = () => {
        setFormData(initialFormState);
        setFile(null);
        setMessage('');
        setFieldErrors({});
    };

    // Validation
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

    // Request Preparation
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

            // Asset data (optional)
            ...(formData.url && {
                url: formData.url,
                fileName: formData.fileName || formData.url.split('/').pop(),
                mimeType: formData.mimeType,
                width: formData.width,
                height: formData.height,
                sizeBytes: formData.sizeBytes,
            }),

            // Author data (optional)
            ...(formData.authorName && {
                authorName: formData.authorName,
                authorBio: formData.authorBio,
                authorBornDate: formData.authorBornDate || null,
                authorDeathDate: formData.authorDeathDate || null,
                authorNationality: formData.authorNationality,
            }),
        };

        console.log('📦 Prepared full book request:', request);
        return request;
    };

    // Form Submission
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
                {/* Price với QuantityInput */}
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

                {/* Sale Price với QuantityInput */}
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

                {/* Stock Quantity với QuantityInput */}
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

                {/* Weight với QuantityInput */}
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

    const renderAuthorFields = () => (
        <div className={cx('authorSection')}>
            <FormField
                name="authorName"
                label="Author Name"
                value={formData.authorName}
                placeholder="Author name"
                onChange={handleFormInputChange}
            />

            <div className={cx('form-group')}>
                <label htmlFor="authorBio">Bio</label>
                <textarea
                    id="authorBio"
                    name="authorBio"
                    placeholder="Bio"
                    value={formData.authorBio}
                    onChange={handleFormInputChange}
                    className={cx('bioTextarea')}
                />
            </div>

            <div className={cx('authorDetails')}>
                <FormField
                    name="authorBornDate"
                    label="Born Date"
                    type="date"
                    value={formData.authorBornDate}
                    onChange={handleFormInputChange}
                />
                <FormField
                    name="authorDeathDate"
                    label="Death Date"
                    type="date"
                    value={formData.authorDeathDate}
                    onChange={handleFormInputChange}
                />
            </div>

            <div className={cx('form-group')}>
                <label htmlFor="authorNationality">Nationality</label>
                <select
                    id="authorNationality"
                    name="authorNationality"
                    value={formData.authorNationality}
                    onChange={handleFormInputChange}
                    className={cx('selectInput')}
                >
                    <option value="OTHER">Select Nationality</option>
                    {NATIONALITY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
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
