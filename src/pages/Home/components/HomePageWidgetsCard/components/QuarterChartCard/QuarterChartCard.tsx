import type { FC } from 'react';
import React from 'react';
import Card from 'react-bootstrap/esm/Card';
import classes from './QuarterChartCard.module.scss';
import ProgressBar from 'react-bootstrap/esm/ProgressBar';
import type { OperationSummary, Semaphore } from '@store/api/api.types';
import Placeholder from 'react-bootstrap/esm/Placeholder';

interface QuarterChartCardProps {
    isLoading: boolean;
    cardTitle: string | undefined;
    trafficSemaphore: Semaphore | undefined;
    operationSummary: OperationSummary | undefined;
}

const QuarterChartCard: FC<QuarterChartCardProps> = ({ isLoading, cardTitle, operationSummary, trafficSemaphore }) => {
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

    const renderWebData = (title: string, value: number) => {
        return (
            <>
                <div className={classes['quarter-chart-card__body--total']}>
                    <h3>{value}</h3>
                    <h6 style={{ marginTop: 5 }}>{title}</h6>
                </div>
                <ProgressBar
                    now={100}
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

    const renderTrafficSemaphore = (color: string, value: number) => {
        const colorDictionary: Record<string, string> = { verde: 'green', rojo: 'red', amarillo: 'yellow' };

        const tooltipMessages: Record<string, string> = {
            verde: '🟢 Salida de aduana dentro de los primeros 9 días desde la fecha inicial.',
            amarillo: '🟡 Salida entre el día 10 y 11 desde la fecha inicial.',
            rojo: '🔴 Salida después del día 11 desde la fecha inicial.',
        };

        const [showTooltip, setShowTooltip] = React.useState(false);

        const tooltipRef = React.useRef<HTMLDivElement>(null);
        React.useEffect(() => {
            if (!showTooltip) return;
            const handleClick = (e: MouseEvent) => {
                if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
                    setShowTooltip(false);
                }
            };
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }, [showTooltip]);

        return (
            <div className={classes['semaphore']}>
                <div className={classes['semaphore-row']}>
                    <div
                        className={classes['semaphore-dot']}
                        style={{ backgroundColor: colorDictionary[color] }}
                     />
                    <span className={classes['semaphore-label']}>En {color}</span>
                    <span
                        className={classes['semaphore-help']}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        onClick={() => setShowTooltip((v) => !v)}
                    >
                        ¡
                    </span>
                    {showTooltip && (
                        <div
                            ref={tooltipRef}
                            className={classes['semaphore-tooltip']}
                        >
                            {tooltipMessages[color]}
                        </div>
                    )}
                </div>
                <strong className={classes['semaphore-count']}>{value} operaciones</strong>
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
                    {Array.from({ length: 3 }).map((_, index) => (
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
                        {Array.from({ length: 3 }).map((_, index) => (
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
                        <div>{renderWebData('Creadas', operationSummary.created)}</div>
                        <div>{renderWebData('En Progreso', operationSummary.active!)}</div>
                        <div>{renderWebData('Finalizadas', operationSummary.finished)}</div>
                    </div>

                    <div className={classes['quarter-chart-card__body--nom']}>
                        <div className={classes['data-block']}>
                            <div>{renderTrafficSemaphore('verde', trafficSemaphore!.green.count)} </div>
                            <div>{renderTrafficSemaphore('amarillo', trafficSemaphore!.yellow.count)}</div>
                            <div>{renderTrafficSemaphore('rojo', trafficSemaphore!.red.count)}</div>
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
                    {cardTitle || 'Resumen de Operaciones'}
                </Card.Title>

                <div style={{ display: 'flex' }}>{renderMobileData('Creadas', operationSummary.created)}</div>
                <div style={{ display: 'flex' }}>{renderMobileData('En Progreso', operationSummary.active!)}</div>
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

export default QuarterChartCard;
