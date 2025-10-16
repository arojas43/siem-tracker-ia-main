import classes from './OneDateCommentCheckboxCard.module.scss';

import Col from 'react-bootstrap/esm/Col';
import { useEffect, useMemo, useState, type FC } from 'react';
import Form from 'react-bootstrap/esm/Form';
import Row from 'react-bootstrap/esm/Row';
import Button from 'react-bootstrap/esm/Button';
import Spinner from 'react-bootstrap/esm/Spinner';
import type { TaskActionFormProps } from '../TaskActionsComponents.types';
import { useUpdateTaskByIdMutation } from '@store/api/api.slice';
import { appIsToasting } from '@store/AppState/appState.slice';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { isFormDatesInvalid } from '@utils/isFormDatesInvalid';

type TwoInputsValidation = {
    firstInputIsInvalid: boolean;
    secondInputIsInvalid: boolean;
};

const OneDateCommentCheckboxCard: FC<TaskActionFormProps> = ({ onClose, taskId, taskActionRequirements }) => {
    const dispatch = useAppDispatch();

    const FormValidationDefaultState = {
        firstInputIsInvalid: false,
        secondInputIsInvalid: false,
    };
    const [formInputsValidator, setFormInputsValidator] = useState<TwoInputsValidation>(FormValidationDefaultState);
    const [commentValue, setCommentValue] = useState<string>(taskActionRequirements?.commentValue || '');

    const [checkboxValue, setCheckboxValue] = useState<string>('');
    const [firstDateValue, setFirstDateValue] = useState<string>(taskActionRequirements?.firstDateValue || '');

    const [canSubmit, setCanSubmit] = useState<boolean>(false);

    const [
        handleUpdateTaskById,
        { isSuccess: isSuccessUpdateTaskById, isLoading: isLoadingUpdateTaskById, isError: isErrorUpdateTaskById },
    ] = useUpdateTaskByIdMutation();
    const isDateSubmitable = useMemo(() => {
        return !isFormDatesInvalid(
            { firstDateValue },
            { firstDateRequired: taskActionRequirements?.firstDateRequired as boolean },
        );
    }, [firstDateValue, taskActionRequirements]);

    useEffect(() => {
        let valueHolder = '';
        if (typeof taskActionRequirements?.checkboxValue === 'boolean') {
            valueHolder = taskActionRequirements?.checkboxValue ? 'si' : 'no';
        }
        setCheckboxValue(valueHolder);
    }, [taskActionRequirements?.checkboxValue]);

    useEffect(() => {
        if (checkboxValue && isDateSubmitable && commentValue) {
            setCanSubmit(true);
            return;
        }
        setCanSubmit(false);
    }, [checkboxValue, isDateSubmitable, commentValue]);

    useEffect(() => {
        if (isSuccessUpdateTaskById) {
            dispatch(
                appIsToasting({
                    show: true,
                    isError: false,
                    message: 'Tarea finalizada con exito',
                }),
            );

            onClose(true);
        }

        if (isErrorUpdateTaskById) {
            dispatch(
                appIsToasting({
                    show: true,
                    isError: true,
                    message: 'Error al tratar de finalizar la tarea.',
                }),
            );
        }
    }, [isSuccessUpdateTaskById, isErrorUpdateTaskById]);

    const handleSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormInputsValidator(FormValidationDefaultState);

        const formDataHolder = new FormData(event.currentTarget);
        // const formDataValues = Object.fromEntries(formDataHolder.entries());

        // if (!isFormValid(formDataValues as TaskActionRequirements)) {
        //     return;
        // }

        //
        const taskActionData = {
            taskActionType: 'checkbox_onYes_date_1_comments',
            taskActionRequirements: {
                commentValue: formDataHolder.get('commentValue') as string,
                firstDateValue: (formDataHolder.get('firstDateValue') as string) || null,
                checkboxValue: (formDataHolder.get('checkboxValue') as string) === 'si',
            },
        };

        const formData = new FormData();

        formData.append('data', JSON.stringify(taskActionData));
        // formData.forEach((value, key) => {
        //     console.log(`${key}: ${value}`);
        // });
        handleUpdateTaskById({
            taskId,
            isSave: false,
            body: formData,
        });
    };

    // const isFormValid = ({ firstFieldValue, commentValue }: TaskActionRequirements): boolean => {
    //     setFormInputsValidator({
    //         firstInputIsInvalid: !firstFieldValue,
    //         secondInputIsInvalid: !commentValue,
    //     });

    //     return !!firstFieldValue && !!commentValue;
    // };

    const handleInputChanged = (input: string, key: string) => {
        if (!input) {
            setFormInputsValidator((prev) => ({ ...prev, [key]: true }));
            return;
        }
        setFormInputsValidator((prev) => ({ ...prev, [key]: false }));
    };

    return (
        <>
            {/* 
            <h5 style={{ paddingLeft: 20, paddingBottom: 10 }}>
                Revisar disponibilidad de unidades para la asignación de transporte
            </h5> 
            */}
            <Form
                onSubmit={handleSubmitForm}
                className={classes['one_date_checkbox_onYes_comments__form']}
            >
                <Form.Group as={Row}>
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
                            // value={firstDateValue || ''}
                            defaultValue={firstDateValue}
                            onChange={({ currentTarget: { value } }) => {
                                console.log('HERE');
                                setFirstDateValue(value);
                                handleInputChanged(value, 'firstInputIsInvalid');
                            }}
                            isInvalid={formInputsValidator.firstInputIsInvalid}
                        />
                        <Form.Text
                            muted
                            hidden={!formInputsValidator.firstInputIsInvalid}
                        >
                            Este valor es requerido
                        </Form.Text>
                    </Col>
                </Form.Group>

                <Form.Group as={Row}>
                    <Form.Label
                        column
                        as="p"
                        style={{ fontSize: 17 }}
                    >
                        Comentarios
                    </Form.Label>
                    <Col>
                        <Form.Control
                            as="textarea"
                            name="commentValue"
                            value={commentValue}
                            // defaultValue={commentValue}
                            onChange={({ currentTarget: { value } }) => {
                                console.log('HERE');
                                setCommentValue(value);
                                handleInputChanged(value, 'secondInputIsInvalid');
                            }}
                            isInvalid={formInputsValidator.secondInputIsInvalid}
                        />
                        <Form.Text
                            muted
                            hidden={!formInputsValidator.secondInputIsInvalid}
                        >
                            Este valor es requerido
                        </Form.Text>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
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
                <div className={classes['one_date_checkbox_onYes_comments__footer']}>
                    <Button
                        disabled={!canSubmit}
                        type="submit"
                        className={`siem-primary-button ${classes['one_date_checkbox_onYes_comments__button']}`}
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
                        Finalizar
                    </Button>
                </div>
            </Form>
        </>
    );
};

export default OneDateCommentCheckboxCard;
