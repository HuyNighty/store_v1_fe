import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import { AuthContext } from '../../contexts/Auth/AuthContext';
import Button from '../../Layouts/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faEye,
    faEyeSlash,
    faEnvelope,
    faLock,
    faBook,
    faUsers,
    faBookmark,
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const EyeIcon = () => <FontAwesomeIcon icon={faEye} />;
const EyeSlashIcon = () => <FontAwesomeIcon icon={faEyeSlash} />;

function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleGoHome = () => {
        navigate('/');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleFocus = (fieldName) => {
        setFocusedField(fieldName);
    };

    const handleBlur = () => {
        setFocusedField(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(form);

            const redirectPath = localStorage.getItem('redirectPath') || '/';
            localStorage.removeItem('redirectPath');
            navigate(redirectPath);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const shouldShowPasswordIcon = form.password.length > 0;

    const floatingParticles = Array.from({ length: 6 }, (_, i) => i);

    const features = [
        {
            icon: faBook,
            title: 'Kho sách phong phú',
            desc: 'Hơn 10,000 đầu sách từ cổ điển đến hiện đại',
        },
        {
            icon: faUsers,
            title: 'Cộng đồng sôi động',
            desc: 'Kết nối với những tâm hồn yêu sách',
        },
        {
            icon: faBookmark,
            title: 'Trải nghiệm cá nhân',
            desc: 'Gợi ý sách phù hợp với sở thích riêng',
        },
    ];

    const stats = [
        { value: '10K+', label: 'Sách' },
        { value: '50K+', label: 'Độc giả' },
        { value: '100+', label: 'Thể loại' },
    ];

    return (
        <div className={cx('login-wrapper')}>
            <div className={cx('background-overlay')}>
                <div className={cx('background-image')}></div>
                <div className={cx('gradient-overlay')}></div>
                <div className={cx('radial-overlay')}></div>
            </div>

            {floatingParticles.map((i) => (
                <div key={i} className={cx('floating-particle', `particle-${i}`)}>
                    <FontAwesomeIcon icon={faBook} />
                </div>
            ))}

            <div className={cx('login-container')}>
                <div className={cx('content-grid')}>
                    <div className={cx('branding-section')}>
                        <div className={cx('branding-content')}>
                            <div className={cx('logo-section')}>
                                <div className={cx('logo-icon')}>
                                    <FontAwesomeIcon icon={faBook} />
                                </div>
                                <div>
                                    <h1 className={cx('brand-name')}>BookStore</h1>
                                    <p className={cx('brand-tagline')}>Thư viện tri thức bất tận</p>
                                </div>
                            </div>
                            <p className={cx('brand-description')}>
                                Khám phá hàng nghìn đầu sách quý giá, tham gia cộng đồng yêu văn học, và bắt đầu hành
                                trình tri thức đầy cảm hứng.
                            </p>
                        </div>

                        <div className={cx('features-section')}>
                            {features.map((feature, index) => (
                                <div key={index} className={cx('feature-item')}>
                                    <div className={cx('feature-icon')}>
                                        <FontAwesomeIcon icon={feature.icon} />
                                    </div>
                                    <div className={cx('feature-content')}>
                                        <h3 className={cx('feature-title')}>{feature.title}</h3>
                                        <p className={cx('feature-desc')}>{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={cx('stats-section')}>
                            {stats.map((stat, i) => (
                                <div key={i} className={cx('stat-item')}>
                                    <div className={cx('stat-value')}>{stat.value}</div>
                                    <div className={cx('stat-label')}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cx('form-section')}>
                        <div className={cx('form-card')}>
                            <div className={cx('card-glow')} />

                            <div className={cx('card-content')}>
                                <div className={cx('mobile-logo')}>
                                    <FontAwesomeIcon icon={faBook} />
                                </div>

                                <div className={cx('form-header')}>
                                    <button type="button" className={cx('home-button')} onClick={handleGoHome}>
                                        <FontAwesomeIcon icon={faArrowLeft} />
                                        <span>Trang chủ</span>
                                    </button>
                                    <div className={cx('header-content')}>
                                        <h2 className={cx('form-title')}>Chào mừng trở lại</h2>
                                        <p className={cx('form-subtitle')}>Đăng nhập để tiếp tục hành trình của bạn</p>
                                    </div>
                                    <div className={cx('header-spacer')}></div>
                                </div>

                                {error && (
                                    <div className={cx('error-message')}>
                                        <div className={cx('error-icon')}>⚠️</div>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className={cx('login-form')}>
                                    <div className={cx('input-group')}>
                                        <label className={cx('input-label')}>Email hoặc tên đăng nhập</label>
                                        <div
                                            className={cx('input-wrapper', { focused: focusedField === 'identifier' })}
                                        >
                                            <div className={cx('input-icon')}>
                                                <FontAwesomeIcon icon={faEnvelope} />
                                            </div>
                                            <input
                                                id="identifier"
                                                name="identifier"
                                                type="text"
                                                placeholder="your.email@example.com"
                                                value={form.identifier}
                                                onChange={handleChange}
                                                onFocus={() => handleFocus('identifier')}
                                                onBlur={handleBlur}
                                                className={cx('styled-input')}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={cx('input-group')}>
                                        <label htmlFor="password" className={cx('input-label')}>
                                            Mật khẩu
                                        </label>
                                        <div className={cx('input-wrapper', { focused: focusedField === 'password' })}>
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
                                                onFocus={() => handleFocus('password')}
                                                onBlur={handleBlur}
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
                                    </div>

                                    <div className={cx('form-options')}>
                                        <label className={cx('remember-me')}>
                                            <input type="checkbox" />
                                            <span className={cx('checkmark')}></span>
                                            Ghi nhớ đăng nhập
                                        </label>
                                        <a href="/forgot-password" className={cx('forgot-password')}>
                                            Quên mật khẩu?
                                        </a>
                                    </div>

                                    <div className={cx('submit-section')}>
                                        <Button
                                            type="submit"
                                            shine
                                            primary
                                            scale
                                            width={60}
                                            height={5}
                                            disabled={loading}
                                            className={cx('login-button')}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className={cx('loading')}>
                                                        <div className={cx('loading-spinner')}></div>
                                                        Đang đăng nhập...
                                                    </div>
                                                </>
                                            ) : (
                                                'Đăng nhập'
                                            )}
                                        </Button>
                                    </div>
                                </form>

                                <div className={cx('divider')}>
                                    <span>HOẶC</span>
                                </div>

                                <div className={cx('social-login')}>
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

                                <div className={cx('register-link-section')}>
                                    <span className={cx('register-prompt')}>Chưa có tài khoản? </span>
                                    <Button type="button" shine outline to="/register" className={cx('register-link')}>
                                        Đăng ký ngay
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
