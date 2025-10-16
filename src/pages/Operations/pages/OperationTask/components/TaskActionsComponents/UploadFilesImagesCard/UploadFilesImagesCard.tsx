import classes from './UploadFilesImagesCard.module.scss';

import type { FC } from 'react';

const UploadFilesImagesCard: FC<any> = ({
    // taskActionRequirements,
    // taskId,
    // onClose,
    showCard = false,
}) => {
    return (
        <div
            className={classes['upload-file-card']}
            hidden={!showCard}
        >
            HOLA
        </div>
    );
};

export default UploadFilesImagesCard;
