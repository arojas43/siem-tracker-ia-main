import { BackButton } from '@components/index';
import classes from './ClientOperationDocumentsPage.module.scss';
import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import { ClientDocumentsTable } from './components';

const ClientOperationDocumentsPage: FC = () => {
    const { operationCode } = useParams<{ operationCode: string }>();

    return (
        <div
            className={`tracker-page-container tracker-page-container__card`}
            style={{ gap: 0 }}
        >
            <div className={classes['client-operation-page__header']}>
                <BackButton />
            </div>
            <div>
                <ClientDocumentsTable operationCode={operationCode!} />
            </div>
        </div>
    );
};

export default ClientOperationDocumentsPage;
