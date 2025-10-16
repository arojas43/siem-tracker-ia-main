import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import { useEffect, type FC } from 'react';
import classes from './SuppliersPage.module.scss';
import SuppliersWidgetCard from './components/SuppliersWidgetCard';
import SuppliersTable from './components/SuppliersTable';
import FloatingChatButton from '@components/FloatingChatButton';

const SuppliersPage: FC = () => {
    const { setHeaderTitle } = usePageHeader();

    useEffect(() => {
        setHeaderTitle('Proveedores');
    }, []);

    return (
        <div className="tracker-page-container tracker-page-container__card">
            <div className={classes['suppliers-page__container']}>
                <div className={classes['suppliers-page__top']}>
                    <SuppliersWidgetCard />
                </div>
                <div className={classes['suppliers-page__bottom']}>{<SuppliersTable />}</div>
            </div>
            
            {/* Botón flotante de chat */}
            <FloatingChatButton />
        </div>
    );
};

export default SuppliersPage;
