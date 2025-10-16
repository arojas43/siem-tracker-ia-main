import { useAppDispatch, useAppSelector } from '@hooks/reduxTyped.hooks';
import classes from './Toaster.module.scss';
import { useEffect, useRef, useState, type FC } from 'react';
import Toast from 'react-bootstrap/esm/Toast';
import { appIsToasting } from '@store/AppState/appState.slice';
import { IoMdCloseCircle } from 'react-icons/io';
import { FaCircleCheck } from 'react-icons/fa6';

const DELAY_TIME = 5_000;
const Toaster: FC = () => {
    const dispatch = useAppDispatch();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { show: toastShow, message, isError } = useAppSelector((store) => store.appState.toastState);

    const [show, setShow] = useState<boolean>(false);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        setShow(toastShow);
    }, [toastShow]);

    const onToastClose = () => {
        setShow(false);

        timeoutRef.current = setTimeout(() => {
            dispatch(appIsToasting({ message: message, show: false, isError: false }));
            timeoutRef.current = null;
        }, 10);
    };

    return (
        <div className={`${classes['toaster__container']}`}>
            <Toast
                autohide
                show={show}
                // bg={variant}
                delay={DELAY_TIME}
                onClose={onToastClose}
                className={classes['toaster']}
            >
                {/* <Toast.Header>
                    <strong className="me-auto">SIEM Tracker</strong>
                </Toast.Header> */}
                <Toast.Body className={classes['toaster__body']}>
                    {isError ? (
                        <IoMdCloseCircle
                            size={25}
                            className={classes['toaster__error-icon']}
                        />
                    ) : (
                        <FaCircleCheck
                            size={20}
                            className={classes['toaster__success-icon']}
                        />
                    )}

                    {message}
                </Toast.Body>
            </Toast>
        </div>
    );
};

export default Toaster;
