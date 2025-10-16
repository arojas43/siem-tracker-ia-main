import { useEffect, useState, type FC } from 'react';
import { useChangeUserPasswordMutation } from '@store/api/userApi.slice';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { appIsToasting } from '@store/AppState/appState.slice';
import classes from './UserChangePasswordBlock.module.scss';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import Button from 'react-bootstrap/esm/Button';
import FloatingLabel from 'react-bootstrap/esm/FloatingLabel';
import Form from 'react-bootstrap/esm/Form';
import InputGroup from 'react-bootstrap/esm/InputGroup';

const UserChangePasswordBlock: FC = () => {
    const dispatch = useAppDispatch();

    const [handleChangeUserPassword, { isLoading, isSuccess, isError }] = useChangeUserPasswordMutation();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmationPassword, setConfirmationPassword] = useState('');

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmationPassword, setShowConfirmationPassword] = useState(false);

    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmationPasswordError, setConfirmationPasswordError] = useState('');

    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            dispatch(appIsToasting({ message: 'Contraseña cambiada con éxito!', show: true, isError: false }));
        }
        if (isError) {
            dispatch(appIsToasting({ message: 'Error al tratar de cambiar contraseña.', show: true, isError: true }));
        }
    }, [isSuccess, isError]);

    useEffect(() => {
        const allValid =
            !oldPasswordError &&
            !newPasswordError &&
            !confirmationPasswordError &&
            oldPassword.length >= 8 &&
            newPassword.length >= 8 &&
            confirmationPassword.length >= 8 &&
            newPassword === confirmationPassword;

        setIsFormValid(allValid);
    }, [oldPassword, newPassword, confirmationPassword, oldPasswordError, newPasswordError, confirmationPasswordError]);

    const validatePasswordInput = (password: string, setError: (msg: string) => void, compareTo?: string) => {
        if (!password) {
            setError('La contraseña no puede estar vacía.');
        } else if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
        } else if (compareTo !== undefined && password !== compareTo) {
            setError('Las contraseñas no coinciden.');
        } else {
            setError('');
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isFormValid) return;

        handleChangeUserPassword({
            old_password: oldPassword,
            new_password: newPassword,
        });
    };

    return (
        <Form
            autoComplete="off"
            onSubmit={handleSubmit}
            className={classes['user-change-password-block']}
        >
            <h6>Cambiar contraseña</h6>

            {/* Old password */}
            <InputGroup>
                <FloatingLabel
                    label="Contraseña anterior"
                    controlId="oldPassword"
                    className={`${classes['floating-label-wrapper']}`}
                >
                    <Form.Control
                        placeholder=""
                        name="oldPassword"
                        type={showOldPassword ? 'text' : 'password'}
                        value={oldPassword}
                        className={`${classes['login-form__form--input']} ${classes['login-form__form--input-password']}`}
                        onChange={(e) => {
                            const value = e.currentTarget.value;
                            setOldPassword(value);
                            if (oldPasswordError) validatePasswordInput(value, setOldPasswordError);
                        }}
                        onFocus={() => setOldPasswordError('')}
                        onBlur={() => validatePasswordInput(oldPassword, setOldPasswordError)}
                        isInvalid={!!oldPasswordError}
                    />
                </FloatingLabel>
                <Button
                    variant="outline-secondary"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className={classes['login-form__form--password-button']}
                >
                    {showOldPassword ? <IoEyeOffOutline size={25} /> : <IoEyeOutline size={25} />}
                </Button>
            </InputGroup>
            {oldPasswordError && (
                <div
                    className="text-danger mt-1 ms-1"
                    style={{ fontSize: '0.9rem' }}
                >
                    {oldPasswordError}
                </div>
            )}

            {/* New password */}
            <InputGroup className="mt-3">
                <FloatingLabel
                    className={`${classes['floating-label-wrapper']}`}
                    label="Nueva Contraseña"
                    controlId="newPassword"
                >
                    <Form.Control
                        placeholder=""
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        className={`${classes['login-form__form--input']} ${classes['login-form__form--input-password']}`}
                        onChange={(e) => {
                            const value = e.currentTarget.value;
                            setNewPassword(value);
                            if (newPasswordError) validatePasswordInput(value, setNewPasswordError);
                            if (confirmationPassword) {
                                validatePasswordInput(confirmationPassword, setConfirmationPasswordError, value);
                            }
                        }}
                        onFocus={() => setNewPasswordError('')}
                        onBlur={() => validatePasswordInput(newPassword, setNewPasswordError)}
                        isInvalid={!!newPasswordError}
                    />
                </FloatingLabel>
                <Button
                    variant="outline-secondary"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={classes['login-form__form--password-button']}
                >
                    {showNewPassword ? <IoEyeOffOutline size={25} /> : <IoEyeOutline size={25} />}
                </Button>
            </InputGroup>
            {newPasswordError && (
                <div
                    className="text-danger mt-1 ms-1"
                    style={{ fontSize: '0.9rem' }}
                >
                    {newPasswordError}
                </div>
            )}

            {/* Confirm password */}
            <InputGroup className="mt-3">
                <FloatingLabel
                    className={`${classes['floating-label-wrapper']}`}
                    label="Confirmación contraseña"
                    controlId="confirmationPassword"
                >
                    <Form.Control
                        placeholder=""
                        name="confirmationPassword"
                        type={showConfirmationPassword ? 'text' : 'password'}
                        value={confirmationPassword}
                        className={`${classes['login-form__form--input']} ${classes['login-form__form--input-password']}`}
                        onChange={(e) => {
                            const value = e.currentTarget.value;
                            setConfirmationPassword(value);
                            if (confirmationPasswordError || value !== newPassword) {
                                validatePasswordInput(value, setConfirmationPasswordError, newPassword);
                            }
                        }}
                        onFocus={() => setConfirmationPasswordError('')}
                        onBlur={() =>
                            validatePasswordInput(confirmationPassword, setConfirmationPasswordError, newPassword)
                        }
                        isInvalid={!!confirmationPasswordError}
                    />
                </FloatingLabel>
                <Button
                    variant="outline-secondary"
                    onClick={() => setShowConfirmationPassword(!showConfirmationPassword)}
                    className={classes['login-form__form--password-button']}
                >
                    {showConfirmationPassword ? <IoEyeOffOutline size={25} /> : <IoEyeOutline size={25} />}
                </Button>
            </InputGroup>
            {confirmationPasswordError && (
                <div
                    className="text-danger mt-1 ms-1"
                    style={{ fontSize: '0.9rem' }}
                >
                    {confirmationPasswordError}
                </div>
            )}

            <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`mt-4 siem-primary-button`}
            >
                {isLoading ? 'Guardando...' : 'Salvar nueva contraseña'}
            </Button>
        </Form>
    );
};

export default UserChangePasswordBlock;
