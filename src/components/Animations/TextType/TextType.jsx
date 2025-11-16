'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback, forwardRef } from 'react';
import { gsap } from 'gsap';

import classNames from 'classnames/bind';
import styles from './TextType.module.scss';

const cx = classNames.bind(styles);

const TextType = forwardRef(
    (
        {
            text,
            as: Component = 'div',
            typingSpeed = 50,
            initialDelay = 0,
            pauseDuration = 2000,
            deletingSpeed = 30,
            loop = true,
            className = '',
            showCursor = true,
            hideCursorWhileTyping = false,
            cursorCharacter = '|',
            cursorClassName = '',
            cursorBlinkDuration = 0.5,
            textColors = [],
            variableSpeed,
            onSentenceComplete,
            startOnVisible = false,
            reverseMode = false,
            loopCount = Infinity,
            ...props
        },
        forwardedRef,
    ) => {
        const [displayedText, setDisplayedText] = useState('');
        const [currentCharIndex, setCurrentCharIndex] = useState(0);
        const [isDeleting, setIsDeleting] = useState(false);
        const [currentTextIndex, setCurrentTextIndex] = useState(0);
        const [isVisible, setIsVisible] = useState(!startOnVisible);
        const [completedLoops, setCompletedLoops] = useState(0);

        const internalRef = useRef(null);
        const cursorRef = useRef(null);
        const containerRef = internalRef;

        useEffect(() => {
            if (!forwardedRef) return;
            if (typeof forwardedRef === 'function') forwardedRef(internalRef.current);
            else forwardedRef.current = internalRef.current;
        }, [forwardedRef]);

        const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

        const getRandomSpeed = useCallback(() => {
            if (!variableSpeed) return typingSpeed;
            const { min = 20, max = typingSpeed } = variableSpeed;
            return Math.random() * (max - min) + min;
        }, [variableSpeed, typingSpeed]);

        const getCurrentTextColor = () => {
            if (textColors.length === 0) return undefined;
            return textColors[currentTextIndex % textColors.length];
        };

        useEffect(() => {
            if (!startOnVisible || !containerRef.current) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setIsVisible(true);
                            observer.disconnect();
                        }
                    });
                },
                { threshold: 0.1 },
            );

            observer.observe(containerRef.current);
            return () => observer.disconnect();
        }, [startOnVisible, containerRef]);

        useEffect(() => {
            if (showCursor && cursorRef.current) {
                gsap.set(cursorRef.current, { opacity: 1 });
                const anim = gsap.to(cursorRef.current, {
                    opacity: 0,
                    duration: Math.max(0.1, cursorBlinkDuration),
                    repeat: -1,
                    yoyo: true,
                    ease: 'power2.inOut',
                });
                return () => anim.kill();
            }
        }, [showCursor, cursorBlinkDuration]);

        useEffect(() => {
            if (!isVisible) return;

            let timeout;
            const currentText = textArray[currentTextIndex] ?? '';
            const processedText = reverseMode ? currentText.split('').reverse().join('') : currentText;

            const fullTyped = displayedText === processedText;

            if (!loop && currentTextIndex === textArray.length - 1 && fullTyped && !isDeleting) {
                if (onSentenceComplete) onSentenceComplete(currentText, currentTextIndex);
                return;
            }

            const executeTypingAnimation = () => {
                if (isDeleting) {
                    if (displayedText.length === 0) {
                        setIsDeleting(false);
                        setCurrentCharIndex(0);

                        const nextIndex = currentTextIndex + 1;
                        if (nextIndex >= textArray.length) {
                            setCompletedLoops((c) => c + 1);
                            if (completedLoops + 1 >= loopCount) {
                                return;
                            }
                        }
                        setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
                        timeout = setTimeout(() => {}, 0);
                    } else {
                        timeout = setTimeout(() => {
                            setDisplayedText((prev) => prev.slice(0, -1));
                        }, deletingSpeed);
                    }
                } else {
                    if (currentCharIndex < processedText.length) {
                        timeout = setTimeout(
                            () => {
                                setDisplayedText((prev) => prev + processedText[currentCharIndex]);
                                setCurrentCharIndex((prev) => prev + 1);
                            },
                            variableSpeed ? getRandomSpeed() : typingSpeed,
                        );
                    } else {
                        if (onSentenceComplete) onSentenceComplete(currentText, currentTextIndex);

                        if (!loop && textArray.length === 1) {
                            return;
                        }

                        if (!loop && currentTextIndex === textArray.length - 1) {
                            return;
                        }

                        timeout = setTimeout(() => {
                            setIsDeleting(true);
                        }, pauseDuration);
                    }
                }
            };

            if (currentCharIndex === 0 && displayedText === '' && !isDeleting && initialDelay > 0) {
                timeout = setTimeout(executeTypingAnimation, initialDelay);
            } else {
                executeTypingAnimation();
            }

            return () => clearTimeout(timeout);
        }, [
            currentCharIndex,
            displayedText,
            isDeleting,
            typingSpeed,
            deletingSpeed,
            pauseDuration,
            textArray,
            currentTextIndex,
            loop,
            initialDelay,
            isVisible,
            reverseMode,
            variableSpeed,
            onSentenceComplete,
            loopCount,
            completedLoops,
            getRandomSpeed,
        ]);

        const shouldHideCursor =
            hideCursorWhileTyping && (displayedText.length < (textArray[currentTextIndex] ?? '').length || isDeleting);

        return React.createElement(
            Component,
            {
                ref: internalRef,
                className: `text-type ${className}`,
                ...props,
            },
            <span className={cx('text-type__content')} style={{ color: getCurrentTextColor() || 'inherit' }}>
                {displayedText}
            </span>,
            showCursor && (
                <span
                    ref={cursorRef}
                    className={cx(
                        `text-type__cursor ${cursorClassName} ${shouldHideCursor ? 'text-type__cursor--hidden' : ''}`,
                    )}
                    aria-hidden="true"
                >
                    {cursorCharacter}
                </span>
            ),
        );
    },
);

export default TextType;
