// src/components/QuantityInput/QuantityInput.jsx
import React from 'react';
import classNames from 'classnames/bind';
import styles from './QuantityInput.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function QuantityInput({
    value = 0,
    onChange,
    min = 0,
    max = 999999999999999,
    step = 1,
    disabled = false,
    size = 'medium',
    placeholder = '',
    enforceMinOnBlur = true,
}) {
    // convert possibly-string value to number safely for increment/decrement
    const toNumberSafe = (v) => {
        if (v === '' || v === null || v === undefined) return NaN;
        const n = Number(v);
        return Number.isFinite(n) ? n : NaN;
    };

    const currentNum = toNumberSafe(value);

    const handleIncrement = () => {
        // if empty => start from min (or 0) then + step
        const base = Number.isFinite(currentNum) ? currentNum : min;
        const newValue = Math.min(max, base + step);
        onChange(newValue);
    };

    const handleDecrement = () => {
        const base = Number.isFinite(currentNum) ? currentNum : min;
        const newValue = Math.max(min, base - step);
        onChange(newValue);
    };

    const handleInputChange = (e) => {
        const inputValue = e.target.value;

        // allow user to clear the field (empty string)
        if (inputValue === '') {
            onChange('');
            return;
        }

        // extract digits (allowing leading +)
        const numericValue = inputValue.replace(/[^0-9\-+.]/g, '');

        // if nothing left -> keep empty (so user can type)
        if (numericValue === '' || numericValue === '-' || numericValue === '+' || numericValue === '+-') {
            onChange('');
            return;
        }

        const numValue = parseInt(numericValue, 10);
        if (!isNaN(numValue)) {
            const clampedValue = Math.max(min, Math.min(max, numValue));
            onChange(clampedValue);
        }
    };

    const handleBlur = (e) => {
        // If input left empty and enforceMinOnBlur => set to min, otherwise keep ''
        if (e.target.value === '' && enforceMinOnBlur) {
            onChange(min);
        }
    };

    return (
        <div className={cx('quantity-input', size, { disabled })}>
            <button
                type="button"
                className={cx('quantity-btn', 'decrement')}
                onClick={handleDecrement}
                disabled={disabled || (!Number.isFinite(currentNum) ? min <= 0 : currentNum <= min)}
                aria-label="decrease"
            >
                <FontAwesomeIcon icon={faMinus} />
            </button>

            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={cx('quantity-field')}
                value={value === null || value === undefined ? '' : value}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={disabled}
                placeholder={placeholder}
                aria-valuemin={min}
                aria-valuemax={max}
            />

            <button
                type="button"
                className={cx('quantity-btn', 'increment')}
                onClick={handleIncrement}
                disabled={disabled || (!Number.isFinite(currentNum) ? false : currentNum >= max)}
                aria-label="increase"
            >
                <FontAwesomeIcon icon={faPlus} />
            </button>
        </div>
    );
}

export default QuantityInput;
