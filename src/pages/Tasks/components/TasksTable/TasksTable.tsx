import classes from './TasksTable.module.scss';
import { useLazyGetTasksQuery } from '@store/api/api.slice';
import type { HTMLAttributes, FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Card from 'react-bootstrap/esm/Card';
import Table from 'react-bootstrap/esm/Table';
import Spinner from 'react-bootstrap/esm/Spinner';
import { useNavigate } from 'react-router-dom';
import type { Task } from '@store/api/api.types';
import { OPERATIONS_ENDPOINT } from '@store/api/api.types';
import { Button } from 'react-bootstrap';
import StatusBadge from '@components/StatusBadge';
import {
    PHASE_STATUS_DICTIONARY,
    PHASE_STATUS_TEXT_DICTIONARY,
} from '../../../Operations/pages/OperationPhases/OperationPhasesPage.types';
import TablePagination from '@components/TablePagination';
import { PAGE_SIZE } from '@components/TablePagination/TablePagination';
import { TableSearchBar } from '@components/index';
import { getQueryString } from '@utils/utils.types';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import type { StatusBadgeStatus } from '@components/StatusBadge/StatusBadge.types';

interface TasksTableProps extends HTMLAttributes<HTMLDivElement> {}

const TasksTable: FC<TasksTableProps> = ({ style }) => {
    const [statusFilter, setStatusFilter] = useState<string>('Not Started');
    const [assignedToFilter, setAssignedToFilter] = useState<string>('me');
    const [sortField, setSortField] = useState<'id' | 'task_name'>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const searchRef = useRef<string>('');
    const [resetOffset, setResetOffset] = useState<boolean>(false);
    const { setHeaderTitle } = usePageHeader();

    const navigate = useNavigate();
    const [getTasks, { data: taskData, isLoading }] = useLazyGetTasksQuery();

    const buildQueryString = (extraParams: Record<string, string> = {}) => {
        const params: Record<string, string> = {};
        params.ordering = sortOrder === 'asc' ? sortField : `-${sortField}`;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        if (assignedToFilter && assignedToFilter !== 'all') {
            params.assigned_to = assignedToFilter === 'me' ? 'me' : assignedToFilter;
        }
        Object.assign(params, extraParams);
        const esc = encodeURIComponent;
        const query = Object.keys(params)
            .map((k) => esc(k) + '=' + esc(params[k]))
            .join('&');
        return query ? `?${query}` : '';
    };

    useEffect(() => {
        getTasks(buildQueryString());
    }, [statusFilter, assignedToFilter, sortField, sortOrder, resetOffset]);

    useEffect(() => {
        if (resetOffset) {
            console.log('task regresando a false');
            setResetOffset(false);
        }
    }, [resetOffset]);

    const handleSort = (field: 'id' | 'task_name') => {
        if (sortField === field) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleGoToTaskOperation = (task: Task) => {
        navigate(
            `${OPERATIONS_ENDPOINT}tasks?phaseId=${task.additional_info.phase_id}&operationCode=${task.additional_info.operation_code}`,
        );
        setHeaderTitle(`${task.additional_info.phase_name} - ${task.additional_info.operation_code}`);
    };

    const handleGoToPage = (page: number) => {
        const offset = ((page - 1) * PAGE_SIZE).toString();
        getTasks(buildQueryString({ limit: PAGE_SIZE.toString(), offset }));
    };

    const handleGetNextTasks = () => {
        if (taskData?.next) {
            getTasks(getQueryString(taskData.next));
        }
    };

    const handleGetPreviousTasks = () => {
        if (taskData?.previous) {
            getTasks(getQueryString(taskData.previous));
        }
    };

    const handleTaskSearch = (search: string) => {
        searchRef.current = search;
        setResetOffset(true);
        getTasks(buildQueryString());
    };

    const handleClearSearch = () => {
        searchRef.current = '';
        setResetOffset(true);
        getTasks(buildQueryString());
    };

    const handleOnBlurTaskSearch = () => {
        setResetOffset(true);
        searchRef.current = '';
        getTasks(buildQueryString());
    };

    const memoRenderTableContent = useMemo(() => {
        if (!taskData?.results || taskData?.results.length === 0) {
            return (
                <tr>
                    <td
                        colSpan={8}
                        className="text-center"
                    >
                        No hay tareas
                    </td>
                </tr>
            );
        }

        return taskData.results.map((task) => {
            return (
                <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>{task.task_name}</td>
                    <td>{task.additional_info?.operation_code ?? ''}</td>
                    <td>
                        <StatusBadge
                            text={PHASE_STATUS_TEXT_DICTIONARY[task.status.toLocaleLowerCase()]}
                            status={PHASE_STATUS_DICTIONARY[task.status.toLocaleLowerCase()] as StatusBadgeStatus}
                        />
                    </td>
                    <td className={classes['nowrap-cell']}>
                        <Button
                            style={style}
                            className={`${classes['view-operation-button']}`}
                            onClick={() => handleGoToTaskOperation(task)}
                        >
                            Ver Operación
                        </Button>
                    </td>
                </tr>
            );
        });
    }, [taskData]);

    return (
        <>
            <Card
                className={classes['task-table']}
                style={style}
            >
                <div
                    id="input"
                    style={{ flex: 1 }}
                >
                    <div
                        className="d-flex align-items-center mb-2"
                        style={{ justifyContent: 'flex-end', gap: 16 }}
                    >
                        <TableSearchBar
                            placeholder="Buscar Tarea"
                            onSearch={handleTaskSearch}
                            onBlur={handleOnBlurTaskSearch}
                            onClearSearch={handleClearSearch}
                        />
                        <div>
                            <select
                                className="form-select"
                                style={{ minWidth: 160 }}
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setResetOffset(true);
                                }}
                            >
                                <option value="all">Todos los estatus</option>
                                <option value="Not Started">No iniciada</option>
                                <option value="In Progress">En progreso</option>
                                <option value="Blocked">Bloqueada</option>
                                <option value="Completed">Completada</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="form-select"
                                style={{ minWidth: 160 }}
                                value={assignedToFilter}
                                onChange={(e) => {
                                    setAssignedToFilter(e.target.value);
                                    setResetOffset(true);
                                }}
                            >
                                <option value="all">Todas las tareas</option>
                                <option value="me">Asignadas a mí</option>
                                <option value="others">Asignadas a otros</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    {isLoading ? (
                        <div
                            className="text-center my-4"
                            style={{ height: 420 }}
                        >
                            <Spinner
                                animation="border"
                                role="status"
                            >
                                <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <Table hover>
                            <thead>
                                <tr>
                                    <th
                                        onClick={() => handleSort('id')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span style={{ display: 'inline-block', marginRight: 12 }}>Tarea</span>
                                        <span style={{ marginLeft: 8 }}>
                                            <span
                                                style={{
                                                    fontWeight:
                                                        sortField === 'id' && sortOrder === 'asc' ? 'bold' : 'normal',
                                                }}
                                            >
                                                ↑
                                            </span>
                                            <span
                                                style={{
                                                    fontWeight:
                                                        sortField === 'id' && sortOrder === 'desc' ? 'bold' : 'normal',
                                                }}
                                            >
                                                ↓
                                            </span>
                                        </span>
                                    </th>
                                    <th
                                        onClick={() => handleSort('task_name')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span style={{ display: 'inline-block', marginRight: 12 }}>Nombre</span>
                                        <span style={{ marginLeft: 8 }}>
                                            <span
                                                style={{
                                                    fontWeight:
                                                        sortField === 'task_name' && sortOrder === 'asc'
                                                            ? 'bold'
                                                            : 'normal',
                                                }}
                                            >
                                                ↑
                                            </span>
                                            <span
                                                style={{
                                                    fontWeight:
                                                        sortField === 'task_name' && sortOrder === 'desc'
                                                            ? 'bold'
                                                            : 'normal',
                                                }}
                                            >
                                                ↓
                                            </span>
                                        </span>
                                    </th>
                                    <th>Número de Operación</th>
                                    <th>Estatus</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>{memoRenderTableContent}</tbody>
                        </Table>
                    )}
                    <TablePagination
                        data={taskData}
                        resetOffset={resetOffset}
                        handleGoToPage={handleGoToPage}
                        onNextClick={handleGetNextTasks}
                        onPreviousClick={handleGetPreviousTasks}
                    />
                </div>
            </Card>
        </>
    );
};

export default TasksTable;
