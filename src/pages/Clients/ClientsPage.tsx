import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import { useEffect, type FC } from 'react';
import classes from './ClientsPage.module.scss';
import ClientsWidgetCard from './components/ClientsWidgetCard';
import ClientsTable from './components/ClientsTable';
import FloatingChatButton from '@components/FloatingChatButton';

const ClientsPage: FC = () => {
    const { setHeaderTitle } = usePageHeader();

    useEffect(() => {
        setHeaderTitle('Clientes');
    }, []);

    return (
        <div className="tracker-page-container tracker-page-container__card">
            <div className={classes['client-page__container']}>
                <div className={classes['client-page__top']}>
                    <ClientsWidgetCard />
                </div>
                <div className={classes['client-page__bottom']}>{<ClientsTable />}</div>
            </div>
            
            {/* Botón flotante de chat */}
            <FloatingChatButton />
        </div>
    );
};

export default ClientsPage;
