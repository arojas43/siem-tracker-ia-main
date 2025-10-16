import classes from './OperationInfoPage.module.scss';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';

import { useEffect, type FC } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { OperationNavTabs } from '../../components';

const OperationInfoPage: FC = () => {
    const { operationCode } = useParams<{ operationCode: string }>();
    const { setHeaderTitle } = usePageHeader();

    useEffect(() => {
        setHeaderTitle(`Operacion #${operationCode}`);
    }, []);

    return (
        <div className={classes['operation-info']}>
            <OperationNavTabs />
            <div className={classes['operation-info__container']}>
                <Outlet />
            </div>
        </div>
    );
};

export default OperationInfoPage;
