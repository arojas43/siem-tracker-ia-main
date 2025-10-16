import classes from './NewCustomButton.module.scss';
import Button from 'react-bootstrap/esm/Button';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { ButtonHTMLAttributes, FC } from 'react';

interface NewCustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const NewCustomButton: FC<NewCustomButtonProps> = ({ className, style }) => {
    const navigate = useNavigate();
    const handleGoToNewCustom = () => {
        navigate('/customs/form');
    };
    return (
        <Button
            style={style}
            className={`${classes['new-custom-button']} ${className}`}
            onClick={handleGoToNewCustom}
        >
            <FaPlus className="me-2" />
            Nueva Aduana
        </Button>
    );
};

export default NewCustomButton;
