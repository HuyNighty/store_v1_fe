import classNames from 'classnames/bind';
import styles from './Button.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function Button({ to, href, primary, outline, onClick, children, text, width, height, ...passProps }) {
    let Comp = 'button';

    const props = {
        onClick,
        ...passProps,
    };

    if (to) {
        props.to = to;
        Comp = Link;
    } else if (href) {
        props.href = href;
        Comp = 'a';
    }

    const classes = cx('wrapper', {
        primary,
        outline,
    });

    const style = {
        fontSize: text ? `${text}rem` : undefined,
        width: width ? `${width}${typeof width === 'number' ? 'rem' : ''}` : undefined,
        height: height ? `${height}${typeof height === 'number' ? 'rem' : ''}` : undefined,
    };

    return (
        <Comp className={classes} style={style} {...props}>
            <span>{children}</span>
        </Comp>
    );
}

export default Button;
