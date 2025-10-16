import { useEffect, type FC } from 'react';
import classes from './OperationsPage.module.scss';
import OperationsTable from './components/OperationsTable';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import OperationsWidgetCard from './components/OperationsWidgetCard';
import useUserType from '@hooks/userType.hooks';
import { ClientOperationsWidgetCard } from './components';
import FloatingChatButton from '@components/FloatingChatButton';

const OperationsPage: FC = () => {
    const { isSIEM, isClient } = useUserType();
    const { setHeaderTitle } = usePageHeader();

    useEffect(() => {
        setHeaderTitle('Operaciones');
    }, []);

    return (
        <div className={classes['operation-page__container']}>
            <div className={classes['operation-page__top']}>
                {isSIEM && <OperationsWidgetCard />}
                {isClient && <ClientOperationsWidgetCard />}
            </div>
            <div className={classes['operation-page__bottom']}>
                <OperationsTable />
            </div>
            
            {/* Botón flotante de chat */}
            <FloatingChatButton />
        </div>
    );
};

export default OperationsPage;
