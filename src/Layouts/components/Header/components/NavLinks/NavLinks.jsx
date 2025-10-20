import React, { useContext, useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './NavLinks.module.scss';
import Button from '../../../Button';
import { AuthContext } from '../../../../../Context/AuthContext';

const cx = classNames.bind(styles);

function NavLinks() {
    const { user } = useContext(AuthContext);

    const roles = useMemo(() => {
        if (!user) return [];
        if (Array.isArray(user.roles) && user.roles.length) {
            return user.roles.map((r) => String(r).toUpperCase());
        }
        if (typeof user.scope === 'string' && user.scope.trim()) {
            return user.scope.split(/\s+/).map((r) => String(r).toUpperCase());
        }
        if (typeof user.role === 'string' && user.role.trim()) {
            return [user.role.toUpperCase()];
        }
        return [];
    }, [user]);

    const isAdmin = roles.includes('ADMIN');

    const links = [
        { text: 'Home', to: '/' },
        { text: 'Books', to: '/books' },
        { text: 'About', to: '/about' },
    ];

    const adminLinks = [{ text: 'Admin', to: '/admin' }];

    return (
        <nav className={cx('nav')}>
            <div className={cx('links')}>
                {links.map((link, idx) => (
                    <Button key={idx} to={link.to} text={2.4}>
                        {link.text}
                    </Button>
                ))}
            </div>

            {isAdmin && (
                <div className={cx('admin-group')}>
                    {adminLinks.map((link, idx) => (
                        <Button key={idx} to={link.to} text={2.4}>
                            {link.text}
                        </Button>
                    ))}
                </div>
            )}
        </nav>
    );
}

export default NavLinks;
