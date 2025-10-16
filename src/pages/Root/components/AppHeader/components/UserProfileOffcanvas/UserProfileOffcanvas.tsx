import classes from './UserProfileOffcanvas.module.scss';

import type { FC } from 'react';
import Offcanvas from 'react-bootstrap/esm/Offcanvas';
import { Button } from 'react-bootstrap';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { useNavigate } from 'react-router-dom';
import { clearAuthenticationState } from '@store/Authentication/authentication.slice';
import { clearUserState } from '@store/UserInfo/userInfo.slice';
import { persistor } from '@store/store';
import { UserChangePasswordBlock, UserProfileBlock } from './components';

interface UserProfileOffcanvasProps {
    show: boolean;
    onClose: () => void;
}

const UserProfileOffcanvas: FC<UserProfileOffcanvasProps> = ({ show, onClose }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(clearAuthenticationState());
        dispatch(clearUserState());
        persistor.purge();

        navigate('/login');
    };

    return (
        <Offcanvas
            show={show}
            onHide={onClose}
            placement="end"
            className={classes['user-profile-offcanvas']}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Editar Perfil</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div className={classes['user-profile-offcanvas__body']}>
                    <UserProfileBlock />
                </div>
                <UserChangePasswordBlock />
            </Offcanvas.Body>

            <Button
                className={`siem-primary-button`}
                onClick={handleLogout}
            >
                Cerrar sesión
            </Button>
        </Offcanvas>
    );
};

export default UserProfileOffcanvas;
