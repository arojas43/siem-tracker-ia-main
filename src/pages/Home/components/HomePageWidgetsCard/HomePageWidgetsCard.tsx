import Card from 'react-bootstrap/esm/Card';
import classes from './HomePageWidgetsCard.module.scss';
import { useEffect, type FC } from 'react';
import NewOperationButton from '@components/NewOperationButton';
import { useGetHomeWidgetsDataQuery } from '@store/api/api.slice';
import { CurrentOperationsByClientCard, PendingTasksCard, QuarterChartCard } from './components';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { appIsToasting } from '@store/AppState/appState.slice';

const HomePageWidgetsCard: FC = () => {
    const dispatch = useAppDispatch();
    const {
        data: homeWidgetData,
        isLoading: isLoadingHomeWidget,
        isError: isErrorHomeWidget,
    } = useGetHomeWidgetsDataQuery();

    useEffect(() => {
        if (isErrorHomeWidget) {
            dispatch(
                appIsToasting({
                    message: 'Error al cargar resumen de operacion.',
                    show: true,
                    isError: true,
                }),
            );
        }
    }, [isErrorHomeWidget]);

    return (
        <Card className={classes['home-page-widget__card']}>
            <Card.Body
                as="div"
                className={classes['home-page-widget__card-body']}
            >
                <div className={classes['operation-widget-card__w1']}>
                    <QuarterChartCard
                        isLoading={isLoadingHomeWidget}
                        cardTitle={homeWidgetData?.month}
                        trafficSemaphore={homeWidgetData?.semaphore}
                        operationSummary={homeWidgetData?.operations_summary}
                    />
                </div>

                <div className={classes['operation-widget-card__w2']}>
                    <div className={classes['operation-widget-card__w33']}>
                        <PendingTasksCard
                            pendingTasks={homeWidgetData?.pending_tasks || []}
                            isLoading={isLoadingHomeWidget}
                        />
                    </div>
                    <div className={classes['operation-widget-card__w22']}>
                        <NewOperationButton className={classes['home-page__new-operation-button']} />

                        <CurrentOperationsByClientCard
                            operationsByClient={homeWidgetData?.operations_by_client || []}
                            isLoading={isLoadingHomeWidget}
                        />
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default HomePageWidgetsCard;
