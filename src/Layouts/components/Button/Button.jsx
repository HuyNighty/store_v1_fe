// Button.js
import classNames from 'classnames/bind';
import styles from './Button.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function Button({
    to,
    href,
    primary,
    outline,
    secondary,
    danger,
    success,
    warning,
    info,
    back,
    home,
    small,
    large,
    disabled,
    onClick,
    children,
    text,
    width,
    height,
    className,
    // Animation props
    pulse,
    bounce,
    shine,
    float,
    scale,
    glow,
    ripple,
    slide,
    borderDraw,
    lift3d,
    magnetic,
    ...passProps
}) {
    let Comp = 'button';

    const props = {
        onClick,
        ...passProps,
    };

    // Remove event listeners when button is disabled
    if (disabled) {
        Object.keys(props).forEach((key) => {
            if (key.startsWith('on') && typeof props[key] === 'function') {
                delete props[key];
            }
        });
    }

    if (to) {
        props.to = to;
        Comp = Link;
    } else if (href) {
        props.href = href;
        Comp = 'a';
    }

    const classes = cx(
        'wrapper',
        {
            primary,
            outline,
            secondary,
            danger,
            success,
            warning,
            info,
            back,
            home,
            small,
            large,
            disabled,
            // Animation classes
            pulse,
            bounce,
            shine,
            float,
            scale,
            glow,
            ripple,
            slide,
            borderDraw,
            lift3d,
            magnetic,
        },
        className,
    );

    const style = {
        fontSize: text ? `${text}rem` : undefined,
        width: width ? `${width}${typeof width === 'number' ? 'rem' : ''}` : undefined,
        height: height ? `${height}${typeof height === 'number' ? 'rem' : ''}` : undefined,
    };

    return (
        <Comp className={classes} style={style} {...props}>
            {magnetic ? <span className={cx('magnetic-content')}>{children}</span> : <span>{children}</span>}
        </Comp>
    );
}

export default Button;
