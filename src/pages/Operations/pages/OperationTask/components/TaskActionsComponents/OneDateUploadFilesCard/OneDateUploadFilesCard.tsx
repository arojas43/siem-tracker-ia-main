import classes from './OneDateUploadFilesCard.module.scss';

import BackButton from '@components/BackButton';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { DocumentsTable, DragAndDrop, DocumentListGrid } from '../components';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { appIsToasting } from '@store/AppState/appState.slice';
import { useUpdateTaskByIdMutation } from '@store/api/api.slice';
// import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import type { TaskActionFormProps, TaskDocument, TrackerFile } from '../TaskActionsComponents.types';
import { isFormDatesInvalid } from '@utils/isFormDatesInvalid';

const VALID_FILE_TYPES = {
    'application/pdf': [],
    'application/vnd.ms-excel': [],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
};

const OneDateUploadFilesCard: FC<TaskActionFormProps> = ({
    taskActionRequirements,
    taskId,
    onClose,
    showCard = false,
}) => {
    const dispatch = useAppDispatch();
    // const { setHeaderTitle } = usePageHeader();
    const { documentList, documentListSize } = taskActionRequirements!;
    const [firstDateValue, setFirstDateValue] = useState<string>(taskActionRequirements?.firstDateValue || '');
    const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);
    const [enableSubmitButton, setEnableSubmitButton] = useState<boolean>(false);

    const [isFieldInvalid, setIsFieldInvalid] = useState<boolean>(false);

    const [areRequiredDocumentsMapped, setAreRequiredDocumentsMapped] = useState<boolean>(false);
    const requiredFilesRef = useRef(new Map());
    const toastMessageRef = useRef<string>('');
    const dropdownItemsRef = useRef<TaskDocument[]>([]);

    const [documents, setDocuments] = useState<any[]>([]);
    const [handleUpdateTaskById, { isSuccess: isSuccessUpdateTaskById, isLoading: isLoadingUpdateTaskById }] =
        useUpdateTaskByIdMutation();

    const isDateSubmitable = useMemo(() => {
        return !isFormDatesInvalid(
            { firstDateValue },
            { firstDateRequired: taskActionRequirements?.firstDateRequired as boolean },
        );
    }, [firstDateValue, taskActionRequirements?.firstDateRequired]);

    useEffect(() => {
        const areDocumentsMapped = handleAreDocumentsMapped2();

        if (
            (!isDateSubmitable && !documents.length) ||
            (!isDateSubmitable && !areDocumentsMapped) ||
            (isDateSubmitable && !areDocumentsMapped)
        ) {
            setEnableSaveButton(false);
        } else if (
            (!isDateSubmitable && areDocumentsMapped) ||
            (isDateSubmitable && !documents.length) ||
            (isDateSubmitable && areDocumentsMapped)
        ) {
            setEnableSaveButton(true);
        }

        // if (!firstDateValue && !documents.length) {
        //     // console.log('No hay fecha y no hay documentos, entonces NO se puede guardar');
        //     setEnableSaveButton(false);
        // } else if (!firstDateValue && !areDocumentsMapped) {
        //     // console.log('No hay fecha y no están mapeados, entonces NO se puede guardar');
        //     setEnableSaveButton(false);
        // } else if (!firstDateValue && areDocumentsMapped) {
        //     // console.log('No hay fecha, pero están mapeados los documentos, entonces SI se puede guardar');
        //     setEnableSaveButton(true);
        // } else if (firstDateValue && !documents.length) {
        //     // console.log('Tiene fecha y no hay documentos, entonces SI se puede guardar');
        //     setEnableSaveButton(true);
        // } else if (firstDateValue && areDocumentsMapped) {
        //     // console.log('Tiene fecha y están mapeados, entonces SI se puede guardar');
        //     setEnableSaveButton(true);
        // } else {
        //     // console.log('Tiene fecha, pero no están mapeados, entonces NO se puede guardar');
        //     setEnableSaveButton(false);
        // }
    }, [isDateSubmitable, documents]);

    useEffect(() => {
        // if (firstDateValue && areRequiredDocumentsMapped) {
        //     setEnableSubmitButton(true);
        // } else {
        //     setEnableSubmitButton(false);
        // }

        setEnableSubmitButton(isDateSubmitable && areRequiredDocumentsMapped);
    }, [document, isDateSubmitable, areRequiredDocumentsMapped]);

    useEffect(() => {
        handleAreDocumentsMapped();
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

    const handleAreDocumentsMapped = () => {
        let state = !!documents.length;

        for (let i = 0; i < documents.length; i++) {
            const document = documents[i];
            if (document.dropdownIndex === -1) {
                state = false;
            }
        }
        // setEnableSaveButton(state);
        return state;
    };

    const handleAreDocumentsMapped2 = () => {
        let state = !!documents;

        for (let i = 0; i < documents.length; i++) {
            const document = documents[i];

            if (document.dropdownIndex === -1) {
                state = false;
            }
        }

        return state;
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
        if (!isDateSubmitable) {
            setIsFieldInvalid(true);
            return;
        }
        toastMessageRef.current = 'Archivos guardados con exito';
        handleUpdateTask(true);
    };

    const handleSubmit = () => {
        if (!isDateSubmitable) {
            setIsFieldInvalid(true);
            return;
        }
        toastMessageRef.current = 'Tarea finalizada con exito';
        handleUpdateTask(false);
    };

    const handleUpdateTask = (isSave: boolean) => {
        setIsFieldInvalid(false);

        const formData = new FormData();
        const renameDocuments = handleRenameDocuments();
        const taskActionData = {
            taskActionType: 'one_date_doc_upload',
            taskActionRequirements: {
                firstDateValue: firstDateValue || null,
            },
        };
        formData.append('data', JSON.stringify(taskActionData));

        renameDocuments.forEach((file) => {
            formData.append('files', file as File);
        });

        // formData.forEach((value, key) => {
        //     console.log(`${key}: ${value}`);
        // });

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

    // const handleIfFormCanBeSave = (input: string) => {
    //     console.log('!!input', !!input);
    //     console.log('handleAreDocumentsMapped2', handleAreDocumentsMapped2());
    //     console.log('!!input && handleAreDocumentsMapped2()', !!input && handleAreDocumentsMapped2());
    //     setEnableSaveButton(!!input && handleAreDocumentsMapped2());
    // };

    const handleInputChanged = (input: string) => {
        console.log('handleInputChanged input', input);
        if (!input) {
            setFirstDateValue('');
            // handleIfFormCanBeSave(input);
            setIsFieldInvalid(true);
            return;
        }

        // handleIfFormCanBeSave(input);
        setFirstDateValue(input);
        setIsFieldInvalid(false);
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
                {/* DATE BLOCK */}
                <Form.Group
                    as={Row}
                    className={classes['date-block']}
                >
                    <Form.Label
                        column
                        as="p"
                        style={{ fontSize: 17 }}
                    >
                        {taskActionRequirements?.firstDateLabel}
                    </Form.Label>
                    <Col>
                        <Form.Control
                            type="date"
                            name="firstDateValue"
                            defaultValue={firstDateValue}
                            onChange={(event) => handleInputChanged(event.currentTarget.value)}
                            isInvalid={isFieldInvalid}
                        />
                        <Form.Text
                            hidden={!isFieldInvalid}
                            muted
                        >
                            Este valor es requerido
                        </Form.Text>
                    </Col>
                </Form.Group>

                {/* DOCUMENT BLOCK */}
                <div>
                    <DocumentListGrid documentList={documentList || []} />
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
                    <DocumentsTable
                        documents={documents}
                        onDocumentChange={handleDocumentChange}
                        dropDownItems={dropdownItemsRef.current}
                        requiredFiles={requiredFilesRef.current}
                        onValidateRequiredFilesAreMapped={setAreRequiredDocumentsMapped}
                    />
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

export default OneDateUploadFilesCard;
