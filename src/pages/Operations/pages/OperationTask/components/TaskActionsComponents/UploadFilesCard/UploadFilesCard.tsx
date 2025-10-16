import classes from './UploadFilesCard.module.scss';

import BackButton from '@components/BackButton';
import { Button, Spinner } from 'react-bootstrap';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { DocumentsTable, DragAndDrop, DocumentListGrid } from '../components';
import { useEffect, useRef, useState, type FC } from 'react';
import { appIsToasting } from '@store/AppState/appState.slice';
import { useUpdateTaskByIdMutation } from '@store/api/api.slice';
// import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import type { TaskActionFormProps, TaskDocument, TrackerFile } from '../TaskActionsComponents.types';

const VALID_FILE_TYPES = {
    'application/pdf': [],
    'application/vnd.ms-excel': [],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
};

const UploadFilesCard: FC<TaskActionFormProps> = ({ taskActionRequirements, taskId, onClose, showCard = false }) => {
    const dispatch = useAppDispatch();
    // const { setHeaderTitle } = usePageHeader();
    const { documentList, documentListSize } = taskActionRequirements!;
    const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);
    const [enableSubmitButton, setEnableSubmitButton] = useState<boolean>(false);

    const requiredFilesRef = useRef(new Map());
    const toastMessageRef = useRef<string>('');
    const dropdownItemsRef = useRef<TaskDocument[]>([]);

    // todo add type
    const [documents, setDocuments] = useState<any[]>([]);
    const [handleUpdateTaskById, { isSuccess: isSuccessUpdateTaskById, isLoading: isLoadingUpdateTaskById }] =
        useUpdateTaskByIdMutation();

    // useEffect(() => {
    //     setHeaderTitle(`Subir documentos`);
    // }, []);

    useEffect(() => {
        handleDocumentsAreMapped();
    }, [documents]);

    useEffect(() => {
        if (isSuccessUpdateTaskById) {
            dispatch(
                appIsToasting({
                    show: true,
                    isError: false,
                    message: toastMessageRef.current,
                }),
            );

            onClose(true);
        }
    }, [isSuccessUpdateTaskById]);

    useEffect(() => {
        if (documentList) {
            const dropdownItems: TaskDocument[] = [];
            const documents: any[] = [];

            documentList.forEach((document, index) => {
                if (document.required) {
                    requiredFilesRef.current.set(document.documentName, { isSet: !!document.gCloudStorageUrl });
                }

                if (document.gCloudStorageUrl) {
                    documents.push({
                        ...document,
                        dropdownIndex: index,
                        originalDocumentName: document.file_name,
                        dropDownSelectedName: document.documentName,
                    });
                }

                dropdownItems.push({
                    ...document,
                    selected: !!document.gCloudStorageUrl,
                });
            });

            dropdownItemsRef.current = dropdownItems;
            setDocuments(documents);
        }
    }, [documentList]);

    const handleDocumentsAreMapped = () => {
        let state = !!documents.length;

        for (let i = 0; i < documents.length; i++) {
            const document = documents[i];
            if (document.dropdownIndex === -1) {
                state = false;
            }
        }

        setEnableSaveButton(state);
    };

    const handleRenameDocuments = () => {
        const filesHolder: TrackerFile[] = [];

        documents.forEach((document) => {
            if (!document.gCloudStorageUrl) {
                const newFile = new File(
                    [document],
                    `${document.dropDownSelectedName}.${document.documentName.split('.').pop()?.toLowerCase()}`,
                );

                filesHolder.push(newFile as TrackerFile);
            }
        });

        return filesHolder;
    };

    /** FORM ACTIONS */

    const handleCancel = () => {
        onClose(true);
    };

    const handleSave = () => {
        toastMessageRef.current = 'Archivos guardados con exito';
        handleUpdateTask(true);
    };

    const handleSubmit = () => {
        toastMessageRef.current = 'Tarea finalizada con exito';
        handleUpdateTask(false);
    };

    const handleUpdateTask = (isSave: boolean) => {
        const renameDocuments = handleRenameDocuments();

        const formData = new FormData();

        renameDocuments.forEach((file) => {
            formData.append('files', file as File);
        });

        handleUpdateTaskById({
            taskId,
            isSave,
            body: formData,
        });
    };

    /** DOCUMENT ROW MAKER */
    const handleAddDocuments = (addedDocuments: TrackerFile[]) => {
        setDocuments((prevFiles) => [...prevFiles, ...addedDocuments]);
    };

    const handleDocumentChange = (newDocuments: any[]) => {
        setDocuments(newDocuments);
    };

    return (
        <div
            className={classes['upload-file-card']}
            hidden={!showCard}
        >
            <div className={classes['upload-file-card__header']}>
                <div className={classes['upload-file-card__header-title']}>
                    <h5 />
                    <BackButton
                        asIcon
                        onAction={onClose}
                        className={classes['upload-file-card__close-button']}
                    />
                </div>

                {/* <div style={{ paddingTop: 5, paddingBottom: 5 }}> */}
                <div>
                    <DocumentListGrid documentList={documentList ?? []} />
                </div>
            </div>
            <div className={classes['upload-file-card__body']}>
                <div>
                    <DragAndDrop
                        documentCount={documents.length}
                        onAddDocument={handleAddDocuments}
                        acceptedFileTypes={VALID_FILE_TYPES}
                        documentListSize={documentListSize!}
                    />
                    <div className={classes['tempo']}>
                        <DocumentsTable
                            documents={documents}
                            onDocumentChange={handleDocumentChange}
                            dropDownItems={dropdownItemsRef.current}
                            requiredFiles={requiredFilesRef.current}
                            onValidateRequiredFilesAreMapped={setEnableSubmitButton}
                        />
                    </div>
                </div>
            </div>
            <div className={classes['upload-file-card__footer']}>
                <div className={classes['upload-file-card__footer-button-group']}>
                    <Button
                        variant="secondary"
                        onClick={handleCancel}
                        className={classes['upload-file-card__footer-button']}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="outline-success"
                        disabled={!enableSaveButton}
                        className={`${classes['upload-file-card__footer-button']} siem-save-button`}
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
                    disabled={!enableSubmitButton}
                    className={`siem-primary-button ${classes['upload-file-card__footer-button']}`}
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

export default UploadFilesCard;
