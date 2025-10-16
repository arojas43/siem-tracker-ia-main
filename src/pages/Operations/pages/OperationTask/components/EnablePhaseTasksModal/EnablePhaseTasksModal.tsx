import { useManagePhaseTasksMutation } from '@store/api/api.slice';
import classes from './EnablePhaseTasksModal.module.scss';

import { useEffect, useState, type FC } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import Form from 'react-bootstrap/esm/Form';
import { appIsToasting } from '@store/AppState/appState.slice';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import type { SmallTask } from '@store/api/api.types';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

interface EnablePhaseTasksModalProps {
    tasks: SmallTask[];
}

const EnablePhaseTasksModal: FC<EnablePhaseTasksModalProps> = ({ tasks: initialTasks }) => {
    const dispatch = useAppDispatch();
    const [tasks, setTasks] = useState<SmallTask[]>(initialTasks!);
    const [selectedTasks, setSelectedTasks] = useState<any[]>([]);

    const [
        handleManagePhaseTasks,
        {
            isLoading: isLoadingManagePhaseTasks,
            isSuccess: isSuccessManagePhaseTasks,
            isError: isErrorManagePhaseTasks,
        },
    ] = useManagePhaseTasksMutation();

    useEffect(() => {
        if (isSuccessManagePhaseTasks) {
            dispatch(appIsToasting({ message: 'Exito al cambiar las tareas.', isError: false, show: true }));
            setTimeout(() => {
                window.location.reload();
            }, 1_000);
        }
        if (isErrorManagePhaseTasks) {
            dispatch(appIsToasting({ message: 'Error al cambiar las tareas.', isError: true, show: true }));
        }
    }, [isSuccessManagePhaseTasks, isErrorManagePhaseTasks]);

    const handleToggle = (taskId: string, isActive: boolean) => {
        setTasks((prev) => prev.map((task) => (task.taskId === taskId ? { ...task, isActive: !task.isActive } : task)));

        setSelectedTasks((prev) =>
            prev.includes(taskId)
                ? prev.filter((id) => id !== taskId)
                : [...prev, { task_id: taskId, is_active: !isActive }],
        );
    };

    const handleSaveTasks = () => {
        console.log('selectedTasks', selectedTasks);
        const body = {
            // phase_id: phaseId,
            tasks: selectedTasks,
            // operation_code: operationCode,
        };
        handleManagePhaseTasks({ body });
    };

    return (
        <div className={classes['enable-phase-task-modal']}>
            <div className={classes['enable-phase-task-modal__body']}>
                {tasks.map(({ taskId, taskName, isActive }) => (
                    <div key={taskId}>
                        <div className={classes['enable-phase-task-modal__body-switch']}>
                            <span
                                className={`${classes.eye} ${isActive ? classes['eye--on'] : classes['eye--off']}`}
                                onClick={() => handleToggle(taskId, isActive)}
                                role="button"
                                aria-label={isActive ? 'Ocultar tarea' : 'Mostrar tarea'}
                                tabIndex={0}
                                onKeyDown={(e) =>
                                    (e.key === 'Enter' || e.key === ' ') && handleToggle(taskId, isActive)
                                }
                            >
                                {isActive ? <IoEyeOutline size={22} /> : <IoEyeOffOutline size={22} />}
                            </span>
                            <p>{taskName}</p>
                            <Form.Check
                                checked={isActive}
                                type="switch"
                                id={`switch-${taskId}`}
                                className={classes.bigSwitch}
                                onChange={() => handleToggle(taskId, isActive)}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className={classes['enable-phase-task-modal__footer']}>
                <Button
                    className={'siem-primary-button'}
                    onClick={handleSaveTasks}
                >
                    {isLoadingManagePhaseTasks && (
                        <Spinner
                            animation="border"
                            role="status"
                            size="sm"
                        >
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    )}{' '}
                    Salvar
                </Button>
            </div>
        </div>
    );
};

export default EnablePhaseTasksModal;
