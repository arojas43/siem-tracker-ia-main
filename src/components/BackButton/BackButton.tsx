import classes from './BackButton.module.scss';
import type { ButtonHTMLAttributes, FC } from 'react';
import Button from 'react-bootstrap/esm/Button';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import CloseButton from 'react-bootstrap/esm/CloseButton';

interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    asIcon?: boolean;
    goToRoute?: string;
    onAction?: () => void;
}

const BackButton: FC<BackButtonProps> = ({ className, goToRoute, onAction, asIcon = false, ...props }) => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        if (goToRoute) {
            navigate(goToRoute);
            return;
        }

        if (onAction) {
            onAction();
            return;
        }

        navigate(-1);
    };

    const renderIconBackButton = () => {
        return (
            <CloseButton
                {...props}
                className={`${classes['icon-back-button']} ${className}`}
                onClick={handleGoBack}
            />
        );
    };

    const renderBackButton = () => {
        return (
            <Button
                {...props}
                className={`${classes['back-button']} ${className}`}
                onClick={handleGoBack}
            >
                <IoIosArrowBack />
                Regresar
            </Button>
        );
    };

    return <>{asIcon ? renderIconBackButton() : renderBackButton()}</>;
};

export default BackButton;
