import type { FC } from 'react';
import Button from 'react-bootstrap/esm/Button';
import classes from './SuccessOperationCreation.module.scss';
import successBackground from '@assets/images/Logistics_bg.jpg';
import success_operation from '@assets/images/success_operation.svg';
import Card from 'react-bootstrap/esm/Card';

interface SuccessOperationCreationProps {
    operationId: number | null;
    onReset: () => void;
}

const SuccessOperationCreation: FC<SuccessOperationCreationProps> = ({ operationId, onReset }) => {
    return (
        <Card style={{ padding: 30, backgroundColor: 'transparent', borderColor: 'transparent' }}>
            <div
                className={classes['success-container']}
                style={{ backgroundImage: `url(${successBackground})` }}
            >
                <div className={classes['success-overlay']} />
                <div className={classes['success-content']}>
                    <div className={classes['icon-container']}>
                        <img
                            src={success_operation}
                            alt="Operación exitosa"
                            className={classes['success-svgsample']}
                        />
                    </div>

                    <h2 className={classes['success-message']}>
                        ¡Tu operación # {operationId} se ha creado con éxito!
                    </h2>

                    <Button
                        className={classes['cta-button']}
                        onClick={onReset}
                    >
                        Crear otra operación
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default SuccessOperationCreation;
