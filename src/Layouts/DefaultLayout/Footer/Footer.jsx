import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import Logo from '../../../components/Logo';

const cx = classNames.bind(styles);

function Footer() {
    return (
        <footer className={cx('footer')}>
            <div className={cx('container')}>
                <div className={cx('footer-section', 'brand')}>
                    <div className={cx('desc')}>
                        <Logo />
                        <p className={cx('text')}>
                            Discover your next favorite book with our curated collection of bestsellers and timeless
                            classics.
                        </p>
                    </div>
                    <div className={cx('social')}>
                        <a href="#">
                            <FontAwesomeIcon icon={faFacebook} />
                        </a>
                        <a href="#">
                            <FontAwesomeIcon icon={faTwitter} />
                        </a>
                        <a href="#">
                            <FontAwesomeIcon icon={faInstagram} />
                        </a>
                        <a href="#">
                            <FontAwesomeIcon icon={faEnvelope} />
                        </a>
                    </div>
                </div>

                <div className={cx('footer-section')}>
                    <h4>Shop</h4>
                    <ul>
                        <li>
                            <a href="/books">All Books</a>
                        </li>
                        <li>
                            <a href="#">Bestsellers</a>
                        </li>
                        <li>
                            <a href="#">New Releases</a>
                        </li>
                        <li>
                            <a href="#">Featured</a>
                        </li>
                    </ul>
                </div>

                <div className={cx('footer-section')}>
                    <h4>Support</h4>
                    <ul>
                        <li>
                            <a href="#">Contact Us</a>
                        </li>
                        <li>
                            <a href="#">FAQs</a>
                        </li>
                        <li>
                            <a href="#">Shipping Info</a>
                        </li>
                        <li>
                            <a href="#">Returns</a>
                        </li>
                    </ul>
                </div>

                <div className={cx('footer-section')}>
                    <h4>Company</h4>
                    <ul>
                        <li>
                            <a href="#">About Us</a>
                        </li>
                        <li>
                            <a href="#">Careers</a>
                        </li>
                        <li>
                            <a href="#">Privacy Policy</a>
                        </li>
                        <li>
                            <a href="#">Terms of Service</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className={cx('copyright')}>© 2025 BookStore. All rights reserved.</div>
        </footer>
    );
}

export default Footer;
