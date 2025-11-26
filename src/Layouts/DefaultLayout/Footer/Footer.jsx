import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faGithub } from '@fortawesome/free-brands-svg-icons';
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
                        <a href="https://www.facebook.com/nguyen.huy.908064">
                            <FontAwesomeIcon icon={faFacebook} />
                        </a>
                        <a href="https://www.instagram.com/huynguyen3690/">
                            <FontAwesomeIcon icon={faInstagram} />
                        </a>
                        <a href="mailto:husyah0000@gmail.com?subject=Contact%20BookStore&body=Hello%20BookStore,">
                            <FontAwesomeIcon icon={faEnvelope} />
                        </a>
                        <a href="https://github.com/HuyNighty">
                            <FontAwesomeIcon icon={faGithub} />
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
                            <a href="#best-seller">Bestsellers</a>
                        </li>
                        <li>
                            <a href="#featured">New Releases</a>
                        </li>
                        <li>
                            <a href="#featured">Featured</a>
                        </li>
                    </ul>
                </div>

                <div className={cx('footer-section')}>
                    <h4>Support</h4>
                    <ul>
                        <li>
                            <a href="https://www.facebook.com/nguyen.huy.908064">Contact Us</a>
                        </li>
                        <li>
                            <a href="/FAQ">FAQs</a>
                        </li>
                        <li>
                            <a href="#">Shipping Info</a>
                        </li>
                        <li>
                            <a href="/">Returns</a>
                        </li>
                    </ul>
                </div>

                <div className={cx('footer-section')}>
                    <h4>Project</h4>
                    <ul>
                        <li>Full-stack BookStore</li>
                        <li>Backend: Spring Boot + JWT</li>
                        <li>Frontend: React + SCSS</li>
                        <li>Database: MySQL / JPA</li>
                    </ul>
                </div>
            </div>

            <div className={cx('copyright')}>© 2025 BookStore. All rights reserved.</div>
        </footer>
    );
}

export default Footer;
