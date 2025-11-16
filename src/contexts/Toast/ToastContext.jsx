import React, { createContext, useState, useContext, useCallback } from 'react';
import styles from './ToastContext.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000, onConfirm = null) => {
        const id = Date.now();
        setToasts((prev) => [
            ...prev,
            {
                id,
                message,
                type,
                visible: true,
                progress: 100,
                onConfirm,
            },
        ]);

        const progressInterval = setInterval(() => {
            setToasts((prev) =>
                prev.map((toast) =>
                    toast.id === id
                        ? {
                              ...toast,
                              progress: Math.max(0, toast.progress - 100 / (duration / 100)),
                          }
                        : toast,
                ),
            );
        }, 100);

        setTimeout(() => {
            setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, visible: false } : toast)));
            clearInterval(progressInterval);
        }, duration - 500);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
            clearInterval(progressInterval);
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const handleToastClick = useCallback(
        (id) => {
            const toast = toasts.find((t) => t.id === id);

            if (toast && toast.onConfirm) {
                toast.onConfirm();
            }

            setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, visible: false } : toast)));

            setTimeout(() => {
                setToasts((prev) => prev.filter((toast) => toast.id !== id));
            }, 300);
        },
        [toasts],
    );

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className={cx('toast-container')}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cx('toast', toast.type, {
                            'slide-out': !toast.visible,
                            'confirm-toast': toast.onConfirm,
                        })}
                        onClick={() => handleToastClick(toast.id)}
                    >
                        <div className={cx('toast-content')}>
                            <span className={cx('toast-message')}>{toast.message}</span>
                        </div>

                        <div className={cx('toast-progress')} style={{ width: `${toast.progress}%` }} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
