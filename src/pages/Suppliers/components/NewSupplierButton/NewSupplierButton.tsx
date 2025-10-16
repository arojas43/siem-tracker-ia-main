import classes from './NewSupplierButton.module.scss';
import Button from 'react-bootstrap/esm/Button';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { ButtonHTMLAttributes, FC } from 'react';

interface NewSupplierButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const NewSupplierButton: FC<NewSupplierButtonProps> = ({ className, style }) => {
    const navigate = useNavigate();
    const handleGoToNewSupplier = () => {
        navigate('/suppliers/form');
    };
    return (
        <Button
            style={style}
            className={`${classes['new-supplier-button']} ${className}`}
            onClick={handleGoToNewSupplier}
        >
            <FaPlus className="me-2" />
            Nuevo Proveedor
        </Button>
    );
};

export default NewSupplierButton;
