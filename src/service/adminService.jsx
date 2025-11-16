import adminApi from '../api/adminApi';

/**
 * Helper: lấy id từ response. Backend có thể trả { data: {...} } hoặc { data: { result: {...} } } etc.
 */
function extractId(resp) {
    if (!resp) return null;
    const d = resp.data ?? resp;
    const candidate = d.result ?? d;

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
    productAssetLinks = [],
    authors = [],
    bookAuthors = [],
}) {
    const created = {
        productId: null,
        assetIds: [],
        productAssetLinkIds: [],
        authorIds: [],
        bookAuthorIds: [],
    };

    try {
        const rProd = await adminApi.createProduct(product);
        const productId = extractId(rProd);
        if (!productId) throw new Error('Create product did not return id');
        created.productId = productId;

        for (let i = 0; i < assets.length; i++) {
            const aReq = assets[i];
            const rAsset = await adminApi.createAsset(aReq);
            const assetId = extractId(rAsset);
            if (!assetId) throw new Error('Create asset did not return id');
            created.assetIds.push(assetId);

            const linkPayload = {
                productId,
                assetId,
                type: (productAssetLinks[i] && productAssetLinks[i].type) || 'COVER',
                ordinal: (productAssetLinks[i] && productAssetLinks[i].ordinal) ?? i,
            };

            const rLink = await adminApi.createProductAssetLink(linkPayload);
            const linkId = extractId(rLink);
            created.productAssetLinkIds.push(linkId ?? null);
        }

        for (let i = 0; i < authors.length; i++) {
            const authorReq = authors[i];

            const rAuthor = await adminApi.createAuthor(authorReq);
            const authorId = extractId(rAuthor);
            if (!authorId) throw new Error('Create author did not return id');
            created.authorIds.push(authorId);
        }

        for (let i = 0; i < (bookAuthors.length || authors.length); i++) {
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

        return { success: true, created };
    } catch (err) {
        console.error('createFullBookItem failed:', err);

        for (const baId of created.bookAuthorIds.filter(Boolean)) {
            try {
                await adminApi.deleteBookAuthor(baId);
            } catch (e) {
                /* ignore */
            }
        }

        for (const aId of created.authorIds.filter(Boolean)) {
            try {
                await adminApi.deleteAuthor(aId);
            } catch (e) {
                /* ignore */
            }
        }

        for (const linkId of created.productAssetLinkIds.filter(Boolean)) {
            try {
                await adminApi.deleteProductAssetLink(linkId);
            } catch (e) {
                /* ignore */
            }
        }

        for (const assetId of created.assetIds.filter(Boolean)) {
            try {
                await adminApi.deleteAsset(assetId);
            } catch (e) {
                /* ignore */
            }
        }

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
