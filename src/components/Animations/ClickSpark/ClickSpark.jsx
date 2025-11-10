// ClickSpark.jsx
import React, { useRef, useEffect, useCallback } from 'react';

const ClickSpark = ({
    sparkColor = '#fff',
    sparkSize = 10,
    sparkRadius = 15,
    sparkCount = 8,
    duration = 400,
    easing = 'ease-out',
    extraScale = 1.0,
    children,
    debug = false, // bật log khi cần
}) => {
    const canvasRef = useRef(null);
    const sparksRef = useRef([]);
    const rafRef = useRef(null);
    const parentRef = useRef(null);

    // Resize + DPR aware
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        parentRef.current = parent;

        let resizeObserver;
        const resize = () => {
            const rect = parent.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const w = Math.round(rect.width);
            const h = Math.round(rect.height);
            if (!w || !h) return;
            // set CSS size
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            // set backing store for DPR
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            const ctx = canvas.getContext('2d');
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (debug) console.log('[ClickSpark] resized', w, h, 'dpr', dpr);
        };

        resize();
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(parent);

        // also handle window resize
        window.addEventListener('resize', resize);

        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            window.removeEventListener('resize', resize);
        };
    }, [debug]);

    const easeFunc = useCallback(
        (t) => {
            switch (easing) {
                case 'linear':
                    return t;
                case 'ease-in':
                    return t * t;
                case 'ease-in-out':
                    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                default:
                    // ease-out quadratic
                    return t * (2 - t);
            }
        },
        [easing],
    );

    // draw loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let lastTime = null;

        const draw = (time) => {
            if (!lastTime) lastTime = time;
            const delta = time - lastTime;
            lastTime = time;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const now = performance.now();
            sparksRef.current = sparksRef.current.filter((s) => {
                const elapsed = now - s.startTime;
                if (elapsed >= duration) return false;

                const progress = Math.min(1, elapsed / duration);
                const eased = easeFunc(progress);
                const distance = eased * s.radius * extraScale;
                const lineLength = s.size * (1 - eased);

                const x1 = s.x + distance * Math.cos(s.angle);
                const y1 = s.y + distance * Math.sin(s.angle);
                const x2 = s.x + (distance + lineLength) * Math.cos(s.angle);
                const y2 = s.y + (distance + lineLength) * Math.sin(s.angle);

                ctx.strokeStyle = s.color;
                ctx.lineWidth = Math.max(1, s.size * 0.12);
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                return true;
            });

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [duration, easeFunc, extraScale]);

    // add sparks
    const pushSparks = useCallback(
        (x, y) => {
            const now = performance.now();
            const newSparks = Array.from({ length: sparkCount }).map((_, i) => ({
                x,
                y,
                angle: (2 * Math.PI * i) / sparkCount + (Math.random() - 0.5) * 0.2, // small random offset
                startTime: now,
                radius: sparkRadius * (0.9 + Math.random() * 0.3),
                size: sparkSize * (0.7 + Math.random() * 0.6),
                color: sparkColor,
            }));
            sparksRef.current.push(...newSparks);
            if (debug) console.log('[ClickSpark] add', newSparks.length, 'sparks at', x, y);
        },
        [sparkCount, sparkRadius, sparkSize, sparkColor, debug],
    );

    // robust event handler: use pointerdown capture so we catch before children that might stop propagation
    useEffect(() => {
        const parent = parentRef.current;
        if (!parent) return;
        const handler = (ev) => {
            // compute relative coordinates to parent
            const rect = parent.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            const y = ev.clientY - rect.top;

            // if parent size is zero -> ignore
            if (rect.width === 0 || rect.height === 0) {
                if (debug) console.warn('[ClickSpark] parent rect is zero, ignore click');
                return;
            }

            pushSparks(x, y);
        };

        // pointerdown captures mouse + touch
        parent.addEventListener('pointerdown', handler, { capture: true, passive: true });

        return () => {
            parent.removeEventListener('pointerdown', handler, { capture: true });
        };
    }, [pushSparks, debug]);

    // render
    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    userSelect: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none', // canvas shouldn't block clicks
                    zIndex: 9999,
                }}
            />
            {children}
        </div>
    );
};

export default ClickSpark;
