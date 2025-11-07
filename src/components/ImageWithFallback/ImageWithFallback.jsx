import React, { useState, useEffect } from 'react';

function ImageWithFallback({
    src,
    alt = '',
    className = '',
    fallback = '/images/default-book.jpg',
    style,
    onLoad,
    ...rest
}) {
    const [imgSrc, setImgSrc] = useState(src || fallback);
    const [errored, setErrored] = useState(false);

    useEffect(() => {
        setErrored(false);
        setImgSrc(src || fallback);
    }, [src, fallback]);

    const handleError = (e) => {
        if (!errored) {
            setErrored(true);
            setImgSrc(fallback);
        }
        // optional: nếu cần log
        // console.warn('Image load error:', src);
        if (rest.onError) rest.onError(e);
    };

    const handleLoad = (e) => {
        if (onLoad) onLoad(e);
    };

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            style={style}
            loading="lazy"
            onError={handleError}
            onLoad={handleLoad}
            {...rest}
        />
    );
}

export default ImageWithFallback;
