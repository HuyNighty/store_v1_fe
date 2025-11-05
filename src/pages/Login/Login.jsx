import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import { AuthContext } from '../../contexts/AuthContext';
import Button from '../../Layouts/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

// Tạo các component icon
const EyeIcon = () => <FontAwesomeIcon icon={faEye} />;
const EyeSlashIcon = () => <FontAwesomeIcon icon={faEyeSlash} />;

function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleGoHome = () => {
        navigate('/');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(form);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const shouldShowPasswordIcon = form.password.length > 0;

    return (
        <div className={cx('login-wrapper')}>
            <form className={cx('login-form')} onSubmit={handleSubmit}>
                <div className={cx('form-header')}>
                    <button type="button" className={cx('home-button')} onClick={handleGoHome}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h2>Đăng nhập</h2>
                    <div className={cx('header-spacer')}></div>
                </div>

                {error && <p className={cx('error')}>{error}</p>}

                <input
                    name="identifier"
                    value={form.identifier}
                    onChange={handleChange}
                    placeholder="Email hoặc tên đăng nhập"
                    required
                />

                <div className={cx('field', 'password-field')}>
                    <div className={cx('password-input-wrapper')}>
                        <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Mật khẩu"
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

                <div className={cx('login-actions')}>
                    <Button shine primary width={15} disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                    <Button shine outline width={15} to="/register">
                        Đăng ký
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default Login;
