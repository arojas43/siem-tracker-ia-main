import classes from './CustomForm.module.scss';
import Button from 'react-bootstrap/esm/Button';
import type { FC} from 'react';
import { useEffect, useState } from 'react';
import Card from 'react-bootstrap/esm/Card';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/esm/Form';
import Row from 'react-bootstrap/esm/Row';
import { useCreateCustomMutation, useLazyGetCustomByIdQuery, useUpdateCustomMutation } from '@store/api/api.slice';

import BackButton from '@components/BackButton/BackButton.tsx';
import { useNavigate } from 'react-router-dom';
import type { CustomFormProps } from './CustomForm.types';
import Spinner from 'react-bootstrap/esm/Spinner';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { sanitizeToUppercaseNoAccents } from '../../../../../../utils/sanitizeToUppercaseNoAccents';
import { appIsToasting } from '@store/AppState/appState.slice';

const CustomForm: FC<CustomFormProps> = ({ customId }) => {
    const dispatch = useAppDispatch();
    const [hasError, setHasError] = useState<boolean>(false);
    const [handleGetCustomById, { data: customData, isLoading: isLoadingCustomData }] = useLazyGetCustomByIdQuery();

    const [customsName, setCustomsName] = useState('');
    const [customsKey, setCustomsKey] = useState('');
    useEffect(() => {
        if (customData?.customs_name) {
            setCustomsName(sanitizeToUppercaseNoAccents(customData.customs_name));
        }
        if (customData?.customs_key) {
            setCustomsKey(sanitizeToUppercaseNoAccents(customData.customs_key));
        }
    }, [customData]);
    const handleCustomsNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomsName(sanitizeToUppercaseNoAccents(e.target.value));
    };
    const handleCustomsNamePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        setCustomsName(sanitizeToUppercaseNoAccents(text));
    };
    const handleCustomsKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomsKey(sanitizeToUppercaseNoAccents(e.target.value));
    };
    const handleCustomsKeyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        setCustomsKey(sanitizeToUppercaseNoAccents(text));
    };

    const [
        handleCreateCustom,
        { isLoading: isLoadingCreateCustom, isError: isErrorCreateCustom, isSuccess: isSuccessCreateCustom },
    ] = useCreateCustomMutation();

    const [
        handleUpdateCustom,
        { isLoading: isLoadingUpdatingCustom, isError: isErrorUpdateCustom, isSuccess: isSuccessUpdateCustom },
    ] = useUpdateCustomMutation();

    const navigate = useNavigate();

    useEffect(() => {
        if (customId) {
            handleGetCustomById(customId);
        }
    }, []);

    useEffect(() => {
        if (hasError) {
            setTimeout(() => {
                setHasError(false);
            }, 5_000);
        }
    }, [hasError]);

    useEffect(() => {
        if (isSuccessCreateCustom || isSuccessUpdateCustom) {
            const message = isSuccessUpdateCustom
                ? '¡La aduana se ha actualizado con éxito!'
                : '¡La aduana se ha creado con éxito!';

            dispatch(appIsToasting({ message, isError: false, show: true }));
            (isSuccessCreateCustom || isSuccessUpdateCustom) && navigate('/customs');
            return;
        }

        if (isErrorCreateCustom || isErrorUpdateCustom) {
            setHasError(true);
            dispatch(
                appIsToasting({ message: 'Ha ocurrido un error, inténtalo más tarde', isError: true, show: true }),
            );
        }
    }, [isSuccessCreateCustom, isSuccessUpdateCustom, isErrorUpdateCustom, isErrorCreateCustom]);

    const handleSubmitButtonText = (): string => {
        let title = 'Crear Aduana';

        if (customId) {
            title = 'Actualizar Aduana';
        }

        return title;
    };

    const handleFormTitle = () => {
        let title = <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Crear nueva aduana</div>;

        if (customId) {
            title = <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Cambia o edita la siguiente información</div>;
        }

        return title;
    };

    // todo fix this
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formDataValues = Object.fromEntries(formData.entries());

        let requestBody = {
            ...formDataValues,
            customs_name: sanitizeToUppercaseNoAccents(customsName),
        };

        if (customId) {
            handleUpdateCustom({
                customId: customData!.id,
                customRequestBody: { ...formDataValues } as any,
            });
            return;
        }
        handleCreateCustom(requestBody as any);
    };

    return (
        <div style={{ position: 'relative' }}>
            {(isLoadingCustomData || isLoadingCreateCustom || isLoadingUpdatingCustom) && (
                <div className={classes['form-overlay']}>
                    <div className={classes['loader']} />
                </div>
            )}

            <Card
                as="div"
                className={classes['custom-form']}
            >
                <div className={classes['new-custom-form__header']}>
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
                            <Col className={classes['new-custom-form__col']}>
                                <div className={classes['new-custom-form__form-group']}>
                                    <Form.Label>Nombre de la aduana</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="customs_name"
                                        value={customsName}
                                        onChange={handleCustomsNameChange}
                                        onPaste={handleCustomsNamePaste}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className={classes['new-custom-form__form-group']}>
                                    <Form.Label>Clave de aduana</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="customs_key"
                                        value={customsKey}
                                        onChange={handleCustomsKeyChange}
                                        onPaste={handleCustomsKeyPaste}
                                        autoComplete="off"
                                    />
                                </div>
                            </Col>
                            <Row>
                                <div className="d-flex justify-content-end">
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Button
                                            size="lg"
                                            type="submit"
                                            disabled={isLoadingCreateCustom}
                                            className={`siem-primary-button ${classes['new-custom-form__submit-button']}`}
                                        >
                                            {(isLoadingCreateCustom || isLoadingUpdatingCustom) && (
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    style={{ marginRight: 20 }}
                                                />
                                            )}
                                            {isLoadingCreateCustom ? 'Creando...' : handleSubmitButtonText()}
                                        </Button>
                                        <Form.Text
                                            className={classes['operation-form__error-message']}
                                            style={{ color: 'red', textAlign: 'center' }}
                                            hidden={!hasError}
                                        >
                                            Todos los valores son requeridos
                                        </Form.Text>
                                    </div>
                                </div>
                            </Row>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default CustomForm;
