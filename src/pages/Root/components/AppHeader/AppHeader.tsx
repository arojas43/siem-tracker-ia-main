import Image from 'react-bootstrap/esm/Image';
import classes from './AppHeader.module.scss';
import { useState, type FC } from 'react';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import { SiemLogo } from '@components/index';
import { Link } from 'react-router-dom';
import { CiMenuBurger } from 'react-icons/ci';
import { useAppSelector } from '@hooks/reduxTyped.hooks';

import { UserProfileOffcanvas } from './components';
import { Placeholder } from 'react-bootstrap';

const AppHeader: FC = () => {
    const { headerTitle } = usePageHeader();
    const [showOffcanvas, setShowOffcanvas] = useState<boolean>(false);
    const { profilePhoto } = useAppSelector((store) => store.userInfo);

    return (
        <header className={classes['app-header']}>
            <div
                className={classes['app-header_menu-icon']}
                id="mobile-menu"
            >
                <CiMenuBurger
                    id="mobile-menu"
                    size={40}
                />
            </div>
            {!!headerTitle && <h1 className={classes['app-header_title']}>{headerTitle}</h1>}
            {!headerTitle && (
                <Placeholder
                    as="div"
                    animation="wave"
                    xs={8}
                    className={classes['app-header_placeholder']}
                >
                    <Placeholder
                        xs={12}
                        style={{ height: '80%' }}
                    />
                </Placeholder>
            )}
            <div className={classes['app-header_logo']}>
                <Link to="/home">
                    <SiemLogo
                        size="sm"
                        style={{ cursor: 'pointer' }}
                    />
                </Link>
            </div>

            <div className={classes['app-header__action-btns']}>
                {/* <MdOutlineNotifications
                    size={40}
                    onClick={handleNotification}
                    className={classes['app-header__notification-btn']}
                /> */}
                <Image
                    roundedCircle
                    style={{ cursor: 'pointer', width: 45, height: 45, objectFit: 'cover' }}
                    onClick={() => setShowOffcanvas(true)}
                    src={profilePhoto}
                />
                <UserProfileOffcanvas
                    show={showOffcanvas}
                    onClose={() => setShowOffcanvas(false)}
                />
            </div>
        </header>
    );
};

export default AppHeader;
