import classes from './CustomsWidgetCard.module.scss';
import type { FC } from 'react';
import Card from 'react-bootstrap/esm/Card';
import NewCustomButton from '../NewCustomButton';

const CustomsWidgetCard: FC = () => {
    return (
        <Card className={classes['custom-widget-card']}>
            <Card.Body
                as="div"
                className={classes['custom-widget-card__body']}
            >
                <div className={classes['custom-widget-card__w1']}>
                    <div className={classes['custom-widget-card__w1--b']}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Directorio de aduanas</div>
                    </div>
                </div>

                <div className={classes['custom-widget-card__w3']}>
                    <NewCustomButton style={{ width: '50%' }} />
                </div>
            </Card.Body>
        </Card>
    );
};

export default CustomsWidgetCard;
