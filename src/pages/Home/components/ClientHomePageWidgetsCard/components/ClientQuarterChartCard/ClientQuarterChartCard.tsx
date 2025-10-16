import classes from './ClientQuarterChartCard.module.scss';
import Card from 'react-bootstrap/esm/Card';
import type { FC } from 'react';
import ProgressBar from 'react-bootstrap/esm/ProgressBar';
import type { OperationSummary } from '@store/api/api.types';
import Placeholder from 'react-bootstrap/esm/Placeholder';

interface QuarterChartCardProps {
    isLoading: boolean;
    cardTitle: string | undefined;
    operationSummary: OperationSummary | undefined;
}

const ClientQuarterChartCard: FC<QuarterChartCardProps> = ({ isLoading, cardTitle, operationSummary }) => {
    const renderLoadingMobilePlaceholder = () => {
        return (
            <>
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        style={{ paddingLeft: 25 }}
                    >
                        <Placeholder
                            as="p"
                            animation="wave"
                            style={{ display: 'flex', gap: 30, padding: 20 }}
                        >
                            <Placeholder
                                xs={12}
                                style={{ width: 100 }}
                            />
                            <Placeholder
                                xs={12}
                                style={{ width: 100 }}
                            />
                        </Placeholder>
                    </div>
                ))}
            </>
        );
    };

    const renderWebData = (total: number, inProgress: number) => {
        const percentage = Math.floor((inProgress * 100) / total);

        return (
            <>
                <div className={classes['quarter-chart-card__body--total']}>
                    <h2>{total}</h2>
                    <h5 style={{ marginTop: 5 }}>Totales</h5>
                </div>
                <ProgressBar
                    now={percentage}
                    className={classes['custom-progress']}
                />
            </>
        );
    };

    const renderMobileData = (title: string, value: number) => {
        return (
            <>
                <Card.Body
                    as="div"
                    className={classes['quarter-chart-card__body_mobile']}
                >
                    <div className={classes['quarter-chart-card__body--total_mobile']}>
                        <div
                            className={classes['chart']}
                            style={{ '--progress': 100 } as React.CSSProperties}
                        >
                            <span>{value}</span>
                        </div>
                    </div>
                </Card.Body>
                <Card.Title
                    as="div"
                    className={classes['quarter-chart-card_title_mobile']}
                >
                    Operaciones {title}
                </Card.Title>
            </>
        );
    };

    const renderTrafficSemaphore = (label: string, color: string, value: number) => {
        const colorDictionary: Record<string, string> = {
            inProgress: 'rgb(196, 175, 51)',
            finished: 'rgb(237, 231, 188)',
        };
        return (
            <div className={classes['semaphore']}>
                <div
                    style={{
                        height: '10px',
                        width: '20%',
                        maxWidth: '20%',
                        borderRadius: '4px',
                        backgroundColor: colorDictionary[color],
                        flexShrink: 0,
                    }}
                 />

                <div>
                    <strong>{label}</strong>
                    <p style={{ margin: 0 }}>
                        {value} {value > 1 ? 'operaciones' : 'operación'}{' '}
                    </p>
                </div>
            </div>
        );
    };

    const renderLoadingWebPlaceholder = () => {
        return (
            <Card.Body
                as="div"
                className={classes['quarter-chart-card__body']}
            >
                <div className={classes['data-block']}>
                    {Array.from({ length: 1 }).map((_, index) => (
                        <div key={index}>
                            <Placeholder
                                as="p"
                                animation="wave"
                            >
                                <Placeholder xs={12} />
                            </Placeholder>
                        </div>
                    ))}
                </div>

                <div className={classes['quarter-chart-card__body--nom']}>
                    <div className={classes['data-block']}>
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div key={index}>
                                <Placeholder
                                    as="p"
                                    animation="wave"
                                >
                                    <Placeholder xs={12} />
                                </Placeholder>
                            </div>
                        ))}
                    </div>
                </div>
            </Card.Body>
        );
    };

    const renderOperationSummary = () => {
        if (!operationSummary) {
            return (
                <Card.Body
                    as="div"
                    className={classes['quarter-chart-card__body']}
                    style={{ textAlign: 'center' }}
                >
                    <Card.Title>No hay datos disponibles</Card.Title>
                </Card.Body>
            );
        }

        return (
            <>
                <Card.Title>{cardTitle}</Card.Title>
                <Card.Body
                    as="div"
                    className={classes['quarter-chart-card__body']}
                >
                    <div className={classes['data-block']}>
                        <div>{renderWebData(operationSummary.created, operationSummary!.in_progress!)}</div>
                    </div>

                    <div className={classes['quarter-chart-card__body--nom']}>
                        <div className={classes['data-block']}>
                            <div>{renderTrafficSemaphore('Finalizadas', 'finished', operationSummary!.finished)} </div>
                            <div>
                                {renderTrafficSemaphore('En Progreso', 'inProgress', operationSummary!.in_progress!)}
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </>
        );
    };

    const renderMobileDataBlock = () => {
        if (!operationSummary) {
            return (
                <Card.Body
                    as="div"
                    className={classes['quarter-chart-card__body']}
                    style={{ textAlign: 'center' }}
                >
                    <Card.Title>No hay datos disponibles</Card.Title>
                </Card.Body>
            );
        }
        return (
            <>
                <Card.Title
                    as="div"
                    className={classes['quarter-chart-card_title_mobile']}
                    style={{ fontSize: 20 }}
                >
                    {cardTitle ? cardTitle : renderLoadingWebPlaceholder()}
                </Card.Title>

                <div style={{ display: 'flex' }}>{renderMobileData('Creadas', operationSummary.created)}</div>
                <div style={{ display: 'flex' }}>{renderMobileData('En Progreso', operationSummary.in_progress!)}</div>
                <div style={{ display: 'flex' }}>{renderMobileData('Finalizadas', operationSummary.finished)}</div>
            </>
        );
    };
    return (
        <div>
            {/** MOBILE CARD */}

            <Card
                as="div"
                className={classes['quarter-chart-card_chart-mobile']}
            >
                {isLoading ? renderLoadingMobilePlaceholder() : renderMobileDataBlock()}
            </Card>

            {/** WEB CARD */}

            <Card
                as="div"
                className={classes['quarter-chart-card']}
            >
                {isLoading ? renderLoadingWebPlaceholder() : renderOperationSummary()}
            </Card>
        </div>
    );
};

export default ClientQuarterChartCard;
