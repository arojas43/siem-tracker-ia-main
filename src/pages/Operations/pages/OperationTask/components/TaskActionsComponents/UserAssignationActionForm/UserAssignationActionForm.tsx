import classes from './UserAssignationActionForm.module.scss';

import Col from 'react-bootstrap/esm/Col';
import type { ChangeEvent, FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Form from 'react-bootstrap/esm/Form';
import Row from 'react-bootstrap/esm/Row';
import Button from 'react-bootstrap/esm/Button';
import Spinner from 'react-bootstrap/esm/Spinner';
import type { TaskActionFormProps } from '../TaskActionsComponents.types';
import { useUpdateTaskByIdMutation } from '@store/api/api.slice';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { appIsToasting } from '@store/AppState/appState.slice';

const UserAssignationActionForm: FC<TaskActionFormProps> = ({ onClose, taskId, taskActionRequirements }) => {
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
        if (!formDataValues.selectedUserId) {
            setIsInvalid(true);
            return;
        }

        const taskActionData = {
            taskActionType: 'user_assignation',
            taskActionRequirements: {
                selectedUserId: +formDataHolder.get('selectedUserId')!, //selectedUserId
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

    const handleDropdownChanged = (event: ChangeEvent<HTMLSelectElement>) => {
        const { value } = event.target;
        console.log('val', value);

        if (!value) {
            setIsInvalid(true);
            return;
        }
        setIsInvalid(false);
    };

    const memoRenderUserOptions = useMemo(() => {
        return taskActionRequirements?.usersList!.map((user) => (
            <option
                key={user.id}
                value={user.id}
            >
                {user.firstName + ' ' + user.lastName}
            </option>
        ));
    }, [taskActionRequirements?.usersList]);

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
                    <Form.Select
                        name="selectedUserId"
                        defaultValue={taskActionRequirements?.selectedUserId}
                        onChange={handleDropdownChanged}
                    >
                        <option value="">Selecciona un usuario</option>
                        {memoRenderUserOptions}
                    </Form.Select>
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

export default UserAssignationActionForm;
