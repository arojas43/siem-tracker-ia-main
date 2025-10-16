import { useParams } from 'react-router-dom';
import classes from './OperationDocumentsPage.module.scss';
import { DocumentsTable } from './components';

import type { FC } from 'react';

const OperationDocumentsPage: FC = () => {
    const { operationCode } = useParams<{ operationCode: string }>();

    return (
        <div className={`operation-page__container ${classes['operation-documents-page']}`}>
            <DocumentsTable operationCode={operationCode!} />
        </div>
    );
};

export default OperationDocumentsPage;
