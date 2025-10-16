import Col from 'react-bootstrap/esm/Col';
import classes from './SingleFieldActionForm.module.scss';
import { useEffect, useState, type FC } from 'react';
import Form from 'react-bootstrap/esm/Form';
import Row from 'react-bootstrap/esm/Row';
import Button from 'react-bootstrap/esm/Button';
import Spinner from 'react-bootstrap/esm/Spinner';
import type { TaskActionFormProps } from '../TaskActionsComponents.types';
import { useUpdateTaskByIdMutation } from '@store/api/api.slice';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { appIsToasting } from '@store/AppState/appState.slice';

const SingleFieldActionForm: FC<TaskActionFormProps> = ({ onClose, taskId, taskActionRequirements }) => {
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

        if (!formDataValues.firstFieldValue) {
            setIsInvalid(true);
            return;
        }

        //
        const taskActionData = {
            taskActionType: 'form_1_field',
            taskActionRequirements: {
                firstFieldValue: formDataHolder.get('firstFieldValue') as string,
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
            className={classes['single-field-action-modal__form']}
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
                        onChange={(event) => handleInputChanged(event.currentTarget.value)}
                        isInvalid={isInvalid}
                    />
                    <Form.Text
                        hidden={!isInvalid}
                        muted
                    >
                        Este valor es requerido
                    </Form.Text>
                </Col>
            </Form.Group>
            <div className={classes['single-field-action-modal__footer']}>
                <Button
                    type="submit"
                    className={`siem-primary-button ${classes['single-field-action-modal__button']}`}
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

export default SingleFieldActionForm;
