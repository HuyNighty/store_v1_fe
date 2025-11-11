// PixelTransition.jsx (fixed: always queue leave so quick hover-out works)
import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import classNames from 'classnames/bind';
import styles from './PixelTransition.module.scss';

const cx = classNames.bind(styles);

function PixelTransition({
    firstContent,
    secondContent,
    gridSize = 7,
    pixelColor = 'currentColor',
    animationStepDuration = 0.3, // total duration for one full swap (cover+reveal)
    once = false,
    aspectRatio = '100%',
    className = '',
    style = {},
}) {
    const containerRef = useRef(null);
    const pixelGridRef = useRef(null);
    const activeRef = useRef(null);
    const defaultRef = useRef(null);
    const tlRef = useRef(null);

    const pendingActionRef = useRef(null);
    const currentActionRef = useRef(null);

    const [isActive, setIsActive] = useState(false);

    const isTouchDevice =
        typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);

    useEffect(() => {
        const pixelGridEl = pixelGridRef.current;
        if (!pixelGridEl) return;

        pixelGridEl.innerHTML = '';
        if (tlRef.current) {
            tlRef.current.kill();
            tlRef.current = null;
        }

        const size = 100 / gridSize;
        const pixelClass = cx('pixelated-image-card__pixel');

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const pixel = document.createElement('div');
                pixel.className = pixelClass;
                pixel.style.backgroundColor = pixelColor;
                pixel.style.width = `${size}%`;
                pixel.style.height = `${size}%`;
                pixel.style.left = `${col * size}%`;
                pixel.style.top = `${row * size}%`;
                pixel.style.opacity = '0';
                pixel.style.transform = 'scale(0.6)';
                pixelGridEl.appendChild(pixel);
            }
        }

        if (defaultRef.current) {
            defaultRef.current.style.display = '';
            defaultRef.current.setAttribute('aria-hidden', String(isActive));
        }
        if (activeRef.current) {
            activeRef.current.style.display = isActive ? '' : 'none';
            activeRef.current.setAttribute('aria-hidden', String(!isActive));
            activeRef.current.style.pointerEvents = isActive ? '' : 'none';
        }
    }, [gridSize, pixelColor]); // eslint-disable-line

    useEffect(() => {
        return () => {
            if (tlRef.current) {
                tlRef.current.kill();
                tlRef.current = null;
            }
            // clear pending to avoid stray callbacks
            pendingActionRef.current = null;
            currentActionRef.current = null;
        };
    }, []);

    const animatePixels = (activate) => {
        const pixelGridEl = pixelGridRef.current;
        const activeEl = activeRef.current;
        const defaultEl = defaultRef.current;
        if (!pixelGridEl || !activeEl || !defaultEl) return;

        const action = activate ? 'enter' : 'leave';

        if (currentActionRef.current === action) return;
        if (pendingActionRef.current === action) return;

        if (tlRef.current && tlRef.current.isActive()) {
            // queue opposite/next action, wait until current finishes
            pendingActionRef.current = action;
            return;
        }

        if (tlRef.current && !tlRef.current.isActive()) {
            tlRef.current.kill();
            tlRef.current = null;
        }

        currentActionRef.current = action;
        pendingActionRef.current = null;

        const pixels = Array.from(pixelGridEl.children);
        const total = pixels.length || 1;

        // NEW TIMING LOGIC:
        const totalDuration = Math.max(0.03, animationStepDuration);
        const phaseDuration = totalDuration / 2;

        const perPixelDur = Math.max(0.01, Math.min(phaseDuration * 0.4, 0.18));
        const maxStaggerTotal = Math.max(0, phaseDuration - perPixelDur);
        const staggerEach = total > 1 ? Math.max(0.0005, maxStaggerTotal / (total - 1)) : 0;

        gsap.set(pixels, { display: 'block' });

        const tl = gsap.timeline({
            onComplete: () => {
                gsap.set(pixels, { opacity: 0, display: 'none' });
                currentActionRef.current = null;
                const pending = pendingActionRef.current;
                pendingActionRef.current = null;
                tlRef.current = null;
                if (pending) {
                    requestAnimationFrame(() => {
                        animatePixels(pending === 'enter');
                    });
                }
            },
        });

        if (action === 'enter') {
            tl.to(pixels, {
                opacity: 1,
                scale: 1,
                transformOrigin: '50% 50%',
                duration: perPixelDur,
                stagger: { each: staggerEach, from: 'random' },
            });

            tl.add(() => {
                defaultEl.style.display = 'none';
                defaultEl.setAttribute('aria-hidden', 'true');

                activeEl.style.display = '';
                activeEl.setAttribute('aria-hidden', 'false');
                activeEl.style.pointerEvents = '';
                setIsActive(true);
            }, '>-0.01');

            tl.to(
                pixels,
                {
                    opacity: 0,
                    scale: 0.6,
                    duration: perPixelDur,
                    stagger: { each: staggerEach, from: 'random' },
                },
                '>',
            );
        } else {
            tl.to(pixels, {
                opacity: 1,
                scale: 1,
                transformOrigin: '50% 50%',
                duration: perPixelDur,
                stagger: { each: staggerEach, from: 'random' },
            });

            tl.add(() => {
                activeEl.style.display = 'none';
                activeEl.setAttribute('aria-hidden', 'true');
                activeEl.style.pointerEvents = 'none';

                defaultEl.style.display = '';
                defaultEl.setAttribute('aria-hidden', 'false');
                setIsActive(false);
            }, '>-0.01');

            tl.to(
                pixels,
                {
                    opacity: 0,
                    scale: 0.6,
                    duration: perPixelDur,
                    stagger: { each: staggerEach, from: 'random' },
                },
                '>',
            );
        }

        tlRef.current = tl;
    };

    const handleEnter = () => {
        // still safe to ignore if already active
        if (currentActionRef.current === 'enter' || pendingActionRef.current === 'enter') return;
        animatePixels(true);
    };

    // <-- FIXED: always request leave (don't rely on isActive)
    const handleLeave = () => {
        if (once) return;
        // always attempt to perform/queue leave; animatePixels will handle duplicates/queueing
        animatePixels(false);
    };

    const handleClick = () => {
        if (!isActive) animatePixels(true);
        else if (isActive && !once) animatePixels(false);
    };

    return (
        <div
            ref={containerRef}
            className={`${cx('pixelated-image-card')} ${className}`}
            style={{ ...style, position: 'relative' }}
            onMouseEnter={!isTouchDevice ? handleEnter : undefined}
            onMouseLeave={!isTouchDevice ? handleLeave : undefined}
            onClick={isTouchDevice ? handleClick : undefined}
            onFocus={!isTouchDevice ? handleEnter : undefined}
            onBlur={!isTouchDevice ? handleLeave : undefined}
            tabIndex={0}
        >
            {aspectRatio ? <div style={{ paddingTop: aspectRatio, pointerEvents: 'none' }} /> : null}

            <div
                ref={defaultRef}
                className={cx('pixelated-image-card__default')}
                aria-hidden={isActive}
                style={{ position: 'absolute', inset: 0 }}
            >
                {firstContent}
            </div>

            <div
                ref={activeRef}
                className={cx('pixelated-image-card__active')}
                aria-hidden={!isActive}
                style={{ position: 'absolute', inset: 0, display: 'none', pointerEvents: 'none' }}
            >
                {secondContent}
            </div>

            <div
                className={cx('pixelated-image-card__pixels')}
                ref={pixelGridRef}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            />
        </div>
    );
}

export default PixelTransition;
