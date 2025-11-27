import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faGear, faBox, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import styles from './ProfileMenu.module.scss';
import classNames from 'classnames/bind';
import { Wrapper as PopperWrapper } from '../../../../Popper';
import Tippy from '@tippyjs/react';
import { useAuth } from '../../../../../contexts/Auth/AuthContext';

const cx = classNames.bind(styles);

function ProfileMenu({ onProfileInteract, onLogout }) {
    const { user } = useAuth();

    const profileMenuItems = [
        { key: 1, label: 'Thông tin cá nhân', icon: faUser, to: '/profile' },
        { key: 2, label: 'Đơn hàng', icon: faBox, to: '/orders' },
        { key: 3, label: 'Đăng xuất', icon: faRightFromBracket, onClick: onLogout },
    ];

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;

        if (imagePath.startsWith('http')) {
            let fixedPath = imagePath;

            if (fixedPath.startsWith('https://52.62.234.97')) {
                fixedPath = fixedPath.replace('https://', 'http://');
            }

            if (fixedPath.includes('52.62.234.97') && !fixedPath.includes(':8080')) {
                fixedPath = fixedPath.replace('52.62.234.97', '52.62.234.97:8080');
            }

            return fixedPath + getTsQuery();
        }

        let cleaned = imagePath.replace(/^\/+/, '');

        if (!cleaned.startsWith('Store/')) {
            cleaned = `Store/${cleaned}`;
        }

        const HOST = 'http://52.62.234.97:8080';
        const finalUrl = `${HOST}/${cleaned}${getTsQuery()}`;
        return finalUrl;
    };

    const getTsQuery = () => {
        const ts = user?.updatedAt ? new Date(user.updatedAt).getTime() : Date.now();
        return `?t=${ts}`;
    };

    const menuContent = (
        <PopperWrapper>
            <div className={cx('profile-menu')}>
                {profileMenuItems.map((item) => (
                    <Link key={item.key} to={item.to} className={cx('menu-item')} onClick={item.onClick}>
                        <FontAwesomeIcon icon={item.icon} />
                        <span className={cx('text-item')}>{item.label}</span>
                    </Link>
                ))}
            </div>
        </PopperWrapper>
    );

    return (
        <Tippy
            content={menuContent}
            placement="bottom-end"
            trigger="mouseenter"
            hideOnClick={true}
            interactive
            delay={[100, 300]}
            onTrigger={() => onProfileInteract?.()}
        >
            <div className={cx('profile-trigger')}>
                {user?.profileImage ? (
                    <img
                        src={getImageUrl(user.profileImage)}
                        alt="Profile"
                        className={cx('profile-image')}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://i.pinimg.com/1200x/0c/9e/44/0c9e443b533656c2e541c0dceb571301.jpg';
                        }}
                    />
                ) : (
                    <FontAwesomeIcon icon={faUser} className={cx('icon-btn')} />
                )}
            </div>
        </Tippy>
    );
}

export default ProfileMenu;
