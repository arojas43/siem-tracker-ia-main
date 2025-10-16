import classes from './HomePage.module.scss';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import { useEffect, type FC } from 'react';
import OperationsTable from '../Operations/components/OperationsTable';
import { ClientHomePageWidgetsCard, HomePageWidgetsCard } from './components';
import useUserType from '@hooks/userType.hooks';
import FloatingChatButton from '@components/FloatingChatButton';

const HomePage: FC = () => {
    const { setHeaderTitle } = usePageHeader();
    const { isClient, isSIEM } = useUserType();

    useEffect(() => {
        setHeaderTitle('Resumen general');
    }, []);

    return (
        <div className={classes['home-page']}>
            <div className={classes['operation-page__top']}>
                <div className={classes['widgets-container']}>
                    <div className={classes['main-widgets']}>
                        {isSIEM && <HomePageWidgetsCard />}
                        {isClient && <ClientHomePageWidgetsCard />}
                    </div>
                </div>
            </div>
            <div className={classes['operation-page__bottom']}>
                <OperationsTable style={{ height: '50vh' }} />
            </div>
            
            {/* Botón flotante de chat */}
            <FloatingChatButton />
        </div>
    );
};

export default HomePage;
