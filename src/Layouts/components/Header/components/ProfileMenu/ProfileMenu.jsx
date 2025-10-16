import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faGear, faBox, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import styles from './ProfileMenu.module.scss';
import classNames from 'classnames/bind';
import { Wrapper as PopperWrapper } from '../../../../Popper';
import Tippy from '@tippyjs/react';

const cx = classNames.bind(styles);

function ProfileMenu({ onProfileInteract, onLogout }) {
    const profileMenuItems = [
        { label: 'Thông tin cá nhân', icon: faUser, to: '/profile' },
        { label: 'Đơn hàng', icon: faBox, to: '/orders' },
        { label: 'Cài đặt', icon: faGear, to: '/settings' },
        { label: 'Đăng xuất', icon: faRightFromBracket, onClick: onLogout },
    ];

    const menuContent = (
        <PopperWrapper>
            <div className={cx('profile-menu')}>
                {profileMenuItems.map((item) => (
                    <Link key={item.to} to={item.to} className={cx('menu-item')} onClick={item.onClick}>
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
            // visible
            onTrigger={() => onProfileInteract()}
        >
            <div>
                <FontAwesomeIcon icon={faUser} className={cx('icon-btn')} />
            </div>
        </Tippy>
    );
}

export default ProfileMenu;
