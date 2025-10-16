import classes from './OperationTask.module.scss';

import BackButton from '@components/BackButton';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState, type FC } from 'react';
import {
    useLazyGetAllTasksByOperationAndPhaseCodeQuery,
    useLazyGetTasksByOperationAndPhaseCodeQuery,
} from '@store/api/api.slice';
import CompletedOperationTasksTable from './components/CompletedOperationTasksTable';
import type { TaskInfo } from './components/IncompletedOperationTasksTable/IncompletedOperationTasksTable.types';
import IncompletedOperationTasksTable from './components/IncompletedOperationTasksTable';
import {
    UploadFilesCard,
    UploadImagesCard,
    OneDateActionForm,
    TwoDatesActionForm,
    FourDatesActionForm,
    DownloadExpensesCard,
    ThreeFieldActionForm,
    SingleFieldActionForm,
    OneDateUploadFilesCard,
    TwoDatesUploadFilesCard,
    ThreeDatesUploadFilesCard,
    UserAssignationActionForm,
    OneDateCheckboxOnYesCommentCard,
    CheckboxOnYesOneDateCommentCard,
    OneDateCommentCheckboxCard,
    OneDateCheckboxOnYesDocumentUploadCard,
    OneDateCheckboxOnYesOneDateDocumentUploadCard,
    CheckboxOnYesTwoDatesDocumentUploadCard,
} from './components/TaskActionsComponents';
import { ActionModalContainer } from '@components/index';
import Button from 'react-bootstrap/esm/Button';
import { MdOutlineFileDownload } from 'react-icons/md';
import { useLazyGetPhaseDocumentsZipQuery } from '@store/api/zipDocumentApi.slice';
import { appIsToasting } from '@store/AppState/appState.slice';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import Spinner from 'react-bootstrap/esm/Spinner';
import { CiSettings } from 'react-icons/ci';
import EnablePhaseTasksModal from './components/EnablePhaseTasksModal';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';

const OperationTaskPage: FC = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const phaseId = searchParams.get('phaseId');
    const operationCode = searchParams.get('operationCode');

    const [selectedTaskActionRequirements, setSelectedTaskActionRequirements] = useState<any>({});
    const selectedTaskIdRef = useRef(-1);

    const [showTable, setShowTable] = useState<boolean>(true);
    const { setHeaderTitle } = usePageHeader();

    const [showOneDateModal, setShowOneDateModal] = useState<boolean>(false);
    const [showTwoDatesModal, setShowTwoDatesModal] = useState<boolean>(false);
    const [showFourDatesModal, setShowFourDatesModal] = useState<boolean>(false);
    const [showThreeFieldModal, setShowThreeFieldModal] = useState<boolean>(false);
    const [showSingleFieldModal, setShowSingleFieldModal] = useState<boolean>(false);
    const [showUserAssignationModal, setShowUserAssignationModal] = useState<boolean>(false);
    const [showEnablePhaseTaskModal, setShowEnablePhaseTaskModal] = useState<boolean>(false);
    const [showOneDateCommentCheckboxModal, setShowOneDateCommentCheckboxModal] = useState<boolean>(false);
    const [showOneDateCheckboxOnYesCommentsModal, setShowOneDateCheckboxOnYesCommentsModal] = useState<boolean>(false);
    const [showCheckboxOnYesOneDateCommentsModal, setShowCheckboxOnYesOneDateCommentsModal] = useState<boolean>(false);

    const [showUploadFileCard, setShowUploadFileCard] = useState<boolean>(false);
    const [showUploadPhotoCard, setShowUploadPhotoCard] = useState<boolean>(false);
    const [showOneDateUploadFileCard, setShowOneDateUploadFileCard] = useState<boolean>(false);
    const [showTwoDatesUploadFileCard, setShowTwoDatesUploadFileCard] = useState<boolean>(false);
    const [showThreeDatesUploadFileCard, setShowThreeDatesUploadFileCard] = useState<boolean>(false);
    const [showOneDateCheckboxOnYesDocumentUploadCard, setShowOneDateCheckboxOnYesDocumentUploadCard] =
        useState<boolean>(false);
    const [showOneDateCheckboxOnYesOneDateDocumentUploadCard, setShowOneDateCheckboxOnYesOneDateDocumentUploadCard] =
        useState<boolean>(false);
    const [showCheckboxOnYesTwoDatesDocumentUploadCard, setShowCheckboxOnYesTwoDatesDocumentUploadCard] =
        useState<boolean>(false);

    const [showDownloadExpensesCard, setShowDownloadExpensesCard] = useState<boolean>(false);

    const [handleGetTasksByOperationAndPhaseCode, { data: handleGetTasksByOperationAndPhaseCodeData, isLoading }] =
        useLazyGetTasksByOperationAndPhaseCodeQuery();
    const [handleGetAllTasksByOperationAndPhaseCode, { data: handleGetAllTasksByOperationAndPhaseCodeData }] =
        useLazyGetAllTasksByOperationAndPhaseCodeQuery();
    const [
        handleGetPhaseDocumentsZip,
        {
            data: phaseDocumentsZipData,
            isLoading: isLoadingGetPhaseDocumentsZip,
            isSuccess: isSuccessGetPhaseDocumentsZip,
            isError: isErrorGetPhaseDocumentsZip,
        },
    ] = useLazyGetPhaseDocumentsZipQuery();
    useEffect(() => {
        handleGetTasks();
    }, []);

    useEffect(() => {
        if (phaseDocumentsZipData instanceof Blob) {
            const url = URL.createObjectURL(phaseDocumentsZipData);
            const a = document.createElement('a');
            a.href = url;
            a.download = `documentos_operacion_${operationCode}_fase_${phaseId}.zip`; // 👈 your custom filename
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }
    }, [phaseDocumentsZipData]);

    useEffect(() => {
        if (isSuccessGetPhaseDocumentsZip) {
            dispatch(
                appIsToasting({
                    show: true,
                    isError: false,
                    message: 'Tarea finalizada con exito.',
                }),
            );
        }

        if (isErrorGetPhaseDocumentsZip) {
            dispatch(
                appIsToasting({
                    show: true,
                    isError: true,
                    message: 'La fase no cuenta con archivos.',
                }),
            );
        }
    }, [isSuccessGetPhaseDocumentsZip, isErrorGetPhaseDocumentsZip]);
    useEffect(() => {
        if (operationCode && phaseId && handleGetTasksByOperationAndPhaseCodeData?.phaseName) {
            setHeaderTitle(`${handleGetTasksByOperationAndPhaseCodeData?.phaseName || 'Fase'} - ${operationCode}`);
        }
    }, [operationCode, phaseId, handleGetTasksByOperationAndPhaseCodeData?.phaseName]);

    const handleGetTasks = () => {
        handleGetTasksByOperationAndPhaseCode({
            phaseId: phaseId!,
            operationCode: operationCode!,
        });

        handleGetAllTasksByOperationAndPhaseCode({
            phaseId: phaseId!,
            operationCode: operationCode!,
        });
    };

    const closeAllActions = () => {
        setShowOneDateModal(false);
        setShowTwoDatesModal(false);
        setShowFourDatesModal(false);
        setShowThreeFieldModal(false);
        setShowSingleFieldModal(false);
        setShowUserAssignationModal(false);
        setShowEnablePhaseTaskModal(false);
        setShowOneDateCommentCheckboxModal(false);
        setShowOneDateCheckboxOnYesCommentsModal(false);
        setShowCheckboxOnYesOneDateCommentsModal(false);

        setShowUploadFileCard(false);
        setShowUploadPhotoCard(false);
        setShowDownloadExpensesCard(false);
        setShowOneDateUploadFileCard(false);
        setShowTwoDatesUploadFileCard(false);
        setShowThreeDatesUploadFileCard(false);
        setShowOneDateCheckboxOnYesDocumentUploadCard(false);
        setShowCheckboxOnYesTwoDatesDocumentUploadCard(false);
        setShowOneDateCheckboxOnYesOneDateDocumentUploadCard(false);
    };

    const handleTableAction = (taskInfo: TaskInfo) => {
        const { taskActionType, taskActionRequirements, taskId } = taskInfo;
        selectedTaskIdRef.current = taskId;
        setSelectedTaskActionRequirements(taskActionRequirements);

        switch (taskActionType) {
            case 'document_upload':
                closeAllActions();
                setShowTable(false);
                setShowUploadFileCard(true);
                return;
            case 'photo_upload':
                closeAllActions();
                setShowTable(false);
                setShowUploadPhotoCard(true);
                return;
            case 'form_1_field':
                closeAllActions();
                setShowSingleFieldModal(true);
                return;
            case 'form_3_fields':
                closeAllActions();
                setShowThreeFieldModal(true);
                return;
            case 'one_date':
                closeAllActions();
                setShowOneDateModal(true);
                return;
            case 'two_dates':
                closeAllActions();
                setShowTwoDatesModal(true);
                return;
            case 'four_dates':
                closeAllActions();
                setShowFourDatesModal(true);
                return;
            case 'one_date_doc_upload':
                closeAllActions();
                setShowTable(false);
                setShowOneDateUploadFileCard(true);
                return;
            case 'two_dates_doc_upload':
                closeAllActions();
                setShowTable(false);
                setShowTwoDatesUploadFileCard(true);
                return;
            case 'three_dates_doc_upload':
                closeAllActions();
                setShowTable(false);
                setShowThreeDatesUploadFileCard(true);
                return;
            case 'user_assignation':
                closeAllActions();
                setShowUserAssignationModal(true);
                return;
            case 'one_date_checkbox_onYes_comments':
                closeAllActions();
                setShowOneDateCheckboxOnYesCommentsModal(true);
                return;
            case 'checkbox_onYes_date_1_comments':
                closeAllActions();
                setShowCheckboxOnYesOneDateCommentsModal(true);
                return;
            case 'one_date_comments_checkbox':
                closeAllActions();
                setShowOneDateCommentCheckboxModal(true);
                return;
            case 'one_date_checkbox_onYes_doc_upload':
                closeAllActions();
                setShowTable(false);
                setShowOneDateCheckboxOnYesDocumentUploadCard(true);
                return;
            case 'one_date_checkbox_onYes_one_date_doc_upload':
                closeAllActions();
                setShowTable(false);
                setShowOneDateCheckboxOnYesOneDateDocumentUploadCard(true);
                return;
            case 'checkbox_onYes_2_dates_doc_upload':
                closeAllActions();
                setShowTable(false);
                setShowCheckboxOnYesTwoDatesDocumentUploadCard(true);
                return;
            case 'download_expenses':
                closeAllActions();
                setShowTable(false);
                setShowDownloadExpensesCard(true);
        }
    };

    const handleClose = (reloadData?: boolean) => {
        closeAllActions();
        setShowTable(true);

        if (reloadData) {
            handleGetTasks();
        }
    };

    const handleDownloadPhasesDocuments = () => {
        handleGetPhaseDocumentsZip({ phaseId: phaseId!, operationCode: operationCode! });
    };

    const handleEnablePhaseTasks = () => {
        setShowEnablePhaseTaskModal(true);
    };

    return (
        <>
            <div
                className={`tracker-page-container ${classes['operation-task-page']}`}
                hidden={!showTable}
            >
                <div className={classes['operation-task-page__header-actions']}>
                    <BackButton />
                    <div className={classes['operation-task-page__header-actions']}>
                        <Button
                            variant="link"
                            className={`${classes['operation-task-page__action-btn']} d-flex align-items-center gap-0`}
                            onClick={handleDownloadPhasesDocuments}
                        >
                            {isLoadingGetPhaseDocumentsZip ? (
                                <Spinner
                                    as="span"
                                    size="sm"
                                    role="status"
                                    animation="border"
                                    aria-hidden="true"
                                />
                            ) : (
                                <MdOutlineFileDownload size={20} />
                            )}
                            Descargar documentos de fase
                        </Button>

                        <Button
                            disabled={!handleGetAllTasksByOperationAndPhaseCodeData?.length}
                            variant="link"
                            className={`${classes['operation-task-page__action-btn']} d-flex align-items-center gap-0`}
                            onClick={handleEnablePhaseTasks}
                        >
                            <CiSettings size={20} />
                            Gestionar Tareas
                        </Button>
                    </div>
                </div>
                <div className={`${classes['operation-task-page__tables']}`}>
                    <div className={classes['operation-task-page__tables--top']}>
                        <IncompletedOperationTasksTable
                            isLoading={isLoading}
                            onAction={handleTableAction}
                            tasks={handleGetTasksByOperationAndPhaseCodeData?.tasksIncompleted || []}
                        />
                    </div>

                    <div className={classes['operation-task-page__tables--bottom']}>
                        <CompletedOperationTasksTable
                            isLoading={isLoading}
                            onAction={handleTableAction}
                            tasks={handleGetTasksByOperationAndPhaseCodeData?.tasksCompleted || []}
                        />
                    </div>
                </div>
            </div>
            <div
                className={`tracker-page-container ${classes['operation-task-page__action-page']}`}
                hidden={showTable}
            >
                {showUploadFileCard && (
                    <UploadFilesCard
                        onClose={handleClose}
                        showCard={showUploadFileCard}
                        taskId={selectedTaskIdRef.current}
                        taskActionRequirements={selectedTaskActionRequirements}
                    />
                )}

                {showUploadPhotoCard && (
                    <UploadImagesCard
                        onClose={handleClose}
                        showCard={showUploadPhotoCard}
                        taskId={selectedTaskIdRef.current}
                        taskActionRequirements={selectedTaskActionRequirements}
                    />
                )}

                {showOneDateUploadFileCard && (
                    <OneDateUploadFilesCard
                        onClose={handleClose}
                        taskId={selectedTaskIdRef.current}
                        showCard={showOneDateUploadFileCard}
                        taskActionRequirements={selectedTaskActionRequirements}
                    />
                )}

                {showTwoDatesUploadFileCard && (
                    <TwoDatesUploadFilesCard
                        onClose={handleClose}
                        taskId={selectedTaskIdRef.current}
                        showCard={showTwoDatesUploadFileCard}
                        taskActionRequirements={selectedTaskActionRequirements}
                    />
                )}

                {showThreeDatesUploadFileCard && (
                    <ThreeDatesUploadFilesCard
                        onClose={handleClose}
                        taskId={selectedTaskIdRef.current}
                        showCard={showThreeDatesUploadFileCard}
                        taskActionRequirements={selectedTaskActionRequirements}
                    />
                )}

                {showOneDateCheckboxOnYesDocumentUploadCard && (
                    <OneDateCheckboxOnYesDocumentUploadCard
                        onClose={handleClose}
                        taskId={selectedTaskIdRef.current}
                        showCard={showOneDateCheckboxOnYesDocumentUploadCard}
                        taskActionRequirements={selectedTaskActionRequirements}
                    />
                )}

                {showOneDateCheckboxOnYesOneDateDocumentUploadCard && (
                    <OneDateCheckboxOnYesOneDateDocumentUploadCard
                        onClose={handleClose}
                        taskId={selectedTaskIdRef.current}
                        taskActionRequirements={selectedTaskActionRequirements}
                        showCard={showOneDateCheckboxOnYesOneDateDocumentUploadCard}
                    />
                )}

                {showCheckboxOnYesTwoDatesDocumentUploadCard && (
                    <CheckboxOnYesTwoDatesDocumentUploadCard
                        onClose={handleClose}
                        taskId={selectedTaskIdRef.current}
                        taskActionRequirements={selectedTaskActionRequirements}
                        showCard={showCheckboxOnYesTwoDatesDocumentUploadCard}
                    />
                )}

                {showDownloadExpensesCard && (
                    <DownloadExpensesCard
                        onClose={handleClose}
                        taskId={selectedTaskIdRef.current}
                        showCard={showDownloadExpensesCard}
                        taskActionRequirements={selectedTaskActionRequirements}
                    />
                )}
            </div>

            {/* ACTION MODALS */}

            <ActionModalContainer
                onClose={handleClose}
                showModal={showSingleFieldModal}
            >
                <SingleFieldActionForm
                    onClose={handleClose}
                    taskId={selectedTaskIdRef.current}
                    taskActionRequirements={selectedTaskActionRequirements}
                />
            </ActionModalContainer>

            <ActionModalContainer
                onClose={handleClose}
                showModal={showThreeFieldModal}
            >
                <ThreeFieldActionForm
                    onClose={handleClose}
                    taskId={selectedTaskIdRef.current}
                    taskActionRequirements={selectedTaskActionRequirements}
                />
            </ActionModalContainer>

            <ActionModalContainer
                onClose={handleClose}
                showModal={showOneDateModal}
            >
                <OneDateActionForm
                    onClose={handleClose}
                    taskId={selectedTaskIdRef.current}
                    taskActionRequirements={selectedTaskActionRequirements}
                />
            </ActionModalContainer>

            <ActionModalContainer
                onClose={handleClose}
                showModal={showTwoDatesModal}
            >
                <TwoDatesActionForm
                    onClose={handleClose}
                    taskId={selectedTaskIdRef.current}
                    taskActionRequirements={selectedTaskActionRequirements}
                />
            </ActionModalContainer>

            <ActionModalContainer
                onClose={handleClose}
                showModal={showFourDatesModal}
            >
                <FourDatesActionForm
                    onClose={handleClose}
                    taskId={selectedTaskIdRef.current}
                    taskActionRequirements={selectedTaskActionRequirements}
                />
            </ActionModalContainer>

            <ActionModalContainer
                onClose={handleClose}
                showModal={showUserAssignationModal}
            >
                <UserAssignationActionForm
                    onClose={handleClose}
                    taskId={selectedTaskIdRef.current}
                    taskActionRequirements={selectedTaskActionRequirements}
                />
            </ActionModalContainer>

            <ActionModalContainer
                onClose={handleClose}
                showModal={showOneDateCheckboxOnYesCommentsModal}
            >
                <OneDateCheckboxOnYesCommentCard
                    onClose={handleClose}
                    taskId={selectedTaskIdRef.current}
                    taskActionRequirements={selectedTaskActionRequirements}
                />
            </ActionModalContainer>

            <ActionModalContainer
                onClose={handleClose}
                showModal={showCheckboxOnYesOneDateCommentsModal}
            >
                <CheckboxOnYesOneDateCommentCard
                    onClose={handleClose}
                    taskId={selectedTaskIdRef.current}
                    taskActionRequirements={selectedTaskActionRequirements}
                />
            </ActionModalContainer>

            <ActionModalContainer
                onClose={handleClose}
                showModal={showOneDateCommentCheckboxModal}
            >
                <OneDateCommentCheckboxCard
                    onClose={handleClose}
                    taskId={selectedTaskIdRef.current}
                    taskActionRequirements={selectedTaskActionRequirements}
                />
            </ActionModalContainer>

            <ActionModalContainer
                onClose={handleClose}
                title="Gestionar visibilidad de tareas"
                showModal={showEnablePhaseTaskModal}
            >
                <EnablePhaseTasksModal tasks={handleGetAllTasksByOperationAndPhaseCodeData || []} />
            </ActionModalContainer>
        </>
    );
};

export default OperationTaskPage;
