import styles from './NavLinks.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function NavLinks() {
    const links = ['Home', 'Books', 'About'];
    return (
        <nav className={cx('nav')}>
            {links.map((link) => (
                <button key={link}>{link}</button>
            ))}
        </nav>
    );
}

export default NavLinks;
