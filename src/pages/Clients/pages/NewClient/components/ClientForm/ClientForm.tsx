import classes from './ClientForm.module.scss';
import Button from 'react-bootstrap/esm/Button';
import type { FC} from 'react';
import { useEffect, useState } from 'react';
import Card from 'react-bootstrap/esm/Card';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/esm/Form';
import Row from 'react-bootstrap/esm/Row';
import { useCreateClientMutation, useLazyGetClientByIdQuery, useUpdateClientMutation } from '@store/api/api.slice';

import BackButton from '@components/BackButton/BackButton.tsx';
import { useNavigate } from 'react-router-dom';
import type { ClientFormProps } from './ClientForm.types';
import Spinner from 'react-bootstrap/esm/Spinner';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { sanitizeToUppercaseNoAccents } from '../../../../../../utils/sanitizeToUppercaseNoAccents';
import { appIsToasting } from '@store/AppState/appState.slice';

const ClientForm: FC<ClientFormProps> = ({ clientId }) => {
    const dispatch = useAppDispatch();
    const [handleGetClientById, { data: clientData, isLoading: isLoadingClientData }] = useLazyGetClientByIdQuery();
    const [
        handleCreateClient,
        { isLoading: isLoadingCreateClient, isError: isErrorCreateClient, isSuccess: isSuccessCreateClient },
    ] = useCreateClientMutation();

    const [
        handleUpdateClient,
        { isLoading: isLoadingUpdatingClient, isError: isErrorUpdateClient, isSuccess: isSuccessUpdateClient },
    ] = useUpdateClientMutation();

    const navigate = useNavigate();

    useEffect(() => {
        if (clientId) {
            handleGetClientById(clientId);
        }
    }, []);

    useEffect(() => {
        if (isSuccessCreateClient || isSuccessUpdateClient) {
            const message = isSuccessUpdateClient
                ? '¡El cliente se ha actualizado con éxito!'
                : '¡El cliente se ha creado con éxito!';

            dispatch(appIsToasting({ message, isError: false, show: true }));
            (isSuccessCreateClient || isSuccessUpdateClient) && navigate('/clients');
            return;
        }

        if (isErrorCreateClient || isErrorUpdateClient) {
            dispatch(
                appIsToasting({ message: 'Ha ocurrido un error, inténtalo más tarde', isError: true, show: true }),
            );
        }
    }, [isSuccessCreateClient, isSuccessUpdateClient, isErrorUpdateClient, isErrorCreateClient]);

    const handleSubmitButtonText = (): string => {
        let title = 'Crear Cliente';

        if (clientId) {
            title = 'Actualizar Cliente';
        }

        return title;
    };

    const handleFormTitle = () => {
        let title = <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Crear nuevo cliente</div>;

        if (clientId) {
            title = <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Cambia o edita la siguiente información</div>;
        }

        return title;
    };

    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    useEffect(() => {
        if (clientData?.full_name) {
            setFullName(sanitizeToUppercaseNoAccents(clientData.full_name));
        }
        if (clientData?.address) {
            setAddress(sanitizeToUppercaseNoAccents(clientData.address));
        }
    }, [clientData]);
    const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFullName(sanitizeToUppercaseNoAccents(e.target.value));
    };
    const handleFullNamePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        setFullName(sanitizeToUppercaseNoAccents(text));
    };
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress(sanitizeToUppercaseNoAccents(e.target.value));
    };
    const handleAddressPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        setAddress(sanitizeToUppercaseNoAccents(text));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formDataValues = Object.fromEntries(formData.entries());

        let requestBody = {
            ...formDataValues,
        };

        const clientForm: FormData = new FormData();
        clientForm.append('data', JSON.stringify({ address: requestBody.address, full_name: requestBody.full_name }));

        if ((requestBody.logo as any).size > 0) {
            clientForm.append('files', requestBody.logo);
        }

        if (clientId) {
            handleUpdateClient({
                clientId: clientData!.id,
                clientRequestBody: clientForm as any,
            });
            return;
        }

        handleCreateClient(clientForm as any);
    };

    return (
        <div style={{ position: 'relative' }}>
            {(isLoadingClientData || isLoadingCreateClient || isLoadingUpdatingClient) && (
                <div className={classes['form-overlay']}>
                    <div className={classes['loader']} />
                </div>
            )}

            <Card
                as="div"
                className={classes['client-form']}
            >
                <div className={classes['new-client-form__header']}>
                    <Card.Title
                        as="h5"
                        style={{ paddingLeft: '12px' }}
                    >
                        {handleFormTitle()}
                    </Card.Title>
                    <BackButton asIcon />
                </div>

                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col className={classes['new-client-form__col']}>
                                <div className={classes['new-client-form__form-group']}>
                                    <Form.Label>Nombre o denominación social</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="full_name"
                                        value={fullName}
                                        onChange={handleFullNameChange}
                                        onPaste={handleFullNamePaste}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className={classes['new-client-form__form-group']}>
                                    <Form.Label>Domicilio fiscal</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={address}
                                        onChange={handleAddressChange}
                                        onPaste={handleAddressPaste}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className={classes['new-client-form__form-group']}>
                                    <Form.Label>Logo</Form.Label>
                                    <Form.Control
                                        type="file"
                                        name="logo"
                                    />
                                </div>
                            </Col>
                            <Row>
                                <div className="d-flex justify-content-end">
                                    <Button
                                        size="lg"
                                        type="submit"
                                        disabled={isLoadingCreateClient}
                                        className={`siem-primary-button ${classes['new-client-form__submit-button']}`}
                                    >
                                        {(isLoadingCreateClient || isLoadingUpdatingClient) && (
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                style={{ marginRight: 20 }}
                                            />
                                        )}
                                        {isLoadingCreateClient ? 'Creando...' : handleSubmitButtonText()}
                                    </Button>
                                </div>
                            </Row>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ClientForm;
