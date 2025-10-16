import classes from './NewClientPage.module.scss';
import { useEffect, type FC } from 'react';
import { useParams } from 'react-router-dom';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import ClientForm from './components/ClientForm';

const NewClientPage: FC = () => {
    const { setHeaderTitle } = usePageHeader();
    const { clientId } = useParams<{ clientId: string }>();

    useEffect(() => {
        if (clientId) {
            setHeaderTitle('Editar datos de cliente');
        } else {
            setHeaderTitle('Nuevo Cliente');
        }
    }, []);

    const NEW_CLIENT_CSS_CLASSES = `tracker-page-container__card ${classes['new-client-page']}`;
    const CLIENT_CSS_CLASSES = `tracker-page-container__card ${classes['new-client-page']}`;

    const cssClasses = clientId ? CLIENT_CSS_CLASSES : NEW_CLIENT_CSS_CLASSES;

    return (
        <div className={`tracker-page-container  ${cssClasses}`}>
            <ClientForm clientId={clientId} />
        </div>
    );
};

export default NewClientPage;
