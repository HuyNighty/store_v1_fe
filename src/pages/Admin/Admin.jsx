import React, { useState, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './Admin.module.scss';
import { AuthContext } from '../../Context/AuthContext';
import adminApi from '../../api/adminApi';
import { createFullBookItem } from '../../service/adminService';

const cx = classNames.bind(styles);

function Admin() {
    const { user } = useContext(AuthContext);

    const roles = (() => {
        if (!user) return [];
        if (Array.isArray(user.roles)) return user.roles.map((r) => String(r).toUpperCase());
        if (typeof user.scope === 'string') return user.scope.split(/\s+/).map((r) => r.toUpperCase());
        if (typeof user.role === 'string') return [user.role.toUpperCase()];
        return [];
    })();

    const isAdmin = roles.includes('ADMIN');

    const [tab, setTab] = useState('product');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [err, setErr] = useState(null);

    const [productForm, setProductForm] = useState({
        sku: '',
        slug: '',
        productName: '',
        price: '',
        salePrice: '',
        stockQuantity: 0,
        weightG: '',
        isActive: true,
        featured: false,
    });

    const [assetForm, setAssetForm] = useState({
        url: '',
        type: 'IMAGE',
        fileName: '',
        mimeType: 'image/jpeg',
        width: 0,
        height: 0,
        sizeBytes: 0,
    });

    const [linkForm, setLinkForm] = useState({
        productId: '',
        assetId: '',
        type: 'COVER',
        ordinal: 0,
    });

    const [authorForm, setAuthorForm] = useState({
        authorName: '',
        bio: '',
        bornDate: '',
        deathDate: '',
        nationality: 'VIETNAMESE',
        assetId: null,
    });

    const [bookAuthorForm, setBookAuthorForm] = useState({
        productId: '',
        authorId: '',
        authorRole: 'PRIMARY',
    });

    const [full, setFull] = useState({
        product: {
            sku: '',
            slug: '',
            productName: '',
            price: '',
            salePrice: '',
            stockQuantity: 0,
            weightG: '',
            isActive: true,
            featured: false,
        },
        assets: [],
        assetLinks: [],
        authors: [],
        bookAuthors: [],
    });

    const clearStatus = () => {
        setMsg(null);
        setErr(null);
    };

    const handleChange = (setter) => (e) => {
        const { name, value, type, checked } = e.target;
        setter((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    };

    const submitProduct = async (e) => {
        e?.preventDefault();
        clearStatus();
        setLoading(true);
        try {
            const payload = {
                sku: productForm.sku,
                slug: productForm.slug,
                productName: productForm.productName,
                price: Number(productForm.price),
                salePrice: productForm.salePrice ? Number(productForm.salePrice) : null,
                stockQuantity: Number(productForm.stockQuantity),
                weightG: productForm.weightG ? Number(productForm.weightG) : null,
                isActive: Boolean(productForm.isActive),
                featured: Boolean(productForm.featured),
            };
            const res = await adminApi.createProduct(payload);
            setMsg(JSON.stringify(res?.data ?? res, null, 2));
        } catch (error) {
            setErr(error.response?.data?.message || error.message || 'Tạo product thất bại');
        } finally {
            setLoading(false);
        }
    };

    const submitAsset = async (e) => {
        e?.preventDefault();
        clearStatus();
        setLoading(true);
        try {
            const payload = {
                url: assetForm.url,
                type: assetForm.type,
                fileName: assetForm.fileName,
                mimeType: assetForm.mimeType,
                width: Number(assetForm.width),
                height: Number(assetForm.height),
                sizeBytes: Number(assetForm.sizeBytes),
            };
            const res = await adminApi.createAsset(payload);
            setMsg(JSON.stringify(res?.data ?? res, null, 2));
        } catch (error) {
            setErr(error.response?.data?.message || error.message || 'Tạo asset thất bại');
        } finally {
            setLoading(false);
        }
    };

    const submitLink = async (e) => {
        e?.preventDefault();
        clearStatus();
        setLoading(true);
        try {
            const payload = {
                productId: Number(linkForm.productId),
                assetId: Number(linkForm.assetId),
                type: linkForm.type,
                ordinal: Number(linkForm.ordinal || 0),
            };
            const res = await adminApi.createProductAssetLink(payload);
            setMsg(JSON.stringify(res?.data ?? res, null, 2));
        } catch (error) {
            setErr(error.response?.data?.message || error.message || 'Tạo product-asset link thất bại');
        } finally {
            setLoading(false);
        }
    };

    const submitAuthor = async (e) => {
        e?.preventDefault();
        clearStatus();
        setLoading(true);
        try {
            const payload = {
                authorName: authorForm.authorName,
                bio: authorForm.bio,
                bornDate: authorForm.bornDate || null,
                deathDate: authorForm.deathDate || null,
                nationality: authorForm.nationality,
                assetId: authorForm.assetId ? Number(authorForm.assetId) : null,
            };
            const res = await adminApi.createAuthor(payload);
            setMsg(JSON.stringify(res?.data ?? res, null, 2));
        } catch (error) {
            setErr(error.response?.data?.message || error.message || 'Tạo author thất bại');
        } finally {
            setLoading(false);
        }
    };

    const submitBookAuthor = async (e) => {
        e?.preventDefault();
        clearStatus();
        setLoading(true);
        try {
            const payload = {
                productId: Number(bookAuthorForm.productId),
                authorId: Number(bookAuthorForm.authorId),
                authorRole: bookAuthorForm.authorRole,
            };
            const res = await adminApi.createBookAuthor(payload);
            setMsg(JSON.stringify(res?.data ?? res, null, 2));
        } catch (error) {
            setErr(error.response?.data?.message || error.message || 'Tạo book-author thất bại');
        } finally {
            setLoading(false);
        }
    };

    const submitFullBook = async (e) => {
        e?.preventDefault();
        clearStatus();
        setLoading(true);
        try {
            // use adminService.createFullBookItem
            const payload = {
                product: {
                    sku: full.product.sku,
                    slug: full.product.slug,
                    productName: full.product.productName,
                    price: Number(full.product.price),
                    salePrice: full.product.salePrice ? Number(full.product.salePrice) : null,
                    stockQuantity: Number(full.product.stockQuantity || 0),
                    weightG: full.product.weightG ? Number(full.product.weightG) : null,
                    isActive: Boolean(full.product.isActive),
                    featured: Boolean(full.product.featured),
                },
                assets: full.assets.map((a) => ({ ...a })), // AssetRequest-like
                productAssetLinks: full.assetLinks,
                authors: full.authors.map((a) => ({ ...a })),
                bookAuthors: full.bookAuthors,
            };

            const result = await createFullBookItem(payload);
            if (result.success) {
                setMsg('Tạo đầy đủ BookItem thành công: ' + JSON.stringify(result.created, null, 2));
            } else {
                setErr(
                    'Tạo thất bại: ' +
                        (result.error?.message || 'Unknown error') +
                        '\nPartial: ' +
                        JSON.stringify(result.createdPartial || {}, null, 2),
                );
            }
        } catch (error) {
            setErr(error.response?.data?.message || error.message || 'Tạo full book thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className={cx('wrapper')}>
                <h2>Access denied</h2>
                <p>Bạn không có quyền truy cập trang Admin.</p>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <h1>Admin Dashboard</h1>

            <div className={cx('controls')}>
                <div className={cx('tabs')}>
                    <button className={cx({ active: tab === 'product' })} onClick={() => setTab('product')}>
                        Product
                    </button>
                    <button className={cx({ active: tab === 'asset' })} onClick={() => setTab('asset')}>
                        Asset
                    </button>
                    <button className={cx({ active: tab === 'link' })} onClick={() => setTab('link')}>
                        Link
                    </button>
                    <button className={cx({ active: tab === 'author' })} onClick={() => setTab('author')}>
                        Author
                    </button>
                    <button className={cx({ active: tab === 'bookauthor' })} onClick={() => setTab('bookauthor')}>
                        BookAuthor
                    </button>
                    <button className={cx({ active: tab === 'fullbook' })} onClick={() => setTab('fullbook')}>
                        Create Full Book
                    </button>
                </div>

                <div className={cx('panel')}>
                    {tab === 'product' && (
                        <form onSubmit={submitProduct} className={cx('form')}>
                            <label>
                                SKU{' '}
                                <input
                                    name="sku"
                                    value={productForm.sku}
                                    onChange={handleChange(setProductForm)}
                                    required
                                />
                            </label>
                            <label>
                                Slug{' '}
                                <input
                                    name="slug"
                                    value={productForm.slug}
                                    onChange={handleChange(setProductForm)}
                                    required
                                />
                            </label>
                            <label>
                                Product name{' '}
                                <input
                                    name="productName"
                                    value={productForm.productName}
                                    onChange={handleChange(setProductForm)}
                                    required
                                />
                            </label>
                            <label>
                                Price{' '}
                                <input
                                    type="number"
                                    name="price"
                                    value={productForm.price}
                                    onChange={handleChange(setProductForm)}
                                    required
                                />
                            </label>
                            <label>
                                Sale price{' '}
                                <input
                                    type="number"
                                    name="salePrice"
                                    value={productForm.salePrice}
                                    onChange={handleChange(setProductForm)}
                                />
                            </label>
                            <label>
                                Stock{' '}
                                <input
                                    type="number"
                                    name="stockQuantity"
                                    value={productForm.stockQuantity}
                                    onChange={handleChange(setProductForm)}
                                />
                            </label>
                            <label>
                                Weight (g){' '}
                                <input
                                    type="number"
                                    name="weightG"
                                    value={productForm.weightG}
                                    onChange={handleChange(setProductForm)}
                                />
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={productForm.isActive}
                                    onChange={handleChange(setProductForm)}
                                />{' '}
                                Active
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={productForm.featured}
                                    onChange={handleChange(setProductForm)}
                                />{' '}
                                Featured
                            </label>
                            <div className={cx('form-actions')}>
                                <button type="submit" disabled={loading}>
                                    Create Product
                                </button>
                            </div>
                        </form>
                    )}

                    {tab === 'asset' && (
                        <form onSubmit={submitAsset} className={cx('form')}>
                            <label>
                                URL{' '}
                                <input
                                    name="url"
                                    value={assetForm.url}
                                    onChange={handleChange(setAssetForm)}
                                    required
                                />
                            </label>
                            <label>
                                File name{' '}
                                <input
                                    name="fileName"
                                    value={assetForm.fileName}
                                    onChange={handleChange(setAssetForm)}
                                    required
                                />
                            </label>
                            <label>
                                MIME type{' '}
                                <input
                                    name="mimeType"
                                    value={assetForm.mimeType}
                                    onChange={handleChange(setAssetForm)}
                                    required
                                />
                            </label>
                            <label>
                                Type{' '}
                                <select name="type" value={assetForm.type} onChange={handleChange(setAssetForm)}>
                                    <option>IMAGE</option>
                                    <option>VIDEO</option>
                                </select>
                            </label>
                            <label>
                                Width{' '}
                                <input
                                    type="number"
                                    name="width"
                                    value={assetForm.width}
                                    onChange={handleChange(setAssetForm)}
                                />
                            </label>
                            <label>
                                Height{' '}
                                <input
                                    type="number"
                                    name="height"
                                    value={assetForm.height}
                                    onChange={handleChange(setAssetForm)}
                                />
                            </label>
                            <label>
                                Size bytes{' '}
                                <input
                                    type="number"
                                    name="sizeBytes"
                                    value={assetForm.sizeBytes}
                                    onChange={handleChange(setAssetForm)}
                                />
                            </label>
                            <div className={cx('form-actions')}>
                                <button type="submit" disabled={loading}>
                                    Create Asset
                                </button>
                            </div>
                        </form>
                    )}

                    {tab === 'link' && (
                        <form onSubmit={submitLink} className={cx('form')}>
                            <label>
                                Product ID{' '}
                                <input
                                    name="productId"
                                    value={linkForm.productId}
                                    onChange={handleChange(setLinkForm)}
                                    required
                                />
                            </label>
                            <label>
                                Asset ID{' '}
                                <input
                                    name="assetId"
                                    value={linkForm.assetId}
                                    onChange={handleChange(setLinkForm)}
                                    required
                                />
                            </label>
                            <label>
                                Type <input name="type" value={linkForm.type} onChange={handleChange(setLinkForm)} />
                            </label>
                            <label>
                                Ordinal{' '}
                                <input
                                    type="number"
                                    name="ordinal"
                                    value={linkForm.ordinal}
                                    onChange={handleChange(setLinkForm)}
                                />
                            </label>
                            <div className={cx('form-actions')}>
                                <button type="submit" disabled={loading}>
                                    Link Product-Asset
                                </button>
                            </div>
                        </form>
                    )}

                    {tab === 'author' && (
                        <form onSubmit={submitAuthor} className={cx('form')}>
                            <label>
                                Name{' '}
                                <input
                                    name="authorName"
                                    value={authorForm.authorName}
                                    onChange={handleChange(setAuthorForm)}
                                    required
                                />
                            </label>
                            <label>
                                Bio{' '}
                                <textarea name="bio" value={authorForm.bio} onChange={handleChange(setAuthorForm)} />
                            </label>
                            <label>
                                Born date{' '}
                                <input
                                    type="date"
                                    name="bornDate"
                                    value={authorForm.bornDate}
                                    onChange={handleChange(setAuthorForm)}
                                />
                            </label>
                            <label>
                                Death date{' '}
                                <input
                                    type="date"
                                    name="deathDate"
                                    value={authorForm.deathDate}
                                    onChange={handleChange(setAuthorForm)}
                                />
                            </label>
                            <label>
                                Nationality{' '}
                                <input
                                    name="nationality"
                                    value={authorForm.nationality}
                                    onChange={handleChange(setAuthorForm)}
                                />
                            </label>
                            <label>
                                AssetId (avatar){' '}
                                <input
                                    name="assetId"
                                    value={authorForm.assetId || ''}
                                    onChange={handleChange(setAuthorForm)}
                                />
                            </label>
                            <div className={cx('form-actions')}>
                                <button type="submit" disabled={loading}>
                                    Create Author
                                </button>
                            </div>
                        </form>
                    )}

                    {tab === 'bookauthor' && (
                        <form onSubmit={submitBookAuthor} className={cx('form')}>
                            <label>
                                Product ID{' '}
                                <input
                                    name="productId"
                                    value={bookAuthorForm.productId}
                                    onChange={handleChange(setBookAuthorForm)}
                                    required
                                />
                            </label>
                            <label>
                                Author ID{' '}
                                <input
                                    name="authorId"
                                    value={bookAuthorForm.authorId}
                                    onChange={handleChange(setBookAuthorForm)}
                                    required
                                />
                            </label>
                            <label>
                                Author role{' '}
                                <input
                                    name="authorRole"
                                    value={bookAuthorForm.authorRole}
                                    onChange={handleChange(setBookAuthorForm)}
                                />
                            </label>
                            <div className={cx('form-actions')}>
                                <button type="submit" disabled={loading}>
                                    Create BookAuthor
                                </button>
                            </div>
                        </form>
                    )}

                    {tab === 'fullbook' && (
                        <form onSubmit={submitFullBook} className={cx('form fullbook')}>
                            <h3>Product</h3>
                            <label>
                                SKU{' '}
                                <input
                                    name="sku"
                                    value={full.product.sku}
                                    onChange={(e) =>
                                        setFull((p) => ({ ...p, product: { ...p.product, sku: e.target.value } }))
                                    }
                                    required
                                />
                            </label>
                            <label>
                                Slug{' '}
                                <input
                                    name="slug"
                                    value={full.product.slug}
                                    onChange={(e) =>
                                        setFull((p) => ({ ...p, product: { ...p.product, slug: e.target.value } }))
                                    }
                                    required
                                />
                            </label>
                            <label>
                                Product name{' '}
                                <input
                                    name="productName"
                                    value={full.product.productName}
                                    onChange={(e) =>
                                        setFull((p) => ({
                                            ...p,
                                            product: { ...p.product, productName: e.target.value },
                                        }))
                                    }
                                    required
                                />
                            </label>
                            <label>
                                Price{' '}
                                <input
                                    type="number"
                                    name="price"
                                    value={full.product.price}
                                    onChange={(e) =>
                                        setFull((p) => ({ ...p, product: { ...p.product, price: e.target.value } }))
                                    }
                                    required
                                />
                            </label>

                            <h3>Assets (add list)</h3>
                            <div className={cx('list-area')}>
                                {full.assets.map((a, i) => (
                                    <div key={i} className={cx('small-row')}>
                                        <input
                                            placeholder="url"
                                            value={a.url}
                                            onChange={(e) => {
                                                const next = [...full.assets];
                                                next[i] = { ...next[i], url: e.target.value };
                                                setFull((p) => ({ ...p, assets: next }));
                                            }}
                                        />
                                        <input
                                            placeholder="fileName"
                                            value={a.fileName}
                                            onChange={(e) => {
                                                const next = [...full.assets];
                                                next[i] = { ...next[i], fileName: e.target.value };
                                                setFull((p) => ({ ...p, assets: next }));
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFull((p) => ({
                                                    ...p,
                                                    assets: p.assets.filter((_, idx) => idx !== i),
                                                }))
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFull((p) => ({
                                            ...p,
                                            assets: [
                                                ...p.assets,
                                                {
                                                    url: '',
                                                    type: 'IMAGE',
                                                    fileName: '',
                                                    mimeType: 'image/jpeg',
                                                    width: 0,
                                                    height: 0,
                                                    sizeBytes: 0,
                                                },
                                            ],
                                        }))
                                    }
                                >
                                    Add Asset
                                </button>
                            </div>

                            <h3>Authors (add list)</h3>
                            <div className={cx('list-area')}>
                                {full.authors.map((a, i) => (
                                    <div key={i} className={cx('small-row')}>
                                        <input
                                            placeholder="authorName"
                                            value={a.authorName}
                                            onChange={(e) => {
                                                const next = [...full.authors];
                                                next[i] = { ...next[i], authorName: e.target.value };
                                                setFull((p) => ({ ...p, authors: next }));
                                            }}
                                        />
                                        <input
                                            placeholder="nationality"
                                            value={a.nationality}
                                            onChange={(e) => {
                                                const next = [...full.authors];
                                                next[i] = { ...next[i], nationality: e.target.value };
                                                setFull((p) => ({ ...p, authors: next }));
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFull((p) => ({
                                                    ...p,
                                                    authors: p.authors.filter((_, idx) => idx !== i),
                                                }))
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFull((p) => ({
                                            ...p,
                                            authors: [
                                                ...p.authors,
                                                {
                                                    authorName: '',
                                                    bio: '',
                                                    bornDate: null,
                                                    deathDate: null,
                                                    nationality: 'VIETNAMESE',
                                                    assetId: null,
                                                },
                                            ],
                                        }))
                                    }
                                >
                                    Add Author
                                </button>
                            </div>

                            <div className={cx('form-actions')}>
                                <button type="submit" disabled={loading}>
                                    Create Full Book (sequence)
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className={cx('status')}>
                    {loading && <p className={cx('loading')}>Processing...</p>}
                    {msg && <pre className={cx('msg')}>{msg}</pre>}
                    {err && <pre className={cx('err')}>{err}</pre>}
                </div>
            </div>
        </div>
    );
}

export default Admin;
