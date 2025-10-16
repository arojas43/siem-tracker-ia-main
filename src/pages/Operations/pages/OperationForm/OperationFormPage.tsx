import classes from './OperationFormPage.module.scss';
import { useEffect, type FC } from 'react';
import OperationForm from './components/OperationForm';
import { useParams } from 'react-router-dom';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';

const OperationFormPage: FC = () => {
    const { setHeaderTitle } = usePageHeader();
    const { operationCode } = useParams<{ operationCode: string }>();

    useEffect(() => {
        if (!operationCode) {
            setHeaderTitle('Nueva Operación');
            return;
        }
    }, []);

    const NEW_OPERATION_CSS_CLASSES = `tracker-page-container__card ${classes['new-operation-page']}`;
    const OPERATION_CSS_CLASSES = `${classes['operation-page']}`;

    const cssClasses = operationCode ? OPERATION_CSS_CLASSES : NEW_OPERATION_CSS_CLASSES;

    return (
        <div className={`tracker-page-container  ${cssClasses}`}>
            <OperationForm operationCode={operationCode} />
        </div>
    );
};

export default OperationFormPage;
