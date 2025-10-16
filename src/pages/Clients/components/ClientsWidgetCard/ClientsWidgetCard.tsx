import classes from './ClientsWidgetCard.module.scss';
import type { FC } from 'react';
import Card from 'react-bootstrap/esm/Card';
import NewClientButton from '../NewClientButton';

const ClientsWidgetCard: FC = () => {
    return (
        <Card className={classes['client-widget-card']}>
            <Card.Body
                as="div"
                className={classes['client-widget-card__body']}
            >
                <div className={classes['client-widget-card__w1']}>
                    <div className={classes['client-widget-card__w1--b']}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Directorio de clientes</div>
                    </div>
                </div>

                <div className={classes['client-widget-card__w3']}>
                    <NewClientButton style={{ width: '50%' }} />
                </div>
            </Card.Body>
        </Card>
    );
};

export default ClientsWidgetCard;
