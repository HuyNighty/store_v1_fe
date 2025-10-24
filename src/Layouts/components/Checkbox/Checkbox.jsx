import React from 'react';
import classNames from 'classnames/bind';
import styles from './Checkbox.module.scss';

const cx = classNames.bind(styles);

function Checkbox({
    id,
    name,
    label,
    checked = false,
    onChange,
    disabled = false,
    size = 'medium', // 'small' | 'medium' | 'large'
    variant = 'default', // 'default' | 'primary' | 'success' | 'warning' | 'danger'
    className,
    ...passProps
}) {
    const handleChange = (e) => {
        if (!disabled && onChange) {
            onChange(e);
        }
    };

    const classes = cx(
        'checkbox',
        {
            [size]: size,
            [variant]: variant,
            disabled: disabled,
        },
        className,
    );

    return (
        <label className={classes} htmlFor={id ?? name}>
            <input
                id={id ?? name}
                type="checkbox"
                name={name}
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
                {...passProps}
            />
            <span className={cx('checkmark')}></span>
            {label && <span className={cx('label')}>{label}</span>}
        </label>
    );
}

export default Checkbox;
