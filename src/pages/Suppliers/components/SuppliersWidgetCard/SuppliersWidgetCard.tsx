import classes from './SuppliersWidgetCard.module.scss';
import type { FC } from 'react';
import Card from 'react-bootstrap/esm/Card';
import NewSupplierButton from '../NewSupplierButton';

const SuppliersWidgetCard: FC = () => {
    return (
        <Card className={classes['suppliers-widget-card']}>
            <Card.Body
                as="div"
                className={classes['suppliers-widget-card__body']}
            >
                <div className={classes['suppliers-widget-card__w1']}>
                    <div className={classes['suppliers-widget-card__w1--b']}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Directorio de proveedores</div>
                    </div>
                </div>

                <div className={classes['suppliers-widget-card__w3']}>
                    <NewSupplierButton style={{ width: '50%' }} />
                </div>
            </Card.Body>
        </Card>
    );
};

export default SuppliersWidgetCard;
