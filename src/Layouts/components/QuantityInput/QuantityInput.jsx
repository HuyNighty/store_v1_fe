import React from 'react';
import classNames from 'classnames/bind';
import styles from './QuantityInput.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import Button from '../Button';

const cx = classNames.bind(styles);

function QuantityInput({ value = 0, onChange, min = 0, max = 9999, step = 1, disabled = false, size = 'medium' }) {
    const handleIncrement = () => {
        const newValue = Math.min(max, value + step);
        onChange(newValue);
    };

    const handleDecrement = () => {
        const newValue = Math.max(min, value - step);
        onChange(newValue);
    };

    const handleInputChange = (e) => {
        const inputValue = e.target.value;

        // Allow empty input for better UX
        if (inputValue === '') {
            onChange('');
            return;
        }

        // Only allow numbers
        const numericValue = inputValue.replace(/[^0-9]/g, '');
        if (numericValue === '') {
            onChange(min);
            return;
        }

        const numValue = parseInt(numericValue, 10);
        if (!isNaN(numValue)) {
            const clampedValue = Math.max(min, Math.min(max, numValue));
            onChange(clampedValue);
        }
    };

    const handleBlur = (e) => {
        if (e.target.value === '') {
            onChange(min);
        }
    };

    return (
        <div className={cx('quantity-input', size, { disabled })}>
            <Button
                shine
                type="button"
                className={cx('quantity-btn', 'decrement')}
                onClick={handleDecrement}
                disabled={disabled || value <= min}
            >
                <FontAwesomeIcon icon={faMinus} />
            </Button>

            <input
                type="text"
                className={cx('quantity-field')}
                value={value}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={disabled}
                min={min}
                max={max}
            />

            <button
                type="button"
                className={cx('quantity-btn', 'increment')}
                onClick={handleIncrement}
                disabled={disabled || value >= max}
            >
                <FontAwesomeIcon icon={faPlus} />
            </button>
        </div>
    );
}

export default QuantityInput;
