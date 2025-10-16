// todo handle error on form
import classes from './ThreeFieldActionForm.module.scss';

import Col from 'react-bootstrap/esm/Col';
import { useEffect, useState, type FC } from 'react';
import Form from 'react-bootstrap/esm/Form';
import Row from 'react-bootstrap/esm/Row';
import Button from 'react-bootstrap/esm/Button';
import Spinner from 'react-bootstrap/esm/Spinner';
import type { TaskActionFormProps, TaskActionRequirements } from '../TaskActionsComponents.types';
import { useUpdateTaskByIdMutation } from '@store/api/api.slice';
import { appIsToasting } from '@store/AppState/appState.slice';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';

type ThreeInputsValidation = {
    firstInputIsInvalid: boolean;
    secondInputIsInvalid: boolean;
    thirdInputIsInvalid: boolean;
};

const ThreeFieldActionForm: FC<TaskActionFormProps> = ({ onClose, taskId, taskActionRequirements }) => {
    const dispatch = useAppDispatch();

    const FormValidationDefaultState = {
        firstInputIsInvalid: false,
        secondInputIsInvalid: false,
        thirdInputIsInvalid: false,
    };
    const [formInputsValidator, setFormInputsValidator] = useState<ThreeInputsValidation>(FormValidationDefaultState);

    const [
        handleUpdateTaskById,
        { isSuccess: isSuccessUpdateTaskById, isLoading: isLoadingUpdateTaskById, isError: isErrorUpdateTaskById },
    ] = useUpdateTaskByIdMutation();

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
        const formDataValues = Object.fromEntries(formDataHolder.entries());

        if (!isFormValid(formDataValues as TaskActionRequirements)) {
            return;
        }

        //
        const taskActionData = {
            taskActionType: 'form_3_fields',
            taskActionRequirements: {
                firstFieldValue: formDataHolder.get('firstFieldValue') as string,
                secondFieldValue: formDataHolder.get('secondFieldValue') as string,
                thirdFieldValue: formDataHolder.get('thirdFieldValue') as string,
            },
        };

        const formData = new FormData();

        formData.append('data', JSON.stringify(taskActionData));

        handleUpdateTaskById({
            taskId,
            isSave: false,
            body: formData,
        });
    };

    const isFormValid = ({ firstFieldValue, secondFieldValue, thirdFieldValue }: TaskActionRequirements): boolean => {
        setFormInputsValidator({
            firstInputIsInvalid: !firstFieldValue,
            secondInputIsInvalid: !secondFieldValue,
            thirdInputIsInvalid: !thirdFieldValue,
        });

        return !!firstFieldValue && !!secondFieldValue && !!thirdFieldValue;
    };

    const handleInputChanged = (input: string, key: string) => {
        if (!input) {
            setFormInputsValidator((prev) => ({ ...prev, [key]: true }));
            return;
        }
        setFormInputsValidator((prev) => ({ ...prev, [key]: false }));
    };

    return (
        <>
            <h5 style={{ paddingLeft: 20, paddingBottom: 10 }}>
                Revisar disponibilidad de unidades para la asignación de transporte
            </h5>
            <Form
                onSubmit={handleSubmitForm}
                className={classes['three-field-action-modal__form']}
            >
                <Form.Group as={Row}>
                    <Form.Label
                        column
                        as="p"
                        style={{ fontSize: 17 }}
                    >
                        {taskActionRequirements?.firstFieldLabel}
                    </Form.Label>
                    <Col>
                        <Form.Control
                            name="firstFieldValue"
                            defaultValue={taskActionRequirements?.firstFieldValue}
                            onChange={(event) => handleInputChanged(event.currentTarget.value, 'firstInputIsInvalid')}
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
                        {taskActionRequirements?.secondFieldLabel}
                    </Form.Label>
                    <Col>
                        <Form.Control
                            name="secondFieldValue"
                            defaultValue={taskActionRequirements?.secondFieldValue}
                            onChange={(event) => handleInputChanged(event.currentTarget.value, 'secondInputIsInvalid')}
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
                        {taskActionRequirements?.thirdFieldLabel}
                    </Form.Label>
                    <Col>
                        <Form.Control
                            name="thirdFieldValue"
                            defaultValue={taskActionRequirements?.thirdFieldValue}
                            onChange={(event) => handleInputChanged(event.currentTarget.value, 'thirdInputIsInvalid')}
                            isInvalid={formInputsValidator.thirdInputIsInvalid}
                        />
                        <Form.Text
                            muted
                            hidden={!formInputsValidator.thirdInputIsInvalid}
                        >
                            Este valor es requerido
                        </Form.Text>
                    </Col>
                </Form.Group>
                <div className={classes['three-field-action-modal__footer']}>
                    <Button
                        type="submit"
                        className={`siem-primary-button ${classes['three-field-action-modal__button']}`}
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

export default ThreeFieldActionForm;
