import type { Phase } from '@store/api/api.types';
import classes from './ClientPhasesStatusTimeline.module.scss';
import { useEffect, type FC } from 'react';
import Placeholder from 'react-bootstrap/esm/Placeholder';

interface ClientPhasesStatusTimelineProps {
    isLoading: boolean;
    phases: Phase[];
}

// Utilidad para formatear fechas en formato dd/mm/yyyy sin ajuste de zona horaria local
function formatDate(dateString?: string | null): string {
    if (!dateString) return 'Sin definir';
    // Extrae solo la parte de la fecha si viene en formato ISO
    const isoDate = dateString.length > 10 ? dateString.slice(0, 10) : dateString;
    const [year, month, day] = isoDate.split('-');
    if (!year || !month || !day) return 'Sin definir';
    return `${day}/${month}/${year}`;
}

const ClientPhasesStatusTimeline: FC<ClientPhasesStatusTimelineProps> = ({ phases, isLoading }) => {
    useEffect(() => {
        console.log('phases', phases);
    }, [phases]);

    const renderLoadingTimeTable = () => {
        return (
            <div className={classes['client-phases-status-timeline__loading-block']}>
                {Array.from({ length: 7 }).map((_, index) => (
                    <div key={index}>
                        <Placeholder
                            as="p"
                            animation="glow"
                        >
                            <Placeholder xs={10} />
                        </Placeholder>
                        <Placeholder
                            as="p"
                            animation="wave"
                        >
                            <Placeholder xs={6} />
                        </Placeholder>
                    </div>
                ))}
            </div>
        );
    };

    const renderTimeline = () => {
        return (
            <div className={classes.timeline}>
                {phases.map((phase, index) => (
                    <div
                        key={index}
                        className={classes.timelineItem}
                    >
                        <div className={`${classes.dot} ${classes[phase.phase_status.replace(/\s+/g, '_')]}`} />
                        <div className={classes.content}>
                            <span className={classes.label}>{phase.name}</span>
                            {phase.name === 'Operación creada' && (
                                <span className={classes.date}>
                                    Fecha de creación: {formatDate(phase.reception_date)}
                                </span>
                            )}
                            {phase.name === 'Finalizado' && (
                                <span className={classes.date}>
                                    Fecha de Pago: {formatDate(phase.client_payment_date)}
                                </span>
                            )}
                            {phase.name === 'Facturación' && (
                                <span className={classes.date}>
                                    Fecha de factura: {formatDate(phase.register_invoice_issue_date)}
                                </span>
                            )}
                            {phase.name === 'Facturación' && (
                                <span className={classes.date}>
                                    Fecha de envío de cuenta de gastos:{' '}
                                    {formatDate(phase.expense_report_submission_date)}
                                </span>
                            )}
                            {phase.name === 'Revalidación BL' && (
                                <span className={classes.date}>
                                    Fecha de BL revalidado: {formatDate(phase.invoice_issue_date)}
                                </span>
                            )}
                            {phase.name === 'Entrega' && (
                                <span className={classes.date}>
                                    Fecha de entrega: {formatDate(phase.register_final_delivery_date)}
                                </span>
                            )}
                            {phase.name === 'Traslado a Patio Nacional' && (
                                <span className={classes.date}>
                                    Fecha de Despacho: {formatDate(phase.register_modulation_date)}
                                </span>
                            )}
                            {phase.name === 'Pedimento y Previo' && (
                                <>
                                    <span className={classes.date}>
                                        Fecha de Previo: {formatDate(phase.pre_inspection_appointment_date)}
                                    </span>
                                    <span className={classes.date}>
                                        Fecha de pago de pedimento: {formatDate(phase.register_a1_customs_payment)}
                                    </span>
                                    <span className={classes.date}>
                                        Previo en origen:{' '}
                                        {phase.prior_in_origin === true
                                            ? 'Sí'
                                            : phase.prior_in_origin === false
                                              ? 'No'
                                              : 'Sin definir'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return <>{isLoading ? renderLoadingTimeTable() : renderTimeline()}</>;
};

export default ClientPhasesStatusTimeline;
