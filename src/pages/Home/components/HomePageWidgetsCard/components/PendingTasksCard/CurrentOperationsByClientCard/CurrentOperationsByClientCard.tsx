import type { OperationByClient } from '@store/api/api.types';
import classes from './CurrentOperationsByClientCard.module.scss';
import { useMemo, type FC } from 'react';
import Card from 'react-bootstrap/esm/Card';
import Placeholder from 'react-bootstrap/esm/Placeholder';

interface CurrentOperationsByClientCardProps {
    isLoading: boolean;
    operationsByClient: OperationByClient[];
}

const CurrentOperationsByClientCard: FC<CurrentOperationsByClientCardProps> = ({ isLoading, operationsByClient }) => {
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

    const renderOperationsByClient = useMemo(() => {
        if (!operationsByClient.length) {
            return (
                <li>
                    <p>No hay operaciones.</p>
                </li>
            );
        }

        return operationsByClient.map((operation, index) => (
            <li key={index}>
                <p>{operation.name}</p>
                <strong style={{ fontSize: 20 }}>{operation.total}</strong>
            </li>
        ));
    }, [operationsByClient]);
    return (
        <Card
            as="div"
            className={classes['current-operation-by-client-card']}
        >
            <Card.Title
                as="h5"
                style={{ marginBottom: 20, textAlign: 'center' }}
            >
                Acumulado de Operaciones
            </Card.Title>
            <Card.Text
                as="div"
                className={classes['current-operation-by-client-card__body']}
            >
                <div className={classes['pending-tasks-card__list']}>
                    <ul>{isLoading ? loadingPendingTask() : renderOperationsByClient}</ul>
                </div>
            </Card.Text>
        </Card>
    );
};

export default CurrentOperationsByClientCard;
