import classes from './CheckboxOnYesTwoDatesDocumentUploadCard.module.scss';

import BackButton from '@components/BackButton';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { DocumentsTable, DragAndDrop, DocumentListGrid } from '../components';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { appIsToasting } from '@store/AppState/appState.slice';
import { useUpdateTaskByIdMutation } from '@store/api/api.slice';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
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

const OneDateCheckboxOnYesOneDateDocumentUploadCard: FC<TaskActionFormProps> = ({
    taskActionRequirements,
    taskId,
    onClose,
    showCard = false,
}) => {
    const dispatch = useAppDispatch();
    // const { setHeaderTitle } = usePageHeader();
    const { documentList, documentListSize } = taskActionRequirements!;
    const [firstDateValue, setFirstDateValue] = useState<string>(taskActionRequirements?.firstDateValue || '');
    const [secondDateValue, setSecondDateValue] = useState<string>(taskActionRequirements?.secondDateValue || '');
    const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);
    const [enableSubmitButton, setEnableSubmitButton] = useState<boolean>(false);
    const [checkboxValue, setCheckboxValue] = useState<string>('');

    const FormValidationDefaultState = {
        firstInputIsInvalid: false,
        secondInputIsInvalid: false,
    };
    // const [isFieldInvalid, setIsFieldInvalid] = useState<boolean>(false);
    const [formInputsValidator, setFormInputsValidator] = useState<TwoInputsValidation>(FormValidationDefaultState);

    const [areRequiredDocumentsMapped, setAreRequiredDocumentsMapped] = useState<boolean>(false);
    const requiredFilesRef = useRef(new Map());
    const toastMessageRef = useRef<string>('');
    const dropdownItemsRef = useRef<TaskDocument[]>([]);

    const [documents, setDocuments] = useState<any[]>([]);
    const [handleUpdateTaskById, { isSuccess: isSuccessUpdateTaskById, isLoading: isLoadingUpdateTaskById }] =
        useUpdateTaskByIdMutation();
    const isDateSubmitable = useMemo(() => {
        return !isFormDatesInvalid(
            { firstDateValue, secondDateValue },
            {
                firstDateRequired: taskActionRequirements?.firstDateRequired as boolean,
                secondDateRequired: taskActionRequirements?.secondDateRequired as boolean,
            },
        );
    }, [
        firstDateValue,
        secondDateValue,
        taskActionRequirements?.firstDateRequired,
        taskActionRequirements?.secondDateRequired,
    ]);

    useEffect(() => {
        let valueHolder = '';
        if (typeof taskActionRequirements?.checkboxValue === 'boolean') {
            valueHolder = taskActionRequirements?.checkboxValue ? 'si' : 'no';
        }
        setCheckboxValue(valueHolder);
    }, [taskActionRequirements?.checkboxValue]);

    /** HANDLE SAVE LOGIC */
    useEffect(() => {
        const areDocumentsMapped = handleAreDocumentsMapped(!!documents);

        if (checkboxValue === 'no') {
            setEnableSaveButton(true);
        }

        if (checkboxValue === 'si' && !areDocumentsMapped) {
            setEnableSaveButton(false);
        } else if ((checkboxValue === 'si' && !documents.length) || (checkboxValue === 'si' && areDocumentsMapped)) {
            setEnableSaveButton(true);
        }
    }, [firstDateValue, checkboxValue, documents]);

    /** HANDLE SAVE SUBMIT */
    useEffect(() => {
        setEnableSubmitButton(
            checkboxValue === 'no' || (checkboxValue === 'si' && isDateSubmitable && areRequiredDocumentsMapped),
        );
    }, [isDateSubmitable, checkboxValue, isDateSubmitable, document, areRequiredDocumentsMapped]);

    useEffect(() => {
        handleAreDocumentsMapped(!!documents.length);
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

    const handleAreDocumentsMapped = (state: boolean) => {
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
        toastMessageRef.current = 'Archivos guardados con exito';
        handleUpdateTask(true);
    };

    const handleSubmit = () => {
        const invalidFormDates = isFormDatesInvalid(
            { firstDateValue, secondDateValue },
            {
                firstDateRequired: taskActionRequirements?.firstDateRequired as boolean,
                secondDateValueRequired: taskActionRequirements?.secondDateRequired as boolean,
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

        const formData = new FormData();
        const renameDocuments = handleRenameDocuments();
        const taskActionData = {
            taskActionType: 'one_date_checkbox_onYes_one_date_doc_upload',
            taskActionRequirements: {
                firstDateValue: firstDateValue || null,
                secondDateValue: secondDateValue || null,
                checkboxValue: checkboxValue === 'si',
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

    // const handleInputChanged = (input: string) => {
    //     if (!input) {
    //         setFirstDateValue('');
    //         setIsFieldInvalid(true);
    //         return;
    //     }

    //     setFirstDateValue(input);
    //     setIsFieldInvalid(false);
    // };
    const handleInputChanged = (input: string, key: string) => {
        if (!input) {
            setFormInputsValidator((prev) => ({ ...prev, [key]: true }));
            return;
        }
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

                {/* CHECKBOX BLOCK */}
                <Form.Group
                    as={Row}
                    style={{ marginTop: 30, marginBottom: 30 }}
                >
                    <Form.Label
                        column
                        as="p"
                        style={{ fontSize: 17 }}
                    >
                        {taskActionRequirements?.checkboxLabel}
                    </Form.Label>
                    <Col
                        as="div"
                        className={classes['one_date_checkbox_onYes_comments__checkbox']}
                    >
                        <Form.Check
                            inline
                            label="Si"
                            name="checkboxValue"
                            type="radio"
                            value="si"
                            checked={checkboxValue === 'si'}
                            onChange={(e) => setCheckboxValue(e.target.value)}
                        />
                        <Form.Check
                            inline
                            label="No"
                            name="checkboxValue"
                            type="radio"
                            value="no"
                            checked={checkboxValue === 'no'}
                            onChange={(e) => setCheckboxValue(e.target.value)}
                        />
                    </Col>
                </Form.Group>

                {/* FIRST DATE BLOCK */}
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
                            disabled={checkboxValue !== 'si'}
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

                {/* SECOND DATE BLOCK */}
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
                            disabled={checkboxValue !== 'si'}
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
                        disabled={checkboxValue !== 'si'}
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

export default OneDateCheckboxOnYesOneDateDocumentUploadCard;
