import { useEffect, useMemo, type FC } from 'react';
import { useGetOperationImportantDatesQuery } from '@store/api/operationApi.slice';
import { useParams } from 'react-router-dom';
import Spinner from 'react-bootstrap/esm/Spinner';
import { ImportantDateBlock } from './components';

const OperationDatesPage: FC = () => {
    const { operationCode } = useParams<{ operationCode: string }>();

    const { data: operationImportantDates, isLoading: isLoadingGetOperationImportantDates } =
        useGetOperationImportantDatesQuery(operationCode!, {
            skip: !operationCode,
            refetchOnMountOrArgChange: true,
        });

    useEffect(() => {
        console.log('operationImportantDates', operationImportantDates);
    }, [operationImportantDates]);

    const renderImportantDatesMemo = useMemo(() => {
        if (!operationImportantDates || !operationImportantDates.phases.length) {
            return (
                <div className="text-center my-4">
                    <h5>No hay fechas disponibles</h5>
                </div>
            );
        }

        return operationImportantDates.phases.map((importantDate: any, index: number) => (
            <div
                key={index}
                style={{ marginBottom: 30 }}
            >
                <ImportantDateBlock
                    title={importantDate.phase_name}
                    dates={importantDate.dates}
                />
            </div>
        ));
    }, [operationImportantDates]);

    return (
        <>
            <div className="operation-page__container">
                <div>
                    {isLoadingGetOperationImportantDates ? (
                        <div className="text-center my-4">
                            <Spinner
                                animation="border"
                                role="status"
                            >
                                <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                        </div>
                    ) : (
                        renderImportantDatesMemo
                    )}
                </div>
            </div>
        </>
    );
};

export default OperationDatesPage;
