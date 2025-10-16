import classes from './NewClientButton.module.scss';
import Button from 'react-bootstrap/esm/Button';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { ButtonHTMLAttributes, FC } from 'react';

interface NewClientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const NewClientButton: FC<NewClientButtonProps> = ({ className, style }) => {
    const navigate = useNavigate();
    const handleGoToNewClient = () => {
        navigate('/clients/form');
    };
    return (
        <Button
            style={style}
            className={`${classes['new-client-button']} ${className}`}
            onClick={handleGoToNewClient}
        >
            <FaPlus className="me-2" />
            Nuevo Cliente
        </Button>
    );
};

export default NewClientButton;
