import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faGear, faBox, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import styles from './ProfileMenu.module.scss';
import classNames from 'classnames/bind';
import { Wrapper as PopperWrapper } from '../../../../Popper';
import Tippy from '@tippyjs/react';

const cx = classNames.bind(styles);

function ProfileMenu() {
    const profileMenuItems = [
        { label: 'My Profile', icon: faUser, to: '/profile' },
        { label: 'Orders', icon: faBox, to: '/orders' },
        { label: 'Settings', icon: faGear, to: '/settings' },
        { label: 'Logout', icon: faRightFromBracket, to: '/logout' },
    ];

    const menuContent = (
        <PopperWrapper>
            <div className={cx('profile-menu')}>
                {profileMenuItems.map((item) => (
                    <Link key={item.to} to={item.to} className={cx('menu-item')}>
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
            // visible={true}
            delay={[100, 300]}
        >
            <div>
                <FontAwesomeIcon icon={faUser} className={cx('icon-btn')} />
            </div>
        </Tippy>
    );
}

export default ProfileMenu;
