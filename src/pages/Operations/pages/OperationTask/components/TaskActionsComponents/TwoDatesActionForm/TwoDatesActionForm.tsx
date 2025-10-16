import classes from './TwoDatesActionForm.module.scss';

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
import { isFormDatesInvalid } from '@utils/isFormDatesInvalid';

type FourDatesValidation = {
    firstDateIsInvalid: boolean;
    secondDateIsInvalid: boolean;
};

const TwoDatesActionForm: FC<TaskActionFormProps> = ({ onClose, taskId, taskActionRequirements }) => {
    const dispatch = useAppDispatch();

    const [
        handleUpdateTaskById,
        { isSuccess: isSuccessUpdateTaskById, isLoading: isLoadingUpdateTaskById, isError: isErrorUpdateTaskById },
    ] = useUpdateTaskByIdMutation();

    const FormValidationDefaultState = {
        firstDateIsInvalid: false,
        secondDateIsInvalid: false,
    };
    const [formInputsValidator, setFormInputsValidator] = useState<FourDatesValidation>(FormValidationDefaultState);

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
                    message: 'Error al tratar de guardar la tarea.',
                }),
            );
        }
    }, [isSuccessUpdateTaskById, isErrorUpdateTaskById]);

    const isFormInvalid = ({ firstDateValue, secondDateValue }: TaskActionRequirements): boolean => {
        return isFormDatesInvalid(
            { firstDateValue, secondDateValue },
            {
                firstDateRequired: taskActionRequirements?.firstDateRequired as boolean,
                secondDateRequired: taskActionRequirements?.secondDateRequired as boolean,
            },
        );
    };

    const handleSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormInputsValidator(FormValidationDefaultState);

        const formDataHolder = new FormData(event.currentTarget);
        const formDataValues = Object.fromEntries(formDataHolder.entries());

        if (isFormInvalid(formDataValues as TaskActionRequirements)) {
            setFormInputsValidator({
                firstDateIsInvalid: !formDataValues.firstDateValue && !!taskActionRequirements?.firstDateRequired,
                secondDateIsInvalid: !formDataValues.secondDateValue && !!taskActionRequirements?.secondDateRequired,
            });
            console.log('handleSubmitForm 222');
            return;
        }

        const taskActionData = {
            taskActionType: 'two_dates',
            taskActionRequirements: {
                firstDateValue: (formDataHolder.get('firstDateValue') as string) || null,
                secondDateValue: (formDataHolder.get('secondDateValue') as string) || null,
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

    const handleInputChanged = (input: string, key: string) => {
        if (!input) {
            setFormInputsValidator((prev) => ({ ...prev, [key]: true }));
            return;
        }
        setFormInputsValidator((prev) => ({ ...prev, [key]: false }));
    };

    return (
        <Form
            onSubmit={handleSubmitForm}
            className={classes['one-date-action-modal__form']}
        >
            <Form.Group as={Row}>
                <Form.Label
                    column
                    as="p"
                    style={{ fontSize: 17 }}
                >
                    {/* todo cambiar esto a usar el del servicio */}
                    {taskActionRequirements?.firstDateLabel}
                </Form.Label>
                <Col>
                    <Form.Control
                        type="date"
                        name="firstDateValue"
                        defaultValue={taskActionRequirements?.firstDateValue}
                        onChange={(event) => handleInputChanged(event.currentTarget.value, 'firstDateIsInvalid')}
                        isInvalid={formInputsValidator.firstDateIsInvalid}
                    />
                    <Form.Text
                        hidden={!formInputsValidator.firstDateIsInvalid}
                        muted
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
                    {/* todo cambiar esto a usar el del servicio */}
                    {taskActionRequirements?.secondDateLabel}
                </Form.Label>
                <Col>
                    <Form.Control
                        type="date"
                        name="secondDateValue"
                        defaultValue={taskActionRequirements?.secondDateValue}
                        onChange={(event) => handleInputChanged(event.currentTarget.value, 'secondDateIsInvalid')}
                        isInvalid={formInputsValidator.secondDateIsInvalid}
                    />
                    <Form.Text
                        hidden={!formInputsValidator.secondDateIsInvalid}
                        muted
                    >
                        Este valor es requerido
                    </Form.Text>
                </Col>
            </Form.Group>

            <div className={classes['one-date-action-modal__footer']}>
                <Button
                    type="submit"
                    className={`siem-primary-button ${classes['one-date-action-modal__button']}`}
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
    );
};

export default TwoDatesActionForm;
