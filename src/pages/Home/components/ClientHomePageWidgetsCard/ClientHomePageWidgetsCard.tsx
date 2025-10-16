import classes from './ClientHomePageWidgetsCard.module.scss';
import Card from 'react-bootstrap/esm/Card';
import { useEffect, type FC } from 'react';
import { useGetClientHomeWidgetsDataQuery } from '@store/api/api.slice';
import { ClientOperationTypePieChart, ClientQuarterChartCard } from './components';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { appIsToasting } from '@store/AppState/appState.slice';

const ClientHomePageWidgetsCard: FC = () => {
    const dispatch = useAppDispatch();

    // const clientHomeWidgetData2 = {
    //     month: 'Abril 2025',
    //     client_name: 'Sears SA de CV',
    //     operations_summary: {
    //         created: 150,
    //         finished: 50,
    //         in_progress: 100,
    //     },
    //     operations_by_type: {
    //         A1: 10,
    //         M3: 25,
    //         A4: 55,
    //         A3: 33,
    //     },
    // };
    /** todo cambiar al endpoint de cliente */
    const {
        data: clientHomeWidgetData,
        isLoading: isLoadingClientHomeWidget,
        isError: isErrorClientHomeWidget,
    } = useGetClientHomeWidgetsDataQuery();

    useEffect(() => {
        console.log('clientHomeWidgetData', clientHomeWidgetData);
    }, [clientHomeWidgetData]);

    useEffect(() => {
        if (isErrorClientHomeWidget) {
            dispatch(
                appIsToasting({
                    message: 'Error al cargar resumen de operacion.',
                    show: true,
                    isError: true,
                }),
            );
        }
    }, [isErrorClientHomeWidget]);

    return (
        <Card className={classes['home-page-widget__card']}>
            <Card.Body
                as="div"
                className={classes['home-page-widget__card-body']}
            >
                <div className={classes['operation-widget-card__w1']}>
                    <ClientQuarterChartCard
                        isLoading={isLoadingClientHomeWidget}
                        cardTitle={`${clientHomeWidgetData?.month} de ${clientHomeWidgetData?.client_name}`}
                        operationSummary={clientHomeWidgetData?.operations_summary}
                    />
                </div>

                <div className={classes['operation-widget-card__w2']}>
                    <ClientOperationTypePieChart
                        isLoading={isLoadingClientHomeWidget}
                        cardTitle={'Tu ' + clientHomeWidgetData?.month}
                        operationTypes={clientHomeWidgetData?.operations_by_type}
                    />
                </div>
            </Card.Body>
        </Card>
    );
};

export default ClientHomePageWidgetsCard;
