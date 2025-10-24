// src/components/CreateBookForm/CreateBookForm.jsx
import React, { useState } from 'react';
import { createFullBook } from '../../../../utils/createFullBook';
import Button from '../../../../Layouts/components/Button';
import styles from './CreateBookForm.module.scss';

function CreateBookForm() {
    // Initial states
    const initialProductState = {
        sku: '',
        slug: '',
        productName: '',
        price: '',
        salePrice: '',
        stockQuantity: '',
        weightG: '',
        isActive: true,
        featured: false,
    };

    const initialCoverState = {
        url: '',
        fileName: '',
        file: null,
        mimeType: 'image/jpeg',
        width: null,
        height: null,
        sizeBytes: null,
    };

    const initialAuthorState = {
        authorName: '',
        bio: '',
        bornDate: '',
        deathDate: '',
        nationality: 'OTHER', // Default value
        assetId: null,
    };

    // State hooks
    const [product, setProduct] = useState(initialProductState);
    const [cover, setCover] = useState(initialCoverState);
    const [author, setAuthor] = useState(initialAuthorState);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Handlers
    const handleFileChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setCover((prevCover) => ({
                ...prevCover,
                file,
                fileName: file.name,
                mimeType: file.type,
                sizeBytes: file.size,
            }));
        }
    };

    const handleProductChange = (field, value) => {
        setProduct((prev) => ({ ...prev, [field]: value }));
    };

    const handleCoverChange = (field, value) => {
        setCover((prev) => ({ ...prev, [field]: value }));
    };

    const handleAuthorChange = (field, value) => {
        setAuthor((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setProduct(initialProductState);
        setCover(initialCoverState);
        setAuthor(initialAuthorState);
        setMessage('');
        setFieldErrors({});
    };

    const preparePayload = () => {
        const productPayload = {
            sku: product.sku,
            slug: product.slug,
            productName: product.productName,
            price: product.price ? Number(product.price) : null,
            salePrice: product.salePrice ? Number(product.salePrice) : null,
            stockQuantity: product.stockQuantity ? Number(product.stockQuantity) : 0,
            weightG: product.weightG ? Number(product.weightG) : null,
            isActive: product.isActive,
            featured: product.featured,
        };

        const assetPayload = cover.file
            ? {
                  file: cover.file,
                  fileName: cover.fileName,
                  mimeType: cover.mimeType,
              }
            : cover.url
            ? {
                  url: cover.url,
                  fileName: cover.fileName || cover.url.split('/').pop(),
                  mimeType: cover.mimeType,
                  width: 800, // Default values for required fields
                  height: 600,
                  sizeBytes: 102400,
              }
            : null;

        const authorPayload = author.authorName
            ? {
                  authorName: author.authorName,
                  bio: author.bio,
                  bornDate: author.bornDate || null,
                  deathDate: author.deathDate || null,
                  nationality: author.nationality,
                  assetId: author.assetId,
              }
            : null;

        return { productPayload, assetPayload, authorPayload };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setFieldErrors({});
        setLoading(true);

        try {
            const payload = preparePayload();
            console.log('📤 Submitting payload:', payload);
            const result = await createFullBook(payload);

            if (result.success) {
                setMessage(`Book created successfully. productId=${result.created.productId ?? 'unknown'}`);
                resetForm();
            } else {
                handleSubmissionError(result);
            }
        } catch (error) {
            console.error('Submission error:', error);
            setMessage(`Error: ${error?.message ?? 'Unknown error occurred'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmissionError = (result) => {
        console.log('🔍 Error result:', result);

        if (result.validationErrors) {
            setFieldErrors(result.validationErrors);
            setMessage('Validation failed: ' + result.validationErrors.join(', '));
        } else if (result.errorDetails?.response?.message) {
            setMessage(`Backend error: ${result.errorDetails.response.message}`);
        } else if (result.error?.message) {
            setMessage(`Error: ${result.error.message}`);
        } else if (result.allow) {
            setMessage(`Server rejects POST /assets. Allowed methods: ${result.allow}.`);
        } else {
            setMessage('Creation failed (unknown reason).');
        }
    };

    // Render helpers
    const renderInput = (placeholder, value, onChange, type = 'text', required = false, errorKey = '') => (
        <div className={styles.inputWrapper}>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className={fieldErrors[errorKey] ? styles.error : ''}
            />
            {fieldErrors[errorKey] && <div className={styles.errorText}>{fieldErrors[errorKey]}</div>}
        </div>
    );

    const renderProductFields = () => (
        <div className={styles.fieldGroup}>
            {renderInput('SKU', product.sku, (value) => handleProductChange('sku', value), 'text', true, 'sku')}
            {renderInput(
                'Slug (lowercase-dash)',
                product.slug,
                (value) => handleProductChange('slug', value),
                'text',
                true,
                'slug',
            )}
            {renderInput(
                'Product name',
                product.productName,
                (value) => handleProductChange('productName', value),
                'text',
                true,
                'productName',
            )}
            {renderInput(
                'Price',
                product.price,
                (value) => handleProductChange('price', value),
                'number',
                true,
                'price',
            )}
            {renderInput('Sale Price', product.salePrice, (value) => handleProductChange('salePrice', value), 'number')}
            {renderInput(
                'Stock Quantity',
                product.stockQuantity,
                (value) => handleProductChange('stockQuantity', value),
                'number',
            )}
            {renderInput('Weight (grams)', product.weightG, (value) => handleProductChange('weightG', value), 'number')}

            {/* Active & Featured checkboxes */}
            <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={product.isActive}
                        onChange={(e) => handleProductChange('isActive', e.target.checked)}
                    />
                    Active
                </label>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={product.featured}
                        onChange={(e) => handleProductChange('featured', e.target.checked)}
                    />
                    Featured
                </label>
            </div>
        </div>
    );

    const renderCoverFields = () => (
        <div className={styles.coverSection}>
            <div className={styles.fileRow}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="cover-upload"
                    className={styles.fileInput}
                />
                <label htmlFor="cover-upload" className={styles.fileButton}>
                    📁 Upload Cover
                </label>
                {cover.fileName && <span className={styles.fileName}>{cover.fileName}</span>}
            </div>

            <div className={styles.or}>OR</div>

            <input
                placeholder="Cover URL (if no file)"
                value={cover.url}
                onChange={(e) => handleCoverChange('url', e.target.value)}
                className={styles.urlInput}
            />

            {cover.url && (
                <div className={styles.urlPreview}>
                    <small>URL Preview: {cover.url}</small>
                </div>
            )}
        </div>
    );

    const renderAuthorFields = () => (
        <div className={styles.authorSection}>
            <input
                placeholder="Author name"
                value={author.authorName}
                onChange={(e) => handleAuthorChange('authorName', e.target.value)}
                className={styles.authorInput}
            />
            <textarea
                placeholder="Bio"
                value={author.bio}
                onChange={(e) => handleAuthorChange('bio', e.target.value)}
                className={styles.bioTextarea}
            />

            <div className={styles.authorDetails}>
                <input
                    placeholder="Born Date (YYYY-MM-DD)"
                    value={author.bornDate}
                    onChange={(e) => handleAuthorChange('bornDate', e.target.value)}
                    className={styles.dateInput}
                    type="date"
                />
                <input
                    placeholder="Death Date (YYYY-MM-DD)"
                    value={author.deathDate}
                    onChange={(e) => handleAuthorChange('deathDate', e.target.value)}
                    className={styles.dateInput}
                    type="date"
                />
            </div>

            <select
                value={author.nationality}
                onChange={(e) => handleAuthorChange('nationality', e.target.value)}
                className={styles.selectInput}
            >
                <option value="UNKNOWN">Select Nationality</option>
                <option value="AMERICAN">American</option>
                <option value="BRITISH">British</option>
                <option value="FRENCH">French</option>
                <option value="GERMAN">German</option>
                <option value="JAPANESE">Japanese</option>
                <option value="CHINESE">Chinese</option>
                <option value="VIETNAMESE">Vietnamese</option>
                <option value="KOREAN">Korean</option>
                <option value="RUSSIAN">Russian</option>
                <option value="OTHER">Other</option>
            </select>

            <input
                placeholder="Author Asset ID (optional)"
                value={author.assetId || ''}
                onChange={(e) => handleAuthorChange('assetId', e.target.value ? parseInt(e.target.value) : null)}
                className={styles.numberInput}
                type="number"
            />
        </div>
    );

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h3 className={styles.header}>Create Book</h3>

            {renderProductFields()}

            <h4 className={styles.sectionTitle}>Cover</h4>
            {renderCoverFields()}

            <hr className={styles.divider} />

            <h4 className={styles.sectionTitle}>Author (optional)</h4>
            {renderAuthorFields()}

            <div className={styles.actions}>
                <Button type="submit" disabled={loading} className={styles.submitButton}>
                    {loading ? 'Creating...' : 'Create Book'}
                </Button>
                <Button type="button" onClick={resetForm} className={styles.resetButton}>
                    Reset
                </Button>
            </div>

            {message && (
                <div
                    className={`${styles.message} ${
                        Object.keys(fieldErrors).length > 0 ? styles.error : styles.success
                    }`}
                >
                    {message}
                </div>
            )}
        </form>
    );
}

export default CreateBookForm;
