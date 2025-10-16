import classes from './OperationImagesPage.module.css';

import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import ImageGallery from '../OperationTask/components/TaskActionsComponents/UploadImagesCard/components/ImageGallery';
import { useGetOperationImagesQuery } from '@store/api/documentApi.slice';

const OperationImagesPage: FC = () => {
    const { operationCode } = useParams<{ operationCode: string }>();
    const { data: images } = useGetOperationImagesQuery(
        { operationCode: operationCode! },
        { refetchOnMountOrArgChange: true },
    );

    return (
        <div className="operation-page__container">
            <div className={classes['operation-images']}>
                {images && images.length ? (
                    <ImageGallery
                        images={images}
                        canDelete={false}
                    />
                ) : (
                    <div className={classes['upload-photo-card__no-image']}>No hay imagenes para desplegar</div>
                )}
            </div>
        </div>
    );
};

export default OperationImagesPage;
