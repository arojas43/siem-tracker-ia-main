import Button from 'react-bootstrap/esm/Button';
import classes from './ClientPhasesInformation.module.scss';
import { useEffect, useRef, useState, type FC } from 'react';
import { MdOutlineFileDownload, MdRemoveRedEye } from 'react-icons/md';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/esm/Form';
import { GoogleMapsContainer } from '@components/index';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/esm/Modal';
import FloatingLabel from 'react-bootstrap/esm/FloatingLabel';
import type { ClientPhasesByOperationCodeResponse, GoogleMapsCountryData } from '@store/api/api.types';
import Placeholder from 'react-bootstrap/esm/Placeholder';

interface ClientPhaseInformationProps {
    isLoading: boolean;
    phasesData: ClientPhasesByOperationCodeResponse | undefined;
}

const ClientPhasesInformation: FC<ClientPhaseInformationProps> = ({ isLoading, phasesData }) => {
    const formDefaultState = {
        name: '',
        email: '',
        comment: '',
    };

    const navigate = useNavigate();

    const { operationCode } = useParams<{ operationCode: string }>();

    const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
    const [contactFormData, setContactFormData] = useState(formDefaultState);

    const observationRef = useRef<string>('');
    const mapInfoRef = useRef<Record<string, GoogleMapsCountryData>>({
        country_to: {} as GoogleMapsCountryData,
        country_from: {} as GoogleMapsCountryData,
    });

    useEffect(() => {
        if (phasesData) {
            const { country_from, country_to, observation, siem_advisor_info } = phasesData;
            observationRef.current = observation;
            mapInfoRef.current = { country_to, country_from };

            setContactFormData({
                name: siem_advisor_info
                    ? `${siem_advisor_info.first_name ?? ''} ${siem_advisor_info.last_name ?? ''}`
                    : '',
                email: siem_advisor_info?.username ?? '',
                comment: '',
            });
        }
    }, [phasesData]);

    const handleDownloadPhasesDocuments = () => {
        navigate(`/operations/client/documents/${operationCode}`);
    };

    const handlePreviewImages = () => {
        navigate(`/operations/client/images/${operationCode}`);
    };

    const handleGetHelp = () => {
        setShowHelpModal(true);
    };

    const handleClose = () => {
        setShowHelpModal(false);
        setContactFormData({
            name: contactFormData.name,
            email: contactFormData.email,
            comment: '',
        });
    };

    const handleChange = (e: { target: { name: any; value: any } }) => {
        setContactFormData({ ...contactFormData, [e.target.name]: e.target.value });
    };

    const handleRequestHelp = () => {
        handleClose();
    };

    const renderLoadingPlaceholder = () => {
        return (
            <div className={classes['client-phases-information__loading']}>
                <Placeholder
                    as="div"
                    animation="glow"
                >
                    <Placeholder
                        xs={12}
                        style={{ height: 350 }}
                    />
                </Placeholder>
                <Row>
                    <Col>
                        <Placeholder
                            as="div"
                            animation="glow"
                        >
                            <Placeholder xs={12} />
                        </Placeholder>
                        <Placeholder
                            as="div"
                            animation="glow"
                        >
                            <Placeholder xs={6} />
                        </Placeholder>
                    </Col>
                    <Col>
                        <Placeholder
                            as="div"
                            animation="glow"
                        >
                            <Placeholder xs={12} />
                        </Placeholder>
                        <Placeholder
                            as="div"
                            animation="glow"
                        >
                            <Placeholder xs={6} />
                        </Placeholder>
                    </Col>
                </Row>
                <Row>
                    <Placeholder
                        as="div"
                        animation="glow"
                    >
                        <Placeholder xs={6} />
                    </Placeholder>
                    <Placeholder
                        as="div"
                        animation="glow"
                    >
                        <Placeholder
                            xs={12}
                            style={{ height: 150 }}
                        />
                    </Placeholder>
                </Row>
                <Row>
                    <Col>
                        <Placeholder
                            as="div"
                            animation="glow"
                        >
                            <Placeholder xs={12} />
                        </Placeholder>
                        <Placeholder
                            as="div"
                            animation="glow"
                        >
                            <Placeholder.Button
                                xs={6}
                                bg="secondary"
                            />
                        </Placeholder>
                    </Col>
                    <Col>
                        <Placeholder
                            as="div"
                            animation="glow"
                        >
                            <Placeholder xs={12} />
                        </Placeholder>
                        <Placeholder
                            as="div"
                            animation="glow"
                        >
                            <Placeholder.Button
                                xs={6}
                                bg="secondary"
                            />
                        </Placeholder>
                    </Col>
                </Row>
            </div>
        );
    };

    const renderPhaseInformation = () => {
        return (
            <div className={classes['client-phases-information']}>
                <div className={classes['client-phases-information__map']}>
                    <GoogleMapsContainer mapInformation={mapInfoRef.current} />
                </div>
                <div className={classes['client-phases-information__info']}>
                    <div className={classes['client-phases-information__info--text']}>
                        <Row
                            as="div"
                            style={{ flex: '30%' }}
                        >
                            <Col
                                as="div"
                                className={classes['client-phases-information__info--text-col']}
                            >
                                <h5>Proveedor</h5>
                                <div className={classes['info']}>
                                    <p>{phasesData?.supplier_name || <span className={classes['infoDash']}>—</span>}</p>
                                </div>
                            </Col>
                            <Col
                                as="div"
                                className={classes['client-phases-information__info--text-col']}
                            >
                                <h5>Aduana</h5>
                                <div className={classes['info']}>
                                    <p>{phasesData?.custom_name || <span className={classes['infoDash']}>—</span>}</p>
                                </div>
                            </Col>
                        </Row>
                        <Row
                            as="div"
                            style={{ flex: '30%' }}
                        >
                            <Col
                                as="div"
                                className={classes['client-phases-information__info--text-col']}
                            >
                                <h5>MBL</h5>
                                <div className={classes['info']}>
                                    <p>{phasesData?.MBL || <span className={classes['infoDash']}>—</span>}</p>
                                </div>
                            </Col>
                            <Col
                                as="div"
                                className={classes['client-phases-information__info--text-col']}
                            >
                                <h5>Contenedor</h5>
                                <div className={classes['info']}>
                                    <p>{phasesData?.container || <span className={classes['infoDash']}>—</span>}</p>
                                </div>
                            </Col>
                        </Row>
                        <Row
                            as="div"
                            style={{ flex: '30%' }}
                        >
                            <Col
                                as="div"
                                className={classes['client-phases-information__info--text-col']}
                            >
                                <h5>ETA</h5>
                                <div className={classes['info']}>
                                    <p>
                                        {phasesData?.ETA ? (
                                            new Date(phasesData?.ETA as any).toLocaleDateString()
                                        ) : (
                                            <span className={classes['infoDash']}>—</span>
                                        )}
                                    </p>
                                </div>
                            </Col>
                            <Col
                                as="div"
                                className={classes['client-phases-information__info--text-col']}
                            >
                                <h5>Asesor Siem</h5>
                                <div className={classes['info']}>
                                    <p>
                                        {phasesData?.siem_advisor_info ? (
                                            `${phasesData.siem_advisor_info.first_name ?? ''} ${phasesData.siem_advisor_info.last_name ?? ''}`
                                        ) : (
                                            <span className={classes['infoDash']}>—</span>
                                        )}
                                    </p>
                                </div>
                            </Col>
                        </Row>
                        <Row
                            as="div"
                            style={{ flex: '30%' }}
                        >
                            <Col
                                as="div"
                                className={classes['client-phases-information__info--text-col']}
                            >
                                <h5>Pedimento</h5>
                                <div className={classes['info']}>
                                    <p>
                                        {phasesData?.detailed_customs_declaration || (
                                            <span className={classes['infoDash']}>—</span>
                                        )}
                                    </p>
                                </div>
                            </Col>
                            <Col
                                as="div"
                                className={classes['client-phases-information__info--text-col']}
                            >
                                <h5>Pedimento rectificado</h5>
                                <div className={classes['info']}>
                                    <p>
                                        {phasesData?.rectified_customs_declaration || (
                                            <span className={classes['infoDash']}>—</span>
                                        )}
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className={classes['client-phases-information__info--actions']}>
                        <Button
                            variant="link"
                            className={classes['client-phases-information__info--actions-download-btn']}
                            onClick={handlePreviewImages}
                        >
                            <MdRemoveRedEye />
                            Ver previo
                        </Button>
                        <Button
                            variant="link"
                            className={classes['client-phases-information__info--actions-download-btn']}
                            onClick={handleDownloadPhasesDocuments}
                        >
                            <MdOutlineFileDownload />
                            Descargar tus documentos
                        </Button>
                        <div
                            className={classes['client-phases-information__info--actions-help-btn']}
                            style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}
                        >
                            <p style={{ marginBottom: 0, textAlign: 'right' }}>¿Error en tu operación?</p>
                            <Button
                                variant="link"
                                className={classes['client-phases-information__info--actions-help-btn']}
                                onClick={handleGetHelp}
                                style={{ marginTop: '-4px' }}
                            >
                                Obtén ayuda
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {isLoading ? renderLoadingPlaceholder() : renderPhaseInformation()}
            <Modal
                show={showHelpModal}
                onHide={handleClose}
            >
                <Modal.Header closeButton>
                    <Modal.Title as="h5">Ayuda para operación #{operationCode}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <FloatingLabel
                            label="Asesor SIEM"
                            className="mb-3"
                        >
                            <Form.Control
                                readOnly
                                type="name"
                                defaultValue={contactFormData.name}
                            />
                        </FloatingLabel>

                        <FloatingLabel
                            label="E-mail"
                            className="mb-3"
                        >
                            <Form.Control
                                readOnly
                                type="email"
                                defaultValue={contactFormData.email}
                            />
                        </FloatingLabel>

                        <FloatingLabel label="Comentario">
                            <Form.Control
                                as="textarea"
                                name="comment"
                                style={{ height: '100px' }}
                                defaultValue={contactFormData.comment}
                                onChange={handleChange}
                            />
                        </FloatingLabel>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="siem-primary-button"
                        onClick={handleRequestHelp}
                    >
                        Solicitar ayuda
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ClientPhasesInformation;
