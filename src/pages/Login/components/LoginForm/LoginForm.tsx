import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import classes from './LoginForm.module.scss';
import { useRef, type FC, type FormEvent, useEffect, useState, useCallback } from 'react';
import Button from 'react-bootstrap/esm/Button';
import FloatingLabel from 'react-bootstrap/esm/FloatingLabel';
import Form from 'react-bootstrap/esm/Form';
import Spinner from 'react-bootstrap/esm/Spinner';
import { useNavigate } from 'react-router-dom';
import { useLazyLoginQuery } from '@store/api/authApi.slice';
import { saveAuthentication, saveBasicAuthCredentials } from '@store/Authentication/authentication.slice';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { IoMdCloseCircle } from 'react-icons/io';
import { saveUserInfo } from '@store/UserInfo/userInfo.slice';

const LoginForm: FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const USE_BASIC = (import.meta.env.VITE_USE_BASIC_AUTH || '').toString() === 'true';

    const usernameInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const [handleAppLogin, { data, isSuccess, isLoading, isError }] = useLazyLoginQuery();
    const [basicIsLoading, setBasicIsLoading] = useState<boolean>(false);
    const [basicIsError, setBasicIsError] = useState<boolean>(false);

    const handleSuccessLogin = useCallback(() => {
        dispatch(saveAuthentication(data));
        dispatch(saveUserInfo(data.user));
        navigate('/home');
    }, [dispatch, data, navigate]);

    useEffect(() => {
        if (!USE_BASIC && isSuccess) {
            handleSuccessLogin();
            return;
        }
    }, [USE_BASIC, isSuccess, handleSuccessLogin]);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const username = usernameInputRef.current!.value;
        const password = passwordInputRef.current!.value;

        if (USE_BASIC) {
            try {
                setBasicIsError(false);
                setBasicIsLoading(true);
                const encoded = btoa(`${username}:${password}`);
                const resp = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/summary/home/`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Basic ${encoded}`,
                    },
                });
                if (resp.ok) {
                    dispatch(saveBasicAuthCredentials({ username, password }));
                    navigate('/home');
                } else {
                    setBasicIsError(true);
                }
            } catch (err) {
                setBasicIsError(true);
            } finally {
                setBasicIsLoading(false);
            }
            return;
        }

        handleAppLogin({
            username,
            password,
        });
    };

    return (
        <div className={classes['login-form__container']}>
            <div>
                <h6>¡Bienvenido!</h6>
                <h3>Iniciar Sesión</h3>
            </div>
            <Form
                autoComplete="off"
                className={classes['login-form__form']}
                onSubmit={handleLogin}
            >
                <FloatingLabel
                    className={`mb-3 ${classes['floating-label-wrapper']}`}
                    label="Correo"
                    controlId="floatingInput"
                >
                    <Form.Control
                        size="lg"
                        placeholder=""
                        ref={usernameInputRef}
                        className={classes['login-form__form--input']}
                        onChange={(e) => {
                            e.target.value = e.target.value.replace(/\s/g, '');
                        }}
                    />
                </FloatingLabel>

                <InputGroup>
                    <FloatingLabel
                        className={`${classes['floating-label-wrapper']}`}
                        label="Contraseña"
                        controlId="floatingPassword"
                    >
                        <Form.Control
                            size="lg"
                            placeholder=""
                            ref={passwordInputRef}
                            type={showPassword ? 'text' : 'password'}
                            className={`${classes['login-form__form--input']} ${classes['login-form__form--input-password']}`}
                            onChange={(e) => {
                                e.target.value = e.target.value.replace(/\s/g, '');
                            }}
                        />
                    </FloatingLabel>
                    <Button
                        id="button-addon2"
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        className={classes['login-form__form--password-button']}
                    >
                        {showPassword ? <IoEyeOffOutline size={25} /> : <IoEyeOutline size={25} />}
                    </Button>
                </InputGroup>

                <Button
                    disabled={false}
                    size="lg"
                    type="submit"
                    variant="primary"
                    className={classes['login-form__form--button']}
                >
                    {(USE_BASIC ? basicIsLoading : isLoading) && (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            style={{ marginRight: 20 }}
                        />
                    )}
                    INICIAR SESIÓN
                </Button>
            </Form>
            <div
                hidden={!(USE_BASIC ? basicIsError : isError)}
                className={classes['login-form__error-message-block']}
            >
                <IoMdCloseCircle
                    size={25}
                    className={classes['login-form__error-message-block--icon']}
                />

                <p>Ha ocurrido un error, inténtalo nuevamente.</p>
            </div>
        </div>
    );
};

export default LoginForm;
