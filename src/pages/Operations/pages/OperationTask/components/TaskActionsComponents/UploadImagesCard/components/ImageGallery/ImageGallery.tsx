import ConfirmationModal from '@components/ConfirmationModal';
import classes from './ImageGallery.module.scss';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Carousel, Modal, Spinner } from 'react-bootstrap';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useDeleteFileByIdMutation } from '@store/api/documentApi.slice';
import { appIsToasting } from '@store/AppState/appState.slice';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';

interface ImageFile extends File {
    photoId: number;
    preview?: string;
    photoName?: string;
    file_name?: string;
    gCloudStorageUrl?: string;
}

interface ImageGalleryProps {
    images: ImageFile[];
    canDelete?: boolean;
    onImagesChange?: (newImages: ImageFile[]) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onImagesChange, canDelete = true }) => {
    const dispatch = useAppDispatch();

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showImageModal, setShowImageModal] = useState<boolean>(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
    const imageIndexRef = useRef<number>(-1);
    const imageRef = useRef<ImageFile>();
    const [handleDeleteFileById, { isSuccess: isSuccessDeleteFileById }] = useDeleteFileByIdMutation();

    const [loadingStates, setLoadingStates] = useState(images.map(() => true));

    useEffect(() => {
        if (isSuccessDeleteFileById) {
            dispatch(
                appIsToasting({
                    message: 'Imagen borrada con exito',
                    show: true,
                    isError: false,
                }),
            );
        }
    }, [isSuccessDeleteFileById]);

    const handleImageLoad = (index: number) => {
        setLoadingStates((prevState) => {
            const newState = [...prevState];
            newState[index] = false;
            return newState;
        });
    };

    const handleSelect = (selectedIndex: number) => {
        setSelectedImageIndex(selectedIndex);
    };

    const handleShowImage = (index: number) => {
        setShowImageModal(true);
        setSelectedImageIndex(index);
    };

    const handleDeleteImage = (image: ImageFile, imageIndex: number) => {
        imageIndexRef.current = imageIndex;
        imageRef.current = image;

        if (image.gCloudStorageUrl) {
            setShowConfirmationModal(true);
            return;
        }

        handleRemoveImageLocally(imageIndex);
    };

    const handleRemoveImageLocally = (imageIndex: number) => {
        const updatedFiles = [...images];
        updatedFiles.splice(imageIndex, 1);
        onImagesChange!(updatedFiles);
    };

    const renderCarouselItems = () => {
        return images.map((image, index) => {
            return (
                <Carousel.Item key={index}>
                    <img
                        src={image.gCloudStorageUrl ? image.gCloudStorageUrl : image.preview}
                        alt={`Slide ${index}`}
                        className={classes.carouselImage}
                    />

                    <Carousel.Caption>
                        <h4>{image.name || image.photoName || image.file_name}</h4>
                    </Carousel.Caption>
                </Carousel.Item>
            );
        });
    };

    const onConfirmModal = () => {
        setShowConfirmationModal(false);

        const image = images[imageIndexRef.current];
        console.log('image', image);
        handleDeleteFileById(image.photoId);
        handleRemoveImageLocally(imageIndexRef.current);

        // if (images[imageIndexRef.current].gCloudStorageUrl) {
        // handleDeleteCloudFile();
        // return;
        // }
        // handleRemoveImageLocally(imageIndexRef.current);
    };

    const memoizedImages = useMemo(() => {
        return images.map((image, index) => (
            <div
                key={index}
                className={classes['image-wrapper']}
            >
                {loadingStates[index] && (
                    <div className={classes['spinner-overlay']}>
                        <Spinner
                            animation="border"
                            role="status"
                        />
                        <span className="visually-hidden">Loading...</span>
                    </div>
                )}

                <img
                    alt={image.name || 'Gallery Image'}
                    className={classes['gallery-image']}
                    src={image.gCloudStorageUrl ? image.gCloudStorageUrl : image.preview}
                    onLoad={() => handleImageLoad(index)} // Hide spinner once the image is loaded
                    // onError={(e) => {
                    //     e.target.src = '/path/to/fallback-image.jpg';
                    // }}
                />
                <div
                    className={classes['overlay']}
                    onClick={() => handleShowImage(index)}
                >
                    <Button
                        size="sm"
                        variant="danger"
                        hidden={!canDelete}
                        className={`siem-delete-icon-button ${classes['overlay-button']}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteImage(image, index);
                        }}
                    >
                        <RiDeleteBin6Line color="white" />
                    </Button>
                </div>
            </div>
        ));
    }, [images, handleShowImage, handleDeleteImage]);

    return (
        <>
            <div className={classes['gallery-container']}>{memoizedImages}</div>
            <Modal
                size="xl"
                centered
                show={showImageModal}
                onHide={() => setShowImageModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter" />
                </Modal.Header>
                <Modal.Body>
                    <div className={classes.carouselContainer}>
                        <Carousel
                            interval={null}
                            onSelect={handleSelect}
                            activeIndex={selectedImageIndex}
                            prevIcon={<span className={`carousel-control-prev-icon ${classes.carouselControl}`} />}
                            nextIcon={<span className={`carousel-control-next-icon ${classes.carouselControl}`} />}
                        >
                            {renderCarouselItems()}
                        </Carousel>
                    </div>
                </Modal.Body>
            </Modal>

            <ConfirmationModal
                onConfirm={onConfirmModal}
                show={showConfirmationModal}
                message={'¿Deseas borrar esta imagen?'}
                onCancel={() => setShowConfirmationModal(false)}
                body={
                    <img
                        alt={imageRef.current?.name || 'Gallery Image'}
                        className={classes['gallery-image']}
                        src={
                            imageRef.current?.gCloudStorageUrl
                                ? imageRef.current.gCloudStorageUrl
                                : imageRef.current?.preview
                        }
                    />
                }
            />
        </>
    );
};

export default ImageGallery;
