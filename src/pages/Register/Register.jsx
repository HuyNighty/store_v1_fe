import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Register.module.scss';
import { AuthContext } from '../../contexts/Auth/AuthContext';
import Button from '../../Layouts/components/Button';
import authApi from '../../api/authApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye,
    faEyeSlash,
    faArrowLeft,
    faEnvelope,
    faLock,
    faUser,
    faPhone,
    faMapMarkerAlt,
    faBook,
    faStar,
    faAward,
    faBolt,
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const EyeIcon = () => <FontAwesomeIcon icon={faEye} />;
const EyeSlashIcon = () => <FontAwesomeIcon icon={faEyeSlash} />;

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
    const [focusedField, setFocusedField] = useState(null);

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
        setFocusedField(null);
    };

    const handleFocus = (fieldName) => {
        setFocusedField(fieldName);
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

    // Floating particles data
    const floatingParticles = Array.from({ length: 8 }, (_, i) => i);

    // Benefits data
    const benefits = [
        {
            icon: faStar,
            title: 'Miễn phí mãi mãi',
            desc: 'Truy cập vào kho sách khổng lồ hoàn toàn miễn phí',
            gradient: 'free-gradient',
        },
        {
            icon: faBolt,
            title: 'Gợi ý thông minh',
            desc: 'AI đề xuất sách phù hợp với sở thích của bạn',
            gradient: 'smart-gradient',
        },
        {
            icon: faAward,
            title: 'Thành tích & Huy hiệu',
            desc: 'Nhận phần thưởng khi hoàn thành mục tiêu đọc sách',
            gradient: 'achievement-gradient',
        },
    ];

    // Testimonial data
    const testimonial = {
        rating: 5,
        text: 'BookVerse đã thay đổi hoàn toàn thói quen đọc sách của tôi. Giao diện đẹp, kho sách phong phú, và cộng đồng thân thiện!',
        author: 'Minh Anh',
        role: 'Độc giả thân thiết',
    };

    return (
        <div className={cx('register-wrapper')}>
            {/* Background Image with Overlay */}
            <div className={cx('background-overlay')}>
                <div className={cx('background-image')}></div>
                <div className={cx('gradient-overlay')}></div>
                <div className={cx('radial-overlay')}></div>
            </div>

            {/* Animated particles */}
            {floatingParticles.map((i) => (
                <div key={i} className={cx('floating-particle', `particle-${i}`)}>
                    <FontAwesomeIcon icon={faBook} />
                </div>
            ))}

            {/* Content */}
            <div className={cx('register-container')}>
                <div className={cx('content-grid')}>
                    {/* Left side - Registration Form */}
                    <div className={cx('form-section')}>
                        {/* Glass morphism card */}
                        <div className={cx('form-card')}>
                            {/* Glow effect */}
                            <div className={cx('card-glow')} />

                            <div className={cx('card-content')}>
                                {/* Mobile logo */}
                                <div className={cx('mobile-logo')}>
                                    <FontAwesomeIcon icon={faBook} />
                                </div>

                                <div className={cx('form-header')}>
                                    <button type="button" className={cx('home-button')} onClick={handleGoHome}>
                                        <FontAwesomeIcon icon={faArrowLeft} />
                                        <span>Trang chủ</span>
                                    </button>
                                    <div className={cx('header-content')}>
                                        <h2 className={cx('form-title')}>Tạo tài khoản mới</h2>
                                        <p className={cx('form-subtitle')}>Bắt đầu hành trình khám phá tri thức</p>
                                    </div>
                                    <div className={cx('header-spacer')}></div>
                                </div>

                                {generalError && (
                                    <div className={cx('error-message')}>
                                        <div className={cx('error-icon')}>⚠️</div>
                                        <span>{generalError}</span>
                                    </div>
                                )}

                                {success && (
                                    <div className={cx('success-message')}>
                                        <div className={cx('success-icon')}>✓</div>
                                        <span>{success}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className={cx('register-form')} noValidate>
                                    <div className={cx('form-grid')}>
                                        {/* UserName Input */}
                                        <div className={cx('input-group')}>
                                            <label htmlFor="userName" className={cx('input-label')}>
                                                Tên đăng nhập *
                                            </label>
                                            <div
                                                className={cx('input-wrapper', {
                                                    focused: focusedField === 'userName',
                                                    invalid: errors.userName,
                                                })}
                                            >
                                                <div className={cx('input-icon')}>
                                                    <FontAwesomeIcon icon={faUser} />
                                                </div>
                                                <input
                                                    id="userName"
                                                    name="userName"
                                                    type="text"
                                                    placeholder="Tên đăng nhập của bạn"
                                                    value={form.userName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    onFocus={() => handleFocus('userName')}
                                                    className={cx('styled-input')}
                                                    required
                                                />
                                            </div>
                                            {errors.userName && (
                                                <small className={cx('field-error')}>{errors.userName}</small>
                                            )}
                                        </div>

                                        {/* Email Input */}
                                        <div className={cx('input-group')}>
                                            <label htmlFor="email" className={cx('input-label')}>
                                                Email *
                                            </label>
                                            <div
                                                className={cx('input-wrapper', {
                                                    focused: focusedField === 'email',
                                                    invalid: errors.email,
                                                })}
                                            >
                                                <div className={cx('input-icon')}>
                                                    <FontAwesomeIcon icon={faEnvelope} />
                                                </div>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="your.email@example.com"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    onFocus={() => handleFocus('email')}
                                                    className={cx('styled-input')}
                                                    required
                                                />
                                            </div>
                                            {errors.email && (
                                                <small className={cx('field-error')}>{errors.email}</small>
                                            )}
                                        </div>

                                        {/* Password Input */}
                                        <div className={cx('input-group')}>
                                            <label htmlFor="password" className={cx('input-label')}>
                                                Mật khẩu *
                                            </label>
                                            <div
                                                className={cx('input-wrapper', {
                                                    focused: focusedField === 'password',
                                                    invalid: errors.password,
                                                })}
                                            >
                                                <div className={cx('input-icon')}>
                                                    <FontAwesomeIcon icon={faLock} />
                                                </div>
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={form.password}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    onFocus={() => handleFocus('password')}
                                                    className={cx('styled-input')}
                                                    required
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
                                            {errors.password && (
                                                <small className={cx('field-error')}>{errors.password}</small>
                                            )}
                                        </div>

                                        {/* Confirm Password Input */}
                                        <div className={cx('input-group')}>
                                            <label htmlFor="confirmPassword" className={cx('input-label')}>
                                                Xác nhận mật khẩu *
                                            </label>
                                            <div
                                                className={cx('input-wrapper', {
                                                    focused: focusedField === 'confirmPassword',
                                                    invalid: errors.confirmPassword,
                                                })}
                                            >
                                                <div className={cx('input-icon')}>
                                                    <FontAwesomeIcon icon={faLock} />
                                                </div>
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={form.confirmPassword}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    onFocus={() => handleFocus('confirmPassword')}
                                                    className={cx('styled-input')}
                                                    required
                                                />
                                                {shouldShowConfirmPasswordIcon && (
                                                    <button
                                                        type="button"
                                                        className={cx('password-toggle')}
                                                        onClick={toggleConfirmPasswordVisibility}
                                                        aria-label={
                                                            showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                                                        }
                                                    >
                                                        {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                                                    </button>
                                                )}
                                            </div>
                                            {errors.confirmPassword && (
                                                <small className={cx('field-error')}>{errors.confirmPassword}</small>
                                            )}
                                        </div>

                                        {/* First Name Input */}
                                        <div className={cx('input-group')}>
                                            <label htmlFor="firstName" className={cx('input-label')}>
                                                Họ
                                            </label>
                                            <div
                                                className={cx('input-wrapper', {
                                                    focused: focusedField === 'firstName',
                                                })}
                                            >
                                                <div className={cx('input-icon')}>
                                                    <FontAwesomeIcon icon={faUser} />
                                                </div>
                                                <input
                                                    id="firstName"
                                                    name="firstName"
                                                    type="text"
                                                    placeholder="Họ của bạn"
                                                    value={form.firstName}
                                                    onChange={handleChange}
                                                    onFocus={() => handleFocus('firstName')}
                                                    onBlur={handleBlur}
                                                    className={cx('styled-input')}
                                                />
                                            </div>
                                        </div>

                                        {/* Last Name Input */}
                                        <div className={cx('input-group')}>
                                            <label htmlFor="lastName" className={cx('input-label')}>
                                                Tên
                                            </label>
                                            <div
                                                className={cx('input-wrapper', {
                                                    focused: focusedField === 'lastName',
                                                })}
                                            >
                                                <div className={cx('input-icon')}>
                                                    <FontAwesomeIcon icon={faUser} />
                                                </div>
                                                <input
                                                    id="lastName"
                                                    name="lastName"
                                                    type="text"
                                                    placeholder="Tên của bạn"
                                                    value={form.lastName}
                                                    onChange={handleChange}
                                                    onFocus={() => handleFocus('lastName')}
                                                    onBlur={handleBlur}
                                                    className={cx('styled-input')}
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Number Input */}
                                        <div className={cx('input-group')}>
                                            <label htmlFor="phoneNumber" className={cx('input-label')}>
                                                Số điện thoại *
                                            </label>
                                            <div
                                                className={cx('input-wrapper', {
                                                    focused: focusedField === 'phoneNumber',
                                                    invalid: errors.phoneNumber,
                                                })}
                                            >
                                                <div className={cx('input-icon')}>
                                                    <FontAwesomeIcon icon={faPhone} />
                                                </div>
                                                <input
                                                    id="phoneNumber"
                                                    name="phoneNumber"
                                                    type="tel"
                                                    placeholder="Số điện thoại của bạn"
                                                    value={form.phoneNumber}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    onFocus={() => handleFocus('phoneNumber')}
                                                    className={cx('styled-input')}
                                                    required
                                                />
                                            </div>
                                            {errors.phoneNumber && (
                                                <small className={cx('field-error')}>{errors.phoneNumber}</small>
                                            )}
                                        </div>

                                        {/* Address Input */}
                                        <div className={cx('input-group', 'full-width')}>
                                            <label htmlFor="address" className={cx('input-label')}>
                                                Địa chỉ *
                                            </label>
                                            <div
                                                className={cx('input-wrapper', {
                                                    focused: focusedField === 'address',
                                                    invalid: errors.address,
                                                })}
                                            >
                                                <div className={cx('input-icon')}>
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                </div>
                                                <input
                                                    id="address"
                                                    name="address"
                                                    type="text"
                                                    placeholder="Địa chỉ của bạn"
                                                    value={form.address}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    onFocus={() => handleFocus('address')}
                                                    className={cx('styled-input')}
                                                    required
                                                />
                                            </div>
                                            {errors.address && (
                                                <small className={cx('field-error')}>{errors.address}</small>
                                            )}
                                        </div>
                                    </div>

                                    {/* Terms Checkbox */}
                                    <div className={cx('terms-section')}>
                                        <label className={cx('terms-label')}>
                                            <input type="checkbox" required />
                                            <span className={cx('checkmark')}></span>
                                            <span className={cx('terms-text')}>
                                                Tôi đồng ý với{' '}
                                                <a href="#" className={cx('terms-link')}>
                                                    Điều khoản dịch vụ
                                                </a>{' '}
                                                và{' '}
                                                <a href="#" className={cx('terms-link')}>
                                                    Chính sách bảo mật
                                                </a>
                                            </span>
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <div className={cx('submit-section')}>
                                        <Button
                                            type="submit"
                                            shine
                                            primary
                                            width={60}
                                            height={5}
                                            disabled={disabledSubmit}
                                            className={cx('register-button')}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className={cx('loading-spinner')}></div>
                                                    Đang đăng ký...
                                                </>
                                            ) : (
                                                'Tạo tài khoản'
                                            )}
                                        </Button>
                                    </div>
                                </form>

                                {/* Divider */}
                                <div className={cx('divider')}>
                                    <span>HOẶC</span>
                                </div>

                                {/* Social Register */}
                                <div className={cx('social-register')}>
                                    <Button type="button" outline className={cx('social-button')}>
                                        <svg className={cx('social-icon')} viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        Google
                                    </Button>
                                    <Button type="button" outline className={cx('social-button')}>
                                        <svg className={cx('social-icon')} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        Facebook
                                    </Button>
                                </div>

                                {/* Login Link */}
                                <div className={cx('login-link-section')}>
                                    <Button type="button" shine outline to="/login" className={cx('login-link')}>
                                        <FontAwesomeIcon icon={faArrowLeft} className={cx('login-link-icon')} />
                                        Đã có tài khoản? Đăng nhập ngay
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Benefits */}
                    <div className={cx('benefits-section')}>
                        <div className={cx('benefits-content')}>
                            <div className={cx('branding-section')}>
                                <div className={cx('logo-section')}>
                                    <div className={cx('logo-icon')}>
                                        <FontAwesomeIcon icon={faBook} />
                                    </div>
                                    <div>
                                        <h1 className={cx('brand-name')}>Tham gia ngay</h1>
                                        <p className={cx('brand-tagline')}>Cùng hàng nghìn độc giả</p>
                                    </div>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className={cx('benefits-list')}>
                                {benefits.map((benefit, index) => (
                                    <div key={index} className={cx('benefit-item', benefit.gradient)}>
                                        <div className={cx('benefit-icon')}>
                                            <FontAwesomeIcon icon={benefit.icon} />
                                        </div>
                                        <div className={cx('benefit-content')}>
                                            <h3 className={cx('benefit-title')}>{benefit.title}</h3>
                                            <p className={cx('benefit-desc')}>{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Testimonial */}
                            <div className={cx('testimonial-section')}>
                                <div className={cx('testimonial-rating')}>
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <FontAwesomeIcon key={i} icon={faStar} className={cx('star-icon')} />
                                    ))}
                                </div>
                                <p className={cx('testimonial-text')}>"{testimonial.text}"</p>
                                <div className={cx('testimonial-author')}>
                                    <div className={cx('author-avatar')}>
                                        <FontAwesomeIcon icon={faUser} />
                                    </div>
                                    <div className={cx('author-info')}>
                                        <div className={cx('author-name')}>{testimonial.author}</div>
                                        <div className={cx('author-role')}>{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
