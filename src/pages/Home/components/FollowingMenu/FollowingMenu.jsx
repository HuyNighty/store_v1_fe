import React from 'react';
import { gsap } from 'gsap';
import classNames from 'classnames/bind';
import styles from './FollowingMenu.module.scss';

const cx = classNames.bind(styles);

function FlowingMenu({ title = '', image = null, link = '#' }) {
    const itemRef = React.useRef(null);
    const marqueeRef = React.useRef(null);
    const marqueeInnerRef = React.useRef(null);
    const tlRef = React.useRef(null);
    const animationDefaults = { duration: 0.6, ease: 'expo' };

    const distMetric = (x, y, x2, y2) => {
        const xd = x - x2;
        const yd = y - y2;
        return xd * xd + yd * yd;
    };

    const findClosestEdge = (mouseX, mouseY, width, height) => {
        const top = distMetric(mouseX, mouseY, width / 2, 0);
        const bottom = distMetric(mouseX, mouseY, width / 2, height);
        return top < bottom ? 'top' : 'bottom';
    };

    const startAnim = (edge) => {
        if (!marqueeRef.current || !marqueeInnerRef.current) return;

        gsap.killTweensOf([marqueeRef.current, marqueeInnerRef.current]);
        tlRef.current = gsap
            .timeline({ defaults: animationDefaults })
            .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
            .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' })
            .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' });
    };

    const hideAnim = (edge) => {
        if (!marqueeRef.current || !marqueeInnerRef.current) return;
        gsap.killTweensOf([marqueeRef.current, marqueeInnerRef.current]);
        tlRef.current = gsap
            .timeline({ defaults: animationDefaults })
            .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
            .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
    };

    const handleMouseEnter = (ev) => {
        if (!itemRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        startAnim(findClosestEdge(x, y, rect.width, rect.height));
    };

    const handleMouseLeave = (ev) => {
        if (!itemRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        hideAnim(findClosestEdge(x, y, rect.width, rect.height));
    };

    const repeatedMarqueeContent = Array.from({ length: 4 }).map((_, i) => (
        <React.Fragment key={i}>
            <span>{title}</span>
            {image && (
                <div className={cx('marquee__img')} style={{ backgroundImage: `url(${image})` }} aria-hidden="true" />
            )}
        </React.Fragment>
    ));

    return (
        <div className={cx('menu-wrap')}>
            <nav className={cx('menu')}>
                <div
                    className={cx('menu__item')}
                    ref={itemRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <a className={cx('menu__item-link')} aria-label={title}>
                        {title}
                    </a>

                    <div className={cx('marquee')} ref={marqueeRef} aria-hidden="true">
                        <div className={cx('marquee__inner-wrap')} ref={marqueeInnerRef}>
                            <div className={cx('marquee__inner')} aria-hidden="true">
                                {repeatedMarqueeContent}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default FlowingMenu;
