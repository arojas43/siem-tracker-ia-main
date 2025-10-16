import classes from './UploadImagesCard.module.scss';

import BackButton from '@components/BackButton';
import { Button, Spinner } from 'react-bootstrap';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { DragAndDrop } from '../components';
import { useEffect, useRef, useState, type FC } from 'react';
import { appIsToasting } from '@store/AppState/appState.slice';
import { useUpdateTaskByIdMutation } from '@store/api/api.slice';
// import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import type { TaskActionFormProps, TrackerFile } from '../TaskActionsComponents.types';
import ImageGallery from './components/ImageGallery';

const VALID_IMAGE_TYPES = {
    'image/png': [],
    'image/jpg': [],
    'image/jpeg': [],
};

const UploadImagesCard: FC<TaskActionFormProps> = ({ taskActionRequirements, taskId, onClose, showCard = false }) => {
    const dispatch = useAppDispatch();
    // const { setHeaderTitle } = usePageHeader();

    const { images: taskImages } = taskActionRequirements!;
    // const requiredFilesRef = useRef(new Map());
    const toastMessageRef = useRef<string>('');
    // const dropdownItemsRef = useRef<TaskDocument[]>([]);

    // todo add type
    const [images, setImages] = useState<any[]>([]);

    const [handleUpdateTaskById, { isSuccess: isSuccessUpdateTaskById, isLoading: isLoadingUpdateTaskById }] =
        useUpdateTaskByIdMutation();

    // useEffect(() => {
    //     setHeaderTitle(`Subir fotos`);
    // }, []);

    // // todo aqui quitar
    // useEffect(() => {
    //     handleDocumentsAreMapped();
    // }, [documents]);

    useEffect(() => {
        if (isSuccessUpdateTaskById) {
            handleSuccessfulUpdate();
        }
    }, [isSuccessUpdateTaskById]);

    const handleSuccessfulUpdate = () => {
        dispatch(
            appIsToasting({
                show: true,
                isError: false,
                message: toastMessageRef.current,
            }),
        );

        onClose(true);
    };

    useEffect(() => {
        if (taskImages) {
            const imagesHolder: any[] = [];

            taskImages.forEach((image) => {
                // if (document.required) {
                //     requiredFilesRef.current.set(document.documentName, { isSet: !!document.gCloudStorageUrl });
                // }

                if (image.gCloudStorageUrl) {
                    imagesHolder.push({
                        ...image,
                        // originalDocumentName: document.file_name,
                    });
                }
            });
            setImages(imagesHolder);
        }
    }, [taskImages]);

    // todo aqui quitar
    // const handleDocumentsAreMapped = () => {
    //     let state = !!documents.length;

    //     for (let i = 0; i < documents.length; i++) {
    //         const document = documents[i];
    //         if (document.dropdownIndex === -1) {
    //             state = false;
    //         }
    //     }

    //     setEnableSaveButton(state);
    // };

    // todo aqui quitar?
    // const handleRenameDocuments = () => {
    //     const filesHolder: TrackerFile[] = [];

    //     documents.forEach((document) => {
    //         if (!document.gCloudStorageUrl) {
    //             const newFile = new File(
    //                 [document],
    //                 `${document.dropDownSelectedName}.${document.documentName.split('.').pop()?.toLowerCase()}`,
    //             );

    //             filesHolder.push(newFile as TrackerFile);
    //         }
    //     });

    //     return filesHolder;
    // };

    /** FORM ACTIONS */

    const handleCancel = () => {
        onClose(true);
    };

    const handleSave = () => {
        toastMessageRef.current = 'Imagenes guardadas con exito';
        handleUpdateTask(true);
    };

    const handleSubmit = () => {
        toastMessageRef.current = 'Tarea finalizada con exito';
        handleUpdateTask(false);
    };

    const handleFilterImages = () => {
        return images.filter((item) => item instanceof File);
    };

    const handleUpdateTask = (isSave: boolean) => {
        const filterImages = handleFilterImages();
        const formData = new FormData();

        // if (!filterImages.length) {
        //     handleSuccessfulUpdate();
        //     return;
        // }

        filterImages.forEach((image) => {
            formData.append('files', image as File);
        });

        formData.forEach((value, key) => {
            console.log(`${key}:`, value);
        });

        handleUpdateTaskById({
            taskId,
            isSave,
            body: formData,
        });
    };

    /** DOCUMENT ROW MAKER */
    const handleAddImages = (addedImages: TrackerFile[]) => {
        setImages((prevFiles) => [...prevFiles, ...addedImages]);
    };

    const handleImagesChange = (newImages: any[]) => {
        setImages(newImages);
    };

    return (
        <div
            className={classes['upload-image-card']}
            hidden={!showCard}
        >
            <div className={classes['upload-image-card__header']}>
                <div className={classes['upload-image-card__header-title']}>
                    <h5 />
                    <BackButton
                        asIcon
                        onAction={onClose}
                        className={classes['upload-image-card__close-button']}
                    />
                </div>
            </div>
            <div className={classes['upload-image-card__body']}>
                <div>
                    <DragAndDrop
                        documentCount={10_000}
                        documentListSize={10_000}
                        onAddImages={handleAddImages}
                        acceptedFileTypes={VALID_IMAGE_TYPES}
                    />

                    <div className={classes['upload-photo-card__gallery-container']}>
                        {images.length ? (
                            <ImageGallery
                                images={images}
                                onImagesChange={handleImagesChange}
                            />
                        ) : (
                            <div className={classes['upload-photo-card__no-image']}>No hay imagenes para desplegar</div>
                        )}
                    </div>
                </div>
            </div>
            <div className={classes['upload-image-card__footer']}>
                <div className={classes['upload-image-card__footer-button-group']}>
                    <Button
                        variant="secondary"
                        onClick={handleCancel}
                        className={classes['upload-image-card__footer-button']}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="outline-success"
                        disabled={!images.length}
                        className={`${classes['upload-image-card__footer-button']} siem-save-button`}
                    >
                        {isLoadingUpdateTaskById && (
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                style={{ marginRight: 20 }}
                            />
                        )}
                        Guardar
                    </Button>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={!images.length}
                    className={`siem-primary-button ${classes['upload-image-card__footer-button']}`}
                >
                    {isLoadingUpdateTaskById && (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            style={{ marginRight: 20 }}
                        />
                    )}
                    Finalizar Tarea
                </Button>
            </div>
        </div>
    );
};

export default UploadImagesCard;
