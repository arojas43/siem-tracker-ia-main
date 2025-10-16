import classes from './TwoDatesUploadFilesCard.module.scss';

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

type TwoInputsValidation = {
    firstInputIsInvalid: boolean;
    secondInputIsInvalid: boolean;
};

const TwoDatesUploadFilesCard: FC<TaskActionFormProps> = ({
    taskActionRequirements,
    taskId,
    onClose,
    showCard = false,
}) => {
    const dispatch = useAppDispatch();
    const FormValidationDefaultState = {
        firstInputIsInvalid: false,
        secondInputIsInvalid: false,
    };
    // const { setHeaderTitle } = usePageHeader();
    const { documentList, documentListSize } = taskActionRequirements!;
    const [firstDateValue, setFirstDateValue] = useState<string>(taskActionRequirements?.firstDateValue || '');
    const [secondDateValue, setSecondDateValue] = useState<string>(taskActionRequirements?.secondDateValue || '');
    const [isDateBlockValid, setIsDateBlockValid] = useState<boolean>(false);

    const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);
    const [enableSubmitButton, setEnableSubmitButton] = useState<boolean>(false);

    const [formInputsValidator, setFormInputsValidator] = useState<TwoInputsValidation>(FormValidationDefaultState);

    const [areRequiredDocumentsMapped, setAreRequiredDocumentsMapped] = useState<boolean>(false);
    const requiredFilesRef = useRef(new Map());
    const toastMessageRef = useRef<string>('');
    const dropdownItemsRef = useRef<TaskDocument[]>([]);

    const isDateSubmitable = useMemo(() => {
        return !isFormDatesInvalid(
            { firstDateValue, secondDateValue },
            {
                firstDateRequired: taskActionRequirements?.firstDateRequired as boolean,
                secondDateRequired: taskActionRequirements?.secondDateRequired as boolean,
            },
        );
    }, [firstDateValue, secondDateValue, taskActionRequirements]);

    const [documents, setDocuments] = useState<any[]>([]);
    const [handleUpdateTaskById, { isSuccess: isSuccessUpdateTaskById, isLoading: isLoadingUpdateTaskById }] =
        useUpdateTaskByIdMutation();

    useEffect(() => {
        setIsDateBlockValid(isDateSubmitable);
    }, [isDateSubmitable]);

    useEffect(() => {
        const areDocumentsMapped = handleAreDocumentsMapped2();

        if (
            (!isDateBlockValid && !documents.length) ||
            (!isDateBlockValid && !areDocumentsMapped) ||
            (isDateBlockValid && !areDocumentsMapped)
        ) {
            setEnableSaveButton(false);
        } else if (
            (!isDateBlockValid && areDocumentsMapped) ||
            (isDateBlockValid && !documents.length) ||
            (isDateBlockValid && areDocumentsMapped)
        ) {
            setEnableSaveButton(true);
        }
    }, [isDateBlockValid, documents]);

    useEffect(() => {
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
        const invalidFormDates = isFormDatesInvalid(
            { firstDateValue, secondDateValue },
            {
                firstDateRequired: taskActionRequirements?.firstDateRequired as boolean,
                secondDateRequired: taskActionRequirements?.secondDateRequired as boolean,
            },
        );
        if (invalidFormDates) {
            const firstInputIsInvalid = !firstDateValue && !!taskActionRequirements?.firstDateRequired;
            const secondInputIsInvalid = !secondDateValue && !!taskActionRequirements?.secondDateRequired;
            setFormInputsValidator((prev) => ({ ...prev, firstInputIsInvalid, secondInputIsInvalid }));
            return;
        }
        toastMessageRef.current = 'Archivos guardados con exito';
        handleUpdateTask(true);
    };

    const handleSubmit = () => {
        const invalidFormDates = isFormDatesInvalid(
            { firstDateValue, secondDateValue },
            {
                firstDateRequired: taskActionRequirements?.firstDateRequired as boolean,
                secondDateRequired: taskActionRequirements?.secondDateRequired as boolean,
            },
        );
        if (invalidFormDates) {
            const firstInputIsInvalid = !firstDateValue && !!taskActionRequirements?.firstDateRequired;
            const secondInputIsInvalid = !secondDateValue && !!taskActionRequirements?.secondDateRequired;
            setFormInputsValidator((prev) => ({ ...prev, firstInputIsInvalid, secondInputIsInvalid }));
            return;
        }
        toastMessageRef.current = 'Tarea finalizada con exito';
        handleUpdateTask(false);
    };

    const handleUpdateTask = (isSave: boolean) => {
        setFormInputsValidator(FormValidationDefaultState);

        // if (!isFormValid()) {
        //     return;
        // }

        const formData = new FormData();
        const renameDocuments = handleRenameDocuments();

        const taskActionData = {
            taskActionType: 'two_dates_doc_upload',
            taskActionRequirements: {
                firstDateValue: firstDateValue || null,
                secondDateValue: secondDateValue || null,
            },
        };
        formData.append('data', JSON.stringify(taskActionData));

        renameDocuments.forEach((file) => {
            formData.append('files', file as File);
        });

        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });

        handleUpdateTaskById({
            taskId,
            isSave,
            body: formData,
        });
    };

    // const isFormValid = (): boolean => {
    //     setFormInputsValidator({
    //         firstInputIsInvalid: !firstDateValue,
    //         secondInputIsInvalid: !secondDateValue,
    //     });

    //     return !!firstDateValue && !!secondDateValue;
    // };

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

    // const handleInputChanged = (input: string) => {
    //     console.log('handleInputChanged input', input);
    //     if (!input) {
    //         setFirstDateValue('');
    //         // handleIfFormCanBeSave(input);
    //         setIsFieldInvalid(true);
    //         return;
    //     }

    //     // handleIfFormCanBeSave(input);
    //     setFirstDateValue(input);
    //     setIsFieldInvalid(false);
    // };

    const handleInputChanged = (input: string, key: string) => {
        console.log('input', input);
        if (!input) {
            // setFirstDateValue('');

            setFormInputsValidator((prev) => ({ ...prev, [key]: true }));
            return;
        }
        // setFirstDateValue(input);
        setFormInputsValidator((prev) => ({ ...prev, [key]: false }));
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
                            onChange={(event) => {
                                setFirstDateValue(event.currentTarget.value);
                                handleInputChanged(event.currentTarget.value, 'firstInputIsInvalid');
                            }}
                            isInvalid={formInputsValidator.firstInputIsInvalid}
                        />
                        <Form.Text
                            hidden={!formInputsValidator.firstInputIsInvalid}
                            muted
                        >
                            Este valor es requerido
                        </Form.Text>
                    </Col>
                </Form.Group>

                <Form.Group
                    as={Row}
                    className={classes['date-block']}
                >
                    <Form.Label
                        column
                        as="p"
                        style={{ fontSize: 17 }}
                    >
                        {taskActionRequirements?.secondDateLabel}
                    </Form.Label>
                    <Col>
                        <Form.Control
                            type="date"
                            name="secondDateValue"
                            defaultValue={secondDateValue}
                            onChange={(event) => {
                                setSecondDateValue(event.currentTarget.value);
                                handleInputChanged(event.currentTarget.value, 'secondInputIsInvalid');
                            }}
                            isInvalid={formInputsValidator.secondInputIsInvalid}
                        />
                        <Form.Text
                            hidden={!formInputsValidator.secondInputIsInvalid}
                            muted
                        >
                            Este valor es requerido
                        </Form.Text>
                    </Col>
                </Form.Group>

                {/* DOCUMENT BLOCK */}
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

export default TwoDatesUploadFilesCard;
