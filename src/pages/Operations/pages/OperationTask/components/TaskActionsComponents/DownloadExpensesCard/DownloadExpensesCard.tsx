import classes from './DownloadExpensesCard.module.scss';

import BackButton from '@components/BackButton';
import { useEffect, useMemo, type FC } from 'react';
import { Button, Spinner, Table } from 'react-bootstrap';
import type { TaskActionFormProps } from '../TaskActionsComponents.types';
import { StatusBadge } from '@components/index';
import { useLazyGetOperationExpensesZipQuery } from '@store/api/zipDocumentApi.slice';
import { appIsToasting } from '@store/AppState/appState.slice';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { useSearchParams } from 'react-router-dom';

const DownloadExpensesCard: FC<TaskActionFormProps> = ({
    taskActionRequirements,
    taskId,
    onClose,
    showCard = false,
}) => {
    const [searchParams] = useSearchParams();
    const operationCode = searchParams.get('operationCode');

    const dispatch = useAppDispatch();
    const [
        handleGetOperationExpensesZip,
        {
            data: operationExpensesZipData,
            isLoading: isLoadingGetOperationExpensesZip,
            isSuccess: isSuccessGetOperationExpensesZip,
            isError: isErrorGetOperationExpensesZip,
        },
    ] = useLazyGetOperationExpensesZipQuery();
    const { canDownloadExpenses, expensesList } = taskActionRequirements!;

    useEffect(() => {
        if (operationExpensesZipData instanceof Blob) {
            const url = URL.createObjectURL(operationExpensesZipData);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gastos_operacion_${operationCode}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }
    }, [operationExpensesZipData]);

    useEffect(() => {
        if (isSuccessGetOperationExpensesZip) {
            dispatch(
                appIsToasting({
                    show: true,
                    isError: false,
                    message: 'Tarea finalizada con exito.',
                }),
            );

            onClose(true);
        }

        if (isErrorGetOperationExpensesZip) {
            dispatch(
                appIsToasting({
                    show: true,
                    isError: true,
                    message: 'Error al tratar de descargar los documentos.',
                }),
            );
        }
    }, [isSuccessGetOperationExpensesZip, isErrorGetOperationExpensesZip]);

    /** FORM ACTIONS */

    const handleCancel = () => {
        onClose(true);
    };

    const handleSubmit = () => {
        handleGetOperationExpensesZip({ taskId });
    };

    const memoRenderTableContent = useMemo(() => {
        if (!expensesList || expensesList.length === 0) {
            return (
                <tr>
                    <td
                        colSpan={8}
                        className="text-center"
                    >
                        No hay documentos
                    </td>
                </tr>
            );
        }

        return expensesList.map((expense, index) => {
            const { name, uploaded } = expense;

            return (
                <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{name}</td>
                    <td>
                        <StatusBadge
                            text={uploaded ? 'Subido' : 'No Subido'}
                            status={uploaded ? 'success' : 'error'}
                        />
                    </td>
                </tr>
            );
        });
    }, [expensesList]);

    return (
        <div
            className={classes['upload-file-card']}
            hidden={!showCard}
        >
            <div className={classes['upload-file-card__header']}>
                <div className={classes['upload-file-card__header-title']}>
                    <h5 />
                    <BackButton
                        asIcon
                        onAction={onClose}
                        className={classes['upload-file-card__close-button']}
                    />
                </div>
            </div>
            <div className={classes['upload-file-card__body']}>
                <Table
                    hover
                    striped
                    bordered
                >
                    <thead>
                        <tr>
                            <th style={{ verticalAlign: 'middle' }}>#</th>
                            <th style={{ verticalAlign: 'middle' }}>Nombre Documento</th>
                            <th style={{ verticalAlign: 'middle' }}>Estatus</th>
                        </tr>
                    </thead>
                    <tbody>{memoRenderTableContent}</tbody>
                </Table>
            </div>

            <div className={classes['upload-file-card__footer']}>
                <div className={classes['upload-file-card__footer-button-group']}>
                    <Button
                        variant="secondary"
                        onClick={handleCancel}
                        className={classes['upload-file-card__footer-button']}
                    >
                        Cancelar
                    </Button>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={!canDownloadExpenses}
                    className={`siem-primary-button ${classes['upload-file-card__footer-button']}`}
                >
                    {isLoadingGetOperationExpensesZip && (
                        <Spinner
                            as="span"
                            size="sm"
                            role="status"
                            animation="border"
                            aria-hidden="true"
                            style={{ marginRight: 20 }}
                        />
                    )}
                    Descargar Documentos
                </Button>
            </div>
        </div>
    );
};

export default DownloadExpensesCard;
