import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import { useEffect, type FC } from 'react';
import classes from './CustomsPage.module.scss';
import CustomsWidgetCard from './components/CustomsWidgetCard';
import CustomsTable from './components/CustomsTable';
import FloatingChatButton from '@components/FloatingChatButton';

const CustomsPage: FC = () => {
    const { setHeaderTitle } = usePageHeader();

    useEffect(() => {
        setHeaderTitle('Aduanas');
    }, []);

    return (
        <div className="tracker-page-container tracker-page-container__card">
            <div className={classes['customs-page__container']}>
                <div className={classes['customs-page__top']}>
                    <CustomsWidgetCard />
                </div>
                <div className={classes['customs-page__bottom']}>{<CustomsTable />}</div>
            </div>
            
            {/* Botón flotante de chat */}
            <FloatingChatButton />
        </div>
    );
};

export default CustomsPage;
