import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Input.module.scss';

const cx = classNames.bind(styles);

export default function Input({
    id,
    name,
    value,
    defaultValue,
    checked, // support controlled checkbox
    onChange,
    type = 'text',
    placeholder = '',
    label = '',
    labelPosition = 'right', // 'right' (default) or 'left' for checkboxes
    error = '',
    disabled = false,
    required = false,
    clearable = false,
    showPasswordToggle = false,
    iconLeft = null,
    iconRight = null,
    textarea = false,
    rows = 3,
    onEnter,
    debounce = 0,
    className,
    width,
    height,
    style = {},
    autoFocus = false,
    pattern,
    maxLength,
    // Variant props (same idea as Button)
    primary,
    outline,
    secondary,
    danger,
    success,
    warning,
    info,
    small,
    large,
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
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue ?? '');
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef(null);
    const debRef = useRef(null);

    const errorId = id || name ? `${id || name}-error` : undefined;

    useEffect(() => {
        if (isControlled) setInternal(value);
    }, [value, isControlled]);

    useEffect(() => {
        if (autoFocus && inputRef.current) inputRef.current.focus();
    }, [autoFocus]);

    // Generic emit — for consistency with existing handlers: emit { target: { name, value } }
    const emitChange = (val, ev) => {
        if (typeof onChange === 'function') onChange({ target: { name, value: val } }, ev);
    };

    // Text-like change (debounce)
    const handleChange = (ev) => {
        const val = ev?.target?.value;
        if (!isControlled) setInternal(val);

        if (debounce > 0) {
            if (debRef.current) clearTimeout(debRef.current);
            debRef.current = setTimeout(() => emitChange(val, ev), debounce);
        } else {
            emitChange(val, ev);
        }
    };

    const handleKeyDown = (ev) => {
        if (ev.key === 'Enter' && typeof onEnter === 'function') onEnter(ev);
    };

    const handleClear = (ev) => {
        ev && ev.preventDefault();
        if (!isControlled) setInternal('');
        emitChange('', ev);
        if (inputRef.current) inputRef.current.focus();
    };

    // --- Checkbox handling ---
    const isCheckbox = type === 'checkbox';
    const isRadio = type === 'radio';

    const checkboxChecked = (() => {
        // priority: explicit checked prop (controlled checkbox) -> value if boolean -> fallback false
        if (typeof checked === 'boolean') return checked;
        if (typeof value === 'boolean') return value;
        return false;
    })();

    const handleCheckboxToggle = (ev) => {
        if (disabled) return;
        const newChecked = ev?.target?.checked ?? !checkboxChecked;
        // emit boolean
        emitChange(newChecked, ev);
        // if uncontrolled and using checked prop not provided, allow internal state change via value
        if (!isControlled && typeof value !== 'boolean') {
            setInternal(newChecked);
        }
    };

    // finalize type for text/password
    const finalType = type === 'password' && showPassword ? 'text' : type;
    const displayedValue = isControlled ? value : internal;

    // class composition including variants and animations
    const classes = cx(
        'root',
        {
            disabled,
            focused,
            error: !!error,
            'with-left': !!iconLeft,
            'with-right': !!(iconRight || clearable || (type === 'password' && showPasswordToggle)),
            textarea,
            // variants
            primary,
            outline,
            secondary,
            danger,
            success,
            warning,
            info,
            small,
            large,
            // animations
            pulse,
            bounce,
            float,
            scale,
            glow,
            ripple,
            slide,
            borderDraw,
            lift3d,
            magnetic,
            // checkbox/radio state classes
            checkbox: isCheckbox,
            radio: isRadio,
        },
        className,
    );

    const inlineStyle = {
        width: width ? (typeof width === 'number' ? `${width}rem` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}rem` : height) : undefined,
        ...style,
    };

    const inputProps = {
        id,
        name,
        ref: inputRef,
        value: isCheckbox || isRadio ? undefined : displayedValue ?? '',
        placeholder,
        disabled,
        required,
        onChange: isCheckbox || isRadio ? handleCheckboxToggle : handleChange,
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
        onKeyDown: handleKeyDown,
        pattern,
        maxLength,
        'aria-invalid': !!error,
        'aria-required': required || undefined,
        'aria-describedby': error ? errorId : undefined,
        ...passProps,
    };

    if (isCheckbox || isRadio) {
        return (
            <div className={classes} style={inlineStyle}>
                <label
                    htmlFor={id}
                    className={cx('checkbox-label-wrapper', {
                        leftLabel: label && (passProps.labelPosition === 'left' || passProps.labelPosition === 'left'),
                    })}
                >
                    <span className={cx('checkbox-control')} aria-hidden="true">
                        <input
                            id={id}
                            name={name}
                            type={isCheckbox ? 'checkbox' : 'radio'}
                            checked={checkboxChecked}
                            disabled={disabled}
                            onChange={handleCheckboxToggle}
                            aria-checked={checkboxChecked}
                            aria-required={required || undefined}
                            className={cx('native-input')}
                            {...passProps}
                        />
                        <span className={cx('checkbox-faux')} />
                    </span>

                    {label && <span className={cx('checkbox-text')}>{label}</span>}
                </label>

                {error ? (
                    <p id={errorId} className={cx('error')} role="alert" aria-live="assertive">
                        {error}
                    </p>
                ) : null}
            </div>
        );
    }

    // regular text/textarea render
    return (
        <div className={classes} style={inlineStyle}>
            {label && (
                <label htmlFor={id} className={cx('label')}>
                    {label}
                    {required && <span className={cx('required')}>*</span>}
                </label>
            )}

            <div className={cx('control')}>
                {iconLeft && (
                    <div className={cx('icon', 'left')} aria-hidden="true">
                        {iconLeft}
                    </div>
                )}

                {textarea ? (
                    <textarea
                        rows={rows}
                        {...inputProps}
                        className={`${cx('input', 'textarea')} ${focused ? 'focus-ring' : ''}`}
                    />
                ) : (
                    <input
                        type={finalType}
                        {...inputProps}
                        className={`${cx('input')} ${focused ? 'focus-ring' : ''}`}
                    />
                )}

                <div className={cx('right')} aria-hidden="false">
                    {iconRight && <div className={cx('icon', 'right-icon')}>{iconRight}</div>}

                    {clearable && !disabled && !!displayedValue && (
                        <button
                            type="button"
                            aria-label="Clear input"
                            title="Clear"
                            className={cx('clear')}
                            onClick={handleClear}
                        >
                            ✕
                        </button>
                    )}

                    {type === 'password' && showPasswordToggle && (
                        <button
                            type="button"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            title={showPassword ? 'Hide password' : 'Show password'}
                            className={cx('toggle')}
                            onClick={() => setShowPassword((s) => !s)}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    )}
                </div>
            </div>

            {error ? (
                <p id={errorId} className={cx('error')} role="alert" aria-live="assertive">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
