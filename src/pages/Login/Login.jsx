import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import { AuthContext } from '../../contexts/AuthContext';
import Button from '../../Layouts/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleGoHome = () => {
        navigate('/');
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
                    placeholder="Email or username"
                    required
                />
                <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                />

                <div className={cx('login-actions')}>
                    <Button primary width={15} disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                    <Button outline width={15} to="/register">
                        Đăng ký
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default Login;
