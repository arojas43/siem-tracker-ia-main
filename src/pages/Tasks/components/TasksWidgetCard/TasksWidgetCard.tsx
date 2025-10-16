import classes from './TasksWidgetCard.module.scss';
import type { FC } from 'react';
import Card from 'react-bootstrap/esm/Card';

const TasksWidgetCard: FC = () => {
    return (
        <Card className={classes['tasks-widget-card']}>
            <Card.Body
                as="div"
                className={classes['tasks-widget-card__body']}
            >
                <div className={classes['tasks-widget-card__w1']}>
                    <div className={classes['tasks-widget-card__w1--b']}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Mis tareas activas</div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default TasksWidgetCard;
