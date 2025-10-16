import classes from './OperationPhasesPage.module.scss';

import type { FC} from 'react';
import { useMemo } from 'react';
import Table from 'react-bootstrap/esm/Table';
import Button from 'react-bootstrap/esm/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useGetPhasesByOperationCodeQuery } from '@store/api/operationApi.slice';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import { PHASE_STATUS_DICTIONARY, PHASE_STATUS_TEXT_DICTIONARY } from './OperationPhasesPage.types';
import type { Advisors } from '@store/api/api.types';
import Image from 'react-bootstrap/Image';
import { StatusBadge } from '@components/index';
import type { StatusBadgeStatus } from '@components/StatusBadge/StatusBadge.types';

const OperationPhasesPage: FC = () => {
    const navigate = useNavigate();
    const { setHeaderTitle } = usePageHeader();

    const { operationCode } = useParams<{ operationCode: string }>();

    const {
        data: phasesData,
        isLoading: isLoadingPhases,
        // isError: isErrorPhases,
    } = useGetPhasesByOperationCodeQuery(operationCode!, {
        skip: !operationCode,
        refetchOnMountOrArgChange: true,
    });

    const phases = phasesData?.phases ?? [];

    const handleGoToPhaseTask = (phaseId: number, phaseName: string) => {
        setHeaderTitle(`${phaseName} - ${operationCode}`);
        navigate(`/operations/tasks?phaseId=${phaseId}&operationCode=${operationCode}`);
    };

    const renderPhases = useMemo(() => {
        if (!phases.length) {
            return (
                <tr>
                    <td
                        colSpan={4}
                        style={{ textAlign: 'center', fontStyle: 'italic' }}
                    >
                        No hay fases disponibles
                    </td>
                </tr>
            );
        }

        const renderAdvisorsImage = (advisors: Advisors[]) => {
            return advisors.slice(0, 4).map((advisor, index) => {
                if (!advisor) return null;
                const firstName = advisor.first_name ?? '';
                const lastName = advisor.last_name ?? '';
                return (
                    <Image
                        key={index}
                        style={{
                            left: index * 23,
                            zIndex: advisors.length - index,
                        }}
                        className={classes['avatar']}
                        alt={`${firstName} ${lastName}`}
                        src={advisor.profile_picture}
                        roundedCircle
                    />
                );
            });
        };

        return phases.map((phase) => (
            <tr key={phase.id}>
                <td>{phase.name}</td>

                <td className={`${classes['avatar-container']} ${classes['advisor-column']}`}>
                    {renderAdvisorsImage(phase.advisors)}
                </td>
                <td className={classes['status-column']}>
                    <StatusBadge
                        text={PHASE_STATUS_TEXT_DICTIONARY[phase.phase_status]}
                        status={PHASE_STATUS_DICTIONARY[phase.phase_status] as StatusBadgeStatus}
                    />
                </td>
                <td className={classes['action-column']}>
                    <Button
                        size="sm"
                        variant="success"
                        style={{ width: '100%' }}
                        className="siem-primary-button"
                        onClick={() => handleGoToPhaseTask(phase.id, phase.name)}
                    >
                        Ir a las tareas
                    </Button>
                </td>
            </tr>
        ));
    }, [phases]);

    return (
        <div className={`tracker-page-container`}>
            {/* <div className={`tracker-page-container tracker-page-container__card`}> */}
            {/* <div className={classes['operation-phases-page__header']}>
                <div className={classes['operation-phases-page__header--action-buttons']}>
                    <Button
                        variant="link"
                        style={{ color: 'black' }}
                    >
                        Documentos de operación
                    </Button>
                    <div className={classes['operation-phases-page__header--buttons']}>
                        <FaEye
                            title="View documents"
                            size={20}
                        />
                        <FaDownload
                            title="Download documents"
                            size={20}
                        />
                    </div>
                </div>
            </div> */}
            <div className={classes['operation-phases-page__table']}>
                <Table
                    hover
                    responsive
                    className={classes['operation-table']}
                >
                    <thead>
                        <tr>
                            <th>Fase de la operación</th>
                            <th className={classes['advisor-column']}>Asesores</th>
                            <th className={classes['status-column']}>Estatus</th>
                            <th className={classes['action-column']}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoadingPhases ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    style={{ textAlign: 'center' }}
                                >
                                    <Spinner
                                        animation="border"
                                        role="status"
                                        size="sm"
                                    />
                                    <span style={{ marginLeft: '8px' }}>Cargando...</span>
                                </td>
                            </tr>
                        ) : (
                            <>{renderPhases}</>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default OperationPhasesPage;
