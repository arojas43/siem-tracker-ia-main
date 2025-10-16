import { OPERATIONS_ENDPOINT } from '@store/api/api.types';
import classes from './PendingTasksCard.module.scss';
import { useMemo, type FC } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Card from 'react-bootstrap/esm/Card';
import Placeholder from 'react-bootstrap/esm/Placeholder';
import { useNavigate } from 'react-router-dom';

interface PendingTasksCardProps {
    pendingTasks: any[];
    isLoading: boolean;
}

const PendingTasksCard: FC<PendingTasksCardProps> = ({ pendingTasks, isLoading }) => {
    const navigate = useNavigate();
    const handleGoToTasks = () => {
        navigate('/tasks');
    };

    const loadingPendingTask = () => {
        return (
            <Placeholder
                as="p"
                animation="wave"
                style={{ display: 'flex', flexDirection: 'column', gap: 25 }}
            >
                <Placeholder xs={12} />
                <Placeholder xs={12} />
                <Placeholder xs={12} />
                <Placeholder xs={12} />
                <Placeholder xs={12} />
                <Placeholder xs={12} />
            </Placeholder>
        );
    };

    const handleGoToTask = (operation_code: string, phase_id: string) => {
        navigate(`${OPERATIONS_ENDPOINT}tasks?phaseId=${phase_id}&operationCode=${operation_code}`);
    };

    const renderPendingTasks = useMemo(() => {
        if (!pendingTasks.length) {
            return (
                <li>
                    <p>No hay tareas pendientes.</p>
                </li>
            );
        }

        return pendingTasks.map((task, index) => (
            <li key={index}>
                <p onClick={() => handleGoToTask(task.operation_code, task.phase_id)}>
                    #{task.reference} {task.operation_code}
                </p>
            </li>
        ));
    }, [pendingTasks]);
    return (
        <Card
            as="div"
            className={classes['pending-tasks-card']}
        >
            <Card.Title style={{ marginBottom: 20 }}>Tareas Pendientes</Card.Title>
            <Card.Text
                as="div"
                className={classes['pending-tasks-card__body']}
            >
                <div className={classes['pending-tasks-card__list']}>
                    <ul>{isLoading ? loadingPendingTask() : renderPendingTasks}</ul>
                </div>
                <Button
                    className={`siem-primary-button ${classes['pending-tasks-card__button']}`}
                    onClick={handleGoToTasks}
                >
                    Ver todas las tareas
                </Button>
            </Card.Text>
        </Card>
    );
};

export default PendingTasksCard;
