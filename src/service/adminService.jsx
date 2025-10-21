// src/services/adminService.js
import adminApi from '../api/adminApi';

/**
 * Helper: lấy id từ response. Backend có thể trả { data: {...} } hoặc { data: { result: {...} } } etc.
 */
function extractId(resp) {
    if (!resp) return null;
    const d = resp.data ?? resp;
    const candidate = d.result ?? d;
    // try common fields
    return (
        candidate?.id ??
        candidate?.assetId ??
        candidate?.productId ??
        candidate?.authorId ??
        candidate?.bookAuthorId ??
        null
    );
}

/**
 * createFullBookItem: thực hiện toàn bộ flow tạo 1 "book item"
 *
 * @param {object} options
 *   - product: ProductRequest-like object
 *   - assets: array of AssetRequest-like objects (can be empty)
 *   - productAssetLinks: optional array of { type, ordinal, role } mapping per created asset
 *   - authors: array of AuthorRequest-like objects (can be empty)
 *   - bookAuthors: optional array of BookAuthorRequest-like info (position, authorRole) mapping authors to product
 *
 * Trả về object { productId, assetIds: [], linkIds: [], authorIds: [], bookAuthorIds: [] }
 *
 * Nếu step fail, sẽ cố rollback các resource đã tạo (best-effort).
 */
export async function createFullBookItem({
    product,
    assets = [],
    productAssetLinks = [], // optional mapping for each asset: { type: 'COVER'|'GALLERY', ordinal: 0 }
    authors = [],
    bookAuthors = [], // optional mapping for each author: { authorRole: 'PRIMARY'|'COAUTHOR', position: 1 }
}) {
    const created = {
        productId: null,
        assetIds: [],
        productAssetLinkIds: [],
        authorIds: [],
        bookAuthorIds: [],
    };

    try {
        // 1) create product
        const rProd = await adminApi.createProduct(product);
        const productId = extractId(rProd);
        if (!productId) throw new Error('Create product did not return id');
        created.productId = productId;

        // 2) create assets (sequential or parallel)
        for (let i = 0; i < assets.length; i++) {
            const aReq = assets[i];
            const rAsset = await adminApi.createAsset(aReq);
            const assetId = extractId(rAsset);
            if (!assetId) throw new Error('Create asset did not return id');
            created.assetIds.push(assetId);

            // 3) link product <-> asset if mapping provided or auto link as COVER/GALLERY
            const linkPayload = {
                productId,
                assetId,
                type: (productAssetLinks[i] && productAssetLinks[i].type) || 'COVER', // fallback
                ordinal: (productAssetLinks[i] && productAssetLinks[i].ordinal) ?? i,
            };

            // if backend expects same endpoint, adjust createProductAssetLink accordingly
            const rLink = await adminApi.createProductAssetLink(linkPayload);
            const linkId = extractId(rLink);
            created.productAssetLinkIds.push(linkId ?? null);
        }

        // 4) create authors
        for (let i = 0; i < authors.length; i++) {
            const authorReq = authors[i];
            // ensure authorReq.assetId exists if required (avatar)
            const rAuthor = await adminApi.createAuthor(authorReq);
            const authorId = extractId(rAuthor);
            if (!authorId) throw new Error('Create author did not return id');
            created.authorIds.push(authorId);
        }

        // 5) create book-author associations
        for (let i = 0; i < (bookAuthors.length || authors.length); i++) {
            // allow bookAuthors entries or default mapping: authorIds[i]
            const authorId = (bookAuthors[i] && bookAuthors[i].authorId) ?? created.authorIds[i];
            if (!authorId) continue;
            const payload = {
                productId,
                authorId,
                authorRole: (bookAuthors[i] && bookAuthors[i].authorRole) || 'PRIMARY',
            };
            const rBA = await adminApi.createBookAuthor(payload);
            const baId = extractId(rBA);
            created.bookAuthorIds.push(baId ?? null);
        }

        // success
        return { success: true, created };
    } catch (err) {
        // rollback best-effort
        console.error('createFullBookItem failed:', err);

        // delete book-author links
        for (const baId of created.bookAuthorIds.filter(Boolean)) {
            try {
                await adminApi.deleteBookAuthor(baId);
            } catch (e) {
                /* ignore */
            }
        }

        // delete authors
        for (const aId of created.authorIds.filter(Boolean)) {
            try {
                await adminApi.deleteAuthor(aId);
            } catch (e) {
                /* ignore */
            }
        }

        // delete product-asset links
        for (const linkId of created.productAssetLinkIds.filter(Boolean)) {
            try {
                await adminApi.deleteProductAssetLink(linkId);
            } catch (e) {
                /* ignore */
            }
        }

        // delete assets
        for (const assetId of created.assetIds.filter(Boolean)) {
            try {
                await adminApi.deleteAsset(assetId);
            } catch (e) {
                /* ignore */
            }
        }

        // delete product
        if (created.productId) {
            try {
                await adminApi.deleteProduct(created.productId);
            } catch (e) {
                /* ignore */
            }
        }

        return { success: false, error: err, createdPartial: created };
    }
}
