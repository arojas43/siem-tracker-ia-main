import BackButton from '@components/BackButton';
import classes from './ClientOperationInfoPage.module.scss';
import { useEffect, type FC } from 'react';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import { useParams } from 'react-router-dom';
import { useGetClientPhasesByOperationCodeQuery } from '@store/api/operationApi.slice';
import { ClientPhasesInformation, ClientPhasesStatusTimeline } from './components';

const ClientOperationInfoPage: FC = () => {
    const { operationCode } = useParams<{ operationCode: string }>();
    const {
        data: phasesData,
        isLoading: isLoadingPhases,
        // isError: isErrorPhases,
    } = useGetClientPhasesByOperationCodeQuery(operationCode!, {
        // skip: !operationCode,
        refetchOnMountOrArgChange: true,
    });

    const { setHeaderTitle } = usePageHeader();

    useEffect(() => {
        setHeaderTitle(`Operacion #${operationCode}`);
    }, []);

    useEffect(() => {
        console.log('phasesData', phasesData);
    }, [phasesData]);

    return (
        <div
            className={`tracker-page-container tracker-page-container__card`}
            style={{ gap: 0 }}
        >
            <div className={classes['client-operation-page__header']}>
                <h6>
                    Entrega prevista:{' '}
                    {phasesData?.ETA ? new Date(phasesData?.ETA).toLocaleDateString() : '(Por Definir)'}
                </h6>
                <BackButton asIcon />
            </div>
            <Row
                as="div"
                className={classes['client-operation-page__body']}
            >
                <Col
                    as="div"
                    className={classes['client-operation-page__status-column']}
                >
                    <ClientPhasesStatusTimeline
                        isLoading={isLoadingPhases}
                        phases={phasesData?.phases || []}
                    />
                </Col>
                <Col
                    as="div"
                    className={classes['client-operation-page__information-column']}
                >
                    <ClientPhasesInformation
                        isLoading={isLoadingPhases}
                        phasesData={phasesData}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default ClientOperationInfoPage;
