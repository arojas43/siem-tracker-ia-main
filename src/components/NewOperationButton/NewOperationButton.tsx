import classes from './NewOperationButton.module.scss';
import Button from 'react-bootstrap/esm/Button';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { ButtonHTMLAttributes, FC } from 'react';

interface NewOperationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const NewOperationButton: FC<NewOperationButtonProps> = ({ className, style }) => {
    const navigate = useNavigate();
    const handleGoToNewOperation = () => {
        navigate('/operations/form');
    };
    return (
        <Button
            style={style}
            className={`${classes['new-operation-button']} ${className}`}
            onClick={handleGoToNewOperation}
        >
            <FaPlus className="me-2" />
            Nueva Operacion
        </Button>
    );
};

export default NewOperationButton;
