import classes from './DragAndDrop.module.scss';
import { type FC } from 'react';
import Button from 'react-bootstrap/esm/Button';
import { useDropzone } from 'react-dropzone';
import { IoCloudUploadOutline } from 'react-icons/io5';
import type { FileTypeMap, TrackerFile } from '../../TaskActionsComponents.types';

interface DragAndDropProps {
    documentCount: number;
    documentListSize: number;
    acceptedFileTypes: FileTypeMap;
    disabled?: boolean;
    // todo add type
    onAddImages?: (addedImages: any[]) => void;
    onAddDocument?: (addedDocuments: TrackerFile[]) => void;
}

const DragAndDrop: FC<DragAndDropProps> = ({
    documentCount,
    documentListSize,
    acceptedFileTypes,
    disabled = false,
    onAddDocument,
    onAddImages,
}) => {
    const getFileType = (fileName: string): string => {
        return fileName.split('.').pop()!.toLowerCase();
    };
    const { getRootProps, getInputProps } = useDropzone({
        disabled: disabled,
        maxFiles: documentListSize,
        accept: acceptedFileTypes,
        onDropRejected: () => {
            // todo ver como customizar esto
            alert(
                `Solo archivos PDF, XLS y/o XLSX son permitidos. Maximo ${documentListSize} ${documentListSize === 1 ? 'archivo' : 'archivos'}.`,
            );
        },
        onDrop: (acceptedDocuments) => {
            const imageArray: File[] = [];
            const documentsArray: TrackerFile[] = [];

            acceptedDocuments.forEach((acceptedDocument: File) => {
                const fileType = getFileType(acceptedDocument.name);
                //application/pdf
                if (fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg') {
                    imageArray.push(acceptedDocument);
                } else {
                    documentsArray.push(acceptedDocument as TrackerFile);
                }
            });

            console.log('imageArray', imageArray);
            console.log('documentsArray', documentsArray);

            if (documentsArray.length > documentListSize || documentsArray.length + documentCount > documentListSize) {
                alert(`Maximo numero de archivos es: ${documentListSize}.`);
                return;
            }

            if (onAddImages) {
                const formattedImages = imageArray.map((file) => {
                    return Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    });
                });
                onAddImages(formattedImages);
            }
            if (onAddDocument) {
                const formattedDocuments = documentsArray.map((file) => {
                    return Object.assign(file, {
                        dropdownIndex: -1,
                        documentName: file.name,
                        dropDownSelectedName: '',
                        originalDocumentName: file.name,
                    });
                });

                onAddDocument(formattedDocuments);
            }
        },
    });

    return (
        <div {...getRootProps({ className: classes['dropzone'] })}>
            <input {...getInputProps()} />
            <IoCloudUploadOutline size={100} />
            <p>Arrastra tus archivos aquí</p>
            <p>o</p>
            <Button
                disabled={disabled}
                className="siem-primary-button"
            >
                Elige archivos desde tu computadora
            </Button>
        </div>
    );
};

export default DragAndDrop;
