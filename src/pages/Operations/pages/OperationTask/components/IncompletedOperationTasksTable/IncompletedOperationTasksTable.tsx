import classes from './IncompletedOperationTasksTable.module.scss';
import { useEffect, useMemo, type FC } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Table from 'react-bootstrap/esm/Table';
import { IoDocumentAttachOutline } from 'react-icons/io5';
import Image from 'react-bootstrap/Image';
import Placeholder from 'react-bootstrap/esm/Placeholder';
import type { IncompletedOperationTasksTableProps } from './IncompletedOperationTasksTable.types';
import type { TaskActionType } from '@store/api/api.types';
import { TbInputCheck } from 'react-icons/tb';
import { CiCalendarDate } from 'react-icons/ci';
import type { TaskActionRequirements } from '../TaskActionsComponents/TaskActionsComponents.types';
import { RiImageAiLine } from 'react-icons/ri';
import { SiAdblock } from 'react-icons/si';
import { FaUserCheck } from 'react-icons/fa';
import { GoDiscussionOutdated } from 'react-icons/go';
import { MdOutlineSimCardDownload } from 'react-icons/md';

const IncompletedOperationTasksTable: FC<IncompletedOperationTasksTableProps> = ({
    tasks,
    isLoading = false,
    showTable = true,
    onAction,
}) => {
    useEffect(() => {
        console.log('tasks', tasks);
    }, [tasks]);
    const renderActionButtonIcon = (action: TaskActionType) => {
        switch (action) {
            case 'form_1_field':
            case 'form_3_fields':
                return <TbInputCheck size={25} />;
            case 'one_date':
            case 'two_dates':
            case 'four_dates':
                return <CiCalendarDate size={25} />;
            case 'photo_upload':
                return <RiImageAiLine size={25} />;

            case 'user_assignation':
                return <FaUserCheck size={25} />;
            case 'document_upload':
            case 'one_date_doc_upload':
            case 'two_dates_doc_upload':
            case 'three_dates_doc_upload':
            case 'checkbox_onYes_2_dates_doc_upload':
            case 'one_date_checkbox_onYes_doc_upload':
            case 'one_date_checkbox_onYes_one_date_doc_upload':
                return <IoDocumentAttachOutline size={25} />;
            case 'one_date_comments_checkbox':
            case 'checkbox_onYes_date_1_comments':
            case 'one_date_checkbox_onYes_comments':
                return <GoDiscussionOutdated size={25} />;
            case 'download_expenses':
                return <MdOutlineSimCardDownload size={25} />;
            default:
                return <SiAdblock size={25} />;
        }
    };

    // const handleCompleteTask = (id: number) => {
    //     console.log('ID', id);
    // };
    const handleTaskAction = (
        taskActionType: TaskActionType,
        taskActionRequirements: TaskActionRequirements,
        taskId: number,
    ) => {
        onAction({ taskActionType, taskActionRequirements, taskId });
    };

    const renderLoadingPlaceholders = () => {
        return [...Array(5)].map((_, index) => (
            <tr key={index}>
                <td>
                    <Placeholder
                        as="span"
                        animation="glow"
                    >
                        <Placeholder xs={1} />
                    </Placeholder>
                </td>
                <td style={{ width: '45%' }}>
                    <Placeholder
                        as="span"
                        animation="glow"
                    >
                        <Placeholder xs={10} />
                    </Placeholder>
                </td>
                <td>
                    <Placeholder
                        as="span"
                        animation="glow"
                    >
                        <Placeholder xs={3} />
                    </Placeholder>
                </td>
                <td>
                    <Placeholder
                        as="span"
                        animation="glow"
                    >
                        <Placeholder xs={2} />
                    </Placeholder>
                    {'     '}
                    <Placeholder
                        as="span"
                        animation="glow"
                    >
                        <Placeholder xs={4} />
                    </Placeholder>
                </td>
            </tr>
        ));
    };

    const renderTasks = useMemo(() => {
        if (!tasks || !tasks.length) {
            return (
                <tr>
                    <td
                        colSpan={4}
                        className="text-center"
                    >
                        No hay tareas por completar
                    </td>
                </tr>
            );
        }

        return tasks.map(({ taskTitle, taskActionType, taskActionRequirements, taskId, advisor_info }, index) => (
            <tr
                style={{ textAlign: 'center' }}
                key={index}
            >
                <td style={{ verticalAlign: 'middle' }}>
                    <input
                        disabled
                        type="checkbox"
                        checked={false}
                    />
                </td>
                <td style={{ verticalAlign: 'middle', width: '45%', textAlign: 'left' }}>{taskTitle}</td>
                <td style={{ verticalAlign: 'middle' }}>
                    <Image
                        src={advisor_info?.profile_picture || ''}
                        style={{ width: 45, height: 45, objectFit: 'fill' }}
                        alt={`${advisor_info?.first_name} ${advisor_info?.last_name}`}
                        roundedCircle
                    />
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                    <div className={classes['operation-task-table__actions']}>
                        <Button
                            size="lg"
                            variant="link"
                            className="tracker-action-icon-btn"
                            onClick={() =>
                                handleTaskAction(taskActionType as TaskActionType, taskActionRequirements, taskId)
                            }
                        >
                            {renderActionButtonIcon(taskActionType as TaskActionType)}
                        </Button>
                    </div>
                </td>
            </tr>
        ));
    }, [tasks]);

    return (
        <div hidden={!showTable}>
            <div className={classes['operation-task-table__header']}>
                <h4>Tareas de la fase</h4>
                {/* <Button
                    variant="link"
                    className={classes['operation-task-table__header-btn']}
                    onClick={handleDownloadPhasesDocuments}
                >
                    <MdOutlineFileDownload size={22} />
                    Descargar documentos de fase
                </Button> */}
            </div>
            <Table hover>
                <thead>
                    <tr>
                        <th />
                        <th />
                        <th />
                        <th />
                    </tr>
                </thead>
                <tbody>{isLoading ? renderLoadingPlaceholders() : renderTasks}</tbody>
            </Table>
        </div>
    );
};

export default IncompletedOperationTasksTable;
