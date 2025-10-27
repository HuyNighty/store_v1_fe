import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Register.module.scss';
import { AuthContext } from '../../contexts/AuthContext';
import Button from '../../Layouts/components/Button';
import authApi from '../../api/authApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const initialForm = {
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
};

const initialErrors = {
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
};

const EyeIcon = () => <FontAwesomeIcon icon={faEye} />;

const EyeSlashIcon = () => <FontAwesomeIcon icon={faEyeSlash} />;

function Register() {
    const { register: ctxRegister } = useContext(AuthContext) || {};
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordStrong = (pwd) =>
        pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);

    const validateField = (name, value) => {
        switch (name) {
            case 'userName':
                if (!value) return 'Tên đăng nhập bắt buộc';
                if (value.length < 4) return 'Tên đăng nhập ít nhất 4 ký tự';
                return '';
            case 'email':
                if (!value) return 'Email bắt buộc';
                if (!emailRegex.test(value)) return 'Email không hợp lệ';
                return '';
            case 'password':
                if (!value) return 'Mật khẩu bắt buộc';
                if (!passwordStrong(value))
                    return 'Mật khẩu tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt';
                return '';
            case 'confirmPassword':
                if (!value) return 'Xác nhận mật khẩu bắt buộc';
                if (value !== form.password) return 'Mật khẩu xác nhận không khớp';
                return '';
            case 'phoneNumber':
                if (!value) return 'Số điện thoại bắt buộc';
                if (!/^[0-9()+\-\s]{7,20}$/.test(value)) return 'Số điện thoại không hợp lệ';
                return '';
            case 'address':
                if (!value) return 'Địa chỉ bắt buộc';
                return '';
            default:
                return '';
        }
    };

    const validateForm = () => {
        const newErrors = { ...initialErrors };
        let isValid = true;

        Object.keys(form).forEach((key) => {
            if (key in newErrors) {
                const error = validateField(key, form[key]);
                if (error) {
                    newErrors[key] = error;
                    isValid = false;
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));

        if (isSubmitted && errors[name]) {
            setErrors((p) => ({ ...p, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (isSubmitted) {
            setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');
        setSuccess('');
        setIsSubmitted(true);

        if (!validateForm()) {
            setGeneralError('Vui lòng kiểm tra lại thông tin đã nhập');
            return;
        }

        const payload = {
            userName: form.userName,
            email: form.email,
            password: form.password,
            firstName: form.firstName || null,
            lastName: form.lastName || null,
            phoneNumber: form.phoneNumber,
            address: form.address,
        };

        setLoading(true);
        try {
            if (typeof ctxRegister === 'function') {
                await ctxRegister(payload);
            } else {
                await authApi.register(payload);
            }
            setSuccess('Đăng ký thành công — chuyển đến trang đăng nhập...');
            setTimeout(() => navigate('/login'), 1200);
        } catch (err) {
            console.error('Register error:', err);

            const resp = err.response?.data;

            if (resp) {
                if (resp.errors && typeof resp.errors === 'object') {
                    const next = { ...initialErrors };
                    for (const key of Object.keys(resp.errors)) {
                        if (key in next) next[key] = resp.errors[key];
                    }
                    setErrors((p) => ({ ...p, ...next }));
                    setGeneralError(resp.message || 'Lỗi validate từ server');
                } else if (resp.message) {
                    setGeneralError(resp.message);
                } else {
                    setGeneralError('Đăng ký thất bại — kiểm tra lại kết nối.');
                }
            } else {
                setGeneralError(err.message || 'Đăng ký thất bại');
            }
        } finally {
            setLoading(false);
        }
    };

    const disabledSubmit = loading;

    const shouldShowPasswordIcon = form.password.length > 0;
    const shouldShowConfirmPasswordIcon = form.confirmPassword.length > 0;

    return (
        <div className={cx('register-wrapper')}>
            <form className={cx('register-form')} onSubmit={handleSubmit} noValidate>
                <div className={cx('header-actions')}>
                    <button type="button" className={cx('home-button')} onClick={handleGoHome}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                </div>

                <h2>Đăng ký tài khoản</h2>

                {generalError && <div className={cx('general-error')}>{generalError}</div>}
                {success && <div className={cx('success')}>{success}</div>}

                <div className={cx('grid')}>
                    <label className={cx('field')}>
                        <input
                            name="userName"
                            placeholder="Tên đăng nhập *"
                            value={form.userName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={cx({ invalid: errors.userName })}
                        />
                        {errors.userName && <small className={cx('field-error')}>{errors.userName}</small>}
                    </label>

                    <label className={cx('field')}>
                        <input
                            name="email"
                            type="email"
                            placeholder="Email *"
                            value={form.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={cx({ invalid: errors.email })}
                        />
                        {errors.email && <small className={cx('field-error')}>{errors.email}</small>}
                    </label>

                    <label className={cx('field', 'password-field')}>
                        <div className={cx('password-input-wrapper')}>
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Mật khẩu *"
                                value={form.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={cx({ invalid: errors.password })}
                            />
                            {shouldShowPasswordIcon && (
                                <button
                                    type="button"
                                    className={cx('password-toggle')}
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                                </button>
                            )}
                        </div>
                        {errors.password && <small className={cx('field-error')}>{errors.password}</small>}
                    </label>

                    <label className={cx('field', 'password-field')}>
                        <div className={cx('password-input-wrapper')}>
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Xác nhận mật khẩu *"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={cx({ invalid: errors.confirmPassword })}
                            />
                            {shouldShowConfirmPasswordIcon && (
                                <button
                                    type="button"
                                    className={cx('password-toggle')}
                                    onClick={toggleConfirmPasswordVisibility}
                                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                                </button>
                            )}
                        </div>
                        {errors.confirmPassword && (
                            <small className={cx('field-error')}>{errors.confirmPassword}</small>
                        )}
                    </label>

                    <label className={cx('field')}>
                        <input name="firstName" placeholder="Họ" value={form.firstName} onChange={handleChange} />
                    </label>

                    <label className={cx('field')}>
                        <input name="lastName" placeholder="Tên" value={form.lastName} onChange={handleChange} />
                    </label>

                    <label className={cx('field')}>
                        <input
                            name="phoneNumber"
                            placeholder="Số điện thoại *"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={cx({ invalid: errors.phoneNumber })}
                        />
                        {errors.phoneNumber && <small className={cx('field-error')}>{errors.phoneNumber}</small>}
                    </label>

                    <label className={cx('field', 'full')}>
                        <input
                            name="address"
                            placeholder="Địa chỉ *"
                            value={form.address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={cx({ invalid: errors.address })}
                        />
                        {errors.address && <small className={cx('field-error')}>{errors.address}</small>}
                    </label>
                </div>

                <div className={cx('register-actions')}>
                    <Button shine primary width={15} height={4.5} disabled={disabledSubmit}>
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </Button>
                    <Button shine outline width={15} to="/login" type="button">
                        Đăng nhập
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default Register;
