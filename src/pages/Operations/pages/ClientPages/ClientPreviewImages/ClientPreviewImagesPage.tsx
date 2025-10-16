import React, { useEffect } from 'react';
import { BackButton } from '@components/index';
import { useParams } from 'react-router-dom';
import OperationImagesPage from '../../OperationImages/OperationImagesPage';
import classes from './ClientPreviewImagesPage.module.scss';

const ClientPreviewImagesPage: React.FC = () => {
    const { operationCode } = useParams<{ operationCode: string }>();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, []);

    return (
        <div
            className={`tracker-page-container tracker-page-container__card`}
            style={{ gap: 0 }}
        >
            <div className={classes['client-operation-page__header']}>
                <BackButton goToRoute={`/operations/client/${operationCode}`} />
            </div>
            <div className={classes['preview-images-container']}>
                <div className={classes['images-wrapper']}>
                    <OperationImagesPage />
                </div>
            </div>
        </div>
    );
};

export default ClientPreviewImagesPage;
