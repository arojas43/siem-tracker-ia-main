import classes from './OneDateActionForm.module.scss';

import Col from 'react-bootstrap/esm/Col';
import { useEffect, useState, type FC } from 'react';
import Form from 'react-bootstrap/esm/Form';
import Row from 'react-bootstrap/esm/Row';
import Button from 'react-bootstrap/esm/Button';
import Spinner from 'react-bootstrap/esm/Spinner';
import type { TaskActionFormProps } from '../TaskActionsComponents.types';
import { useUpdateTaskByIdMutation } from '@store/api/api.slice';
import { appIsToasting } from '@store/AppState/appState.slice';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { isFormDatesInvalid } from '@utils/isFormDatesInvalid';

const OneDateActionForm: FC<TaskActionFormProps> = ({ onClose, taskId, taskActionRequirements }) => {
    const dispatch = useAppDispatch();
    const [isInvalid, setIsInvalid] = useState<boolean>(false);
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
        setIsInvalid(false);

        const formDataHolder = new FormData(event.currentTarget);
        const formDataValues = Object.fromEntries(formDataHolder.entries());
        const invalidFormDates = isFormDatesInvalid(
            { firstDateValue: formDataValues.firstDateValue as string },
            { firstDateRequired: taskActionRequirements?.firstDateRequired as boolean },
        );
        if (invalidFormDates) {
            setIsInvalid(true);
            return;
        }

        //
        const taskActionData = {
            taskActionType: 'one_date',
            taskActionRequirements: {
                firstDateValue: (formDataHolder.get('firstDateValue') as string) || null,
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

    const handleInputChanged = (input: string) => {
        if (!input) {
            setIsInvalid(true);
            return;
        }
        setIsInvalid(false);
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
                    {taskActionRequirements?.firstDateLabel}
                </Form.Label>
                <Col>
                    <Form.Control
                        type="date"
                        name="firstDateValue"
                        isInvalid={isInvalid}
                        defaultValue={taskActionRequirements?.firstDateValue}
                        onChange={(event) => handleInputChanged(event.currentTarget.value)}
                    />
                    <Form.Text
                        hidden={!isInvalid}
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
                            size="sm"
                            role="status"
                            animation="border"
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

export default OneDateActionForm;
