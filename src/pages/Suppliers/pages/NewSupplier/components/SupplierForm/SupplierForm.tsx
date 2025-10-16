import classes from './SupplierForm.module.scss';
import Button from 'react-bootstrap/esm/Button';
import type { ChangeEvent, FC} from 'react';
import { useEffect, useState } from 'react';
import Card from 'react-bootstrap/esm/Card';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/esm/Form';
import Row from 'react-bootstrap/esm/Row';
import {
    useCreateSupplierMutation,
    useGetCountriesQuery,
    useGetLanguagesQuery,
    useLazyGetSupplierByIdQuery,
    useUpdateSupplierMutation,
} from '@store/api/api.slice';

import BackButton from '@components/BackButton/BackButton.tsx';
import { useNavigate } from 'react-router-dom';
import type { SupplierFormProps, SuppliersDropdownFormField } from './SupplierForm.types';
import Spinner from 'react-bootstrap/esm/Spinner';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { appIsToasting } from '@store/AppState/appState.slice';
import type { Country, Language } from '@store/api/api.types';
import { sanitizeToUppercaseNoAccents } from '../../../../../../utils/sanitizeToUppercaseNoAccents';

const SupplierForm: FC<SupplierFormProps> = ({ supplierId }) => {
    const dispatch = useAppDispatch();
    const [handleGetSupplierById, { data: supplierData, isLoading: isLoadingSupplierData }] =
        useLazyGetSupplierByIdQuery();
    const [supplierName, setSupplierName] = useState('');
    const [taxId, setTaxId] = useState('');
    const [taxAddress, setTaxAddress] = useState('');
    useEffect(() => {
        if (supplierData?.supplier_name) {
            setSupplierName(sanitizeToUppercaseNoAccents(supplierData.supplier_name));
        }
        if (supplierData?.tax_id) {
            setTaxId(sanitizeToUppercaseNoAccents(supplierData.tax_id));
        }
        if (supplierData?.tax_address) {
            setTaxAddress(sanitizeToUppercaseNoAccents(supplierData.tax_address));
        }
    }, [supplierData]);
    const handleSupplierNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSupplierName(sanitizeToUppercaseNoAccents(e.target.value));
    };
    const handleSupplierNamePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        setSupplierName(sanitizeToUppercaseNoAccents(text));
    };
    const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTaxId(sanitizeToUppercaseNoAccents(e.target.value));
    };
    const handleTaxIdPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        setTaxId(sanitizeToUppercaseNoAccents(text));
    };
    const handleTaxAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTaxAddress(sanitizeToUppercaseNoAccents(e.target.value));
    };
    const handleTaxAddressPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        setTaxAddress(sanitizeToUppercaseNoAccents(text));
    };

    const [
        handleCreateSupplier,
        { isLoading: isLoadingCreateSupplier, isError: isErrorCreateSupplier, isSuccess: isSuccessCreateSupplier },
    ] = useCreateSupplierMutation();

    const [
        handleUpdateSupplier,
        { isLoading: isLoadingUpdatingSupplier, isError: isErrorUpdateSupplier, isSuccess: isSuccessUpdateSupplier },
    ] = useUpdateSupplierMutation();

    const { data: countries, isLoading: isLoadingCountries, error: isErrorCountries } = useGetCountriesQuery();
    const { data: languages, isLoading: isLoadingLanguages, error: isErrorLanguages } = useGetLanguagesQuery();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Record<SuppliersDropdownFormField, any>>({
        supplier_country: '0',
        supplier_language: '0',
    });

    useEffect(() => {
        if (supplierData) {
            console.log('supplierData', supplierData);
            setFormData({
                supplier_country: supplierData.supplier_country_info.id || '0',
                supplier_language: supplierData.supplier_language_info.id || '0',
            });
        }
    }, [supplierData]);

    useEffect(() => {
        if (supplierId) {
            handleGetSupplierById(supplierId);
        }
    }, []);

    useEffect(() => {
        if (isSuccessCreateSupplier || isSuccessUpdateSupplier) {
            const message = isSuccessUpdateSupplier
                ? '¡El proveedor se ha actualizado con éxito!'
                : '¡El proveedor se ha creado con éxito!';

            dispatch(appIsToasting({ message, isError: false, show: true }));
            (isSuccessCreateSupplier || isSuccessUpdateSupplier) && navigate('/suppliers');
            return;
        }

        if (isErrorCreateSupplier || isErrorUpdateSupplier) {
            dispatch(
                appIsToasting({ message: 'Ha ocurrido un error, inténtalo más tarde', isError: true, show: true }),
            );
        }
    }, [isSuccessCreateSupplier, isSuccessUpdateSupplier, isErrorUpdateSupplier, isErrorCreateSupplier]);

    const handleSubmitButtonText = (): string => {
        let title = 'Crear Proveedor';

        if (supplierId) {
            title = 'Actualizar Proveedor';
        }

        return title;
    };

    const handleFormTitle = () => {
        let title = <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Crear nuevo proveedor</div>;

        if (supplierId) {
            title = <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Cambia o edita la siguiente información</div>;
        }

        return title;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formDataValues = Object.fromEntries(formData.entries());

        let requestBody = {
            ...formDataValues,
            supplier_name: sanitizeToUppercaseNoAccents(supplierName),
        };

        if (supplierId) {
            handleUpdateSupplier({
                supplierId: supplierData!.id,
                supplierRequestBody: { ...formDataValues } as any,
            });
            return;
        }
        handleCreateSupplier(requestBody as any);
    };

    const handleDropdownChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value, // Dynamically update the field based on its name
        }));
    };

    const renderCountriesDropdownOptions = () => {
        return (
            <Form.Select
                name="supplier_country"
                value={formData.supplier_country}
                onChange={handleDropdownChange}
            >
                <option value="">Seleccione una opción</option>
                {isLoadingCountries ? (
                    <option>Cargando...</option>
                ) : isErrorCountries ? (
                    <option>Error al cargar</option>
                ) : (
                    countries?.results?.map((country: Country) => (
                        <option
                            key={country.id}
                            value={country.id}
                        >
                            {country.country_name}
                        </option>
                    ))
                )}
            </Form.Select>
        );
    };

    const renderLanguagesDropdownOptions = () => {
        return (
            <Form.Select
                name="supplier_language"
                value={formData.supplier_language}
                onChange={handleDropdownChange}
            >
                <option value="">Seleccione una opción</option>
                {isLoadingLanguages ? (
                    <option>Cargando...</option>
                ) : isErrorLanguages ? (
                    <option>Error al cargar</option>
                ) : (
                    languages?.results?.map((language: Language) => (
                        <option
                            key={language.id}
                            value={language.id}
                        >
                            {language.name}
                        </option>
                    ))
                )}
            </Form.Select>
        );
    };

    return (
        <div style={{ position: 'relative' }}>
            {(isLoadingSupplierData || isLoadingCreateSupplier || isLoadingUpdatingSupplier) && (
                <div className={classes['form-overlay']}>
                    <div className={classes['loader']} />
                </div>
            )}

            <Card
                as="div"
                className={classes['supplier-form']}
            >
                <div className={classes['new-supplier-form__header']}>
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
                            <Col className={classes['new-supplier-form__col']}>
                                <div className={classes['new-supplier-form__form-group']}>
                                    <Form.Label>Nombre del proveedor</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="supplier_name"
                                        value={supplierName}
                                        onChange={handleSupplierNameChange}
                                        onPaste={handleSupplierNamePaste}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className={classes['new-supplier-form__form-group']}>
                                    <Form.Label>País</Form.Label>
                                    {renderCountriesDropdownOptions()}
                                </div>

                                <div className={classes['new-supplier-form__form-group']}>
                                    <Form.Label>TaxID (RFC proveedor)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="tax_id"
                                        value={taxId}
                                        onChange={handleTaxIdChange}
                                        onPaste={handleTaxIdPaste}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className={classes['new-supplier-form__form-group']}>
                                    <Form.Label>Domicilio fiscal</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="tax_address"
                                        value={taxAddress}
                                        onChange={handleTaxAddressChange}
                                        onPaste={handleTaxAddressPaste}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className={classes['new-supplier-form__form-group']}>
                                    <Form.Label>Idioma proveedor</Form.Label>
                                    {renderLanguagesDropdownOptions()}
                                </div>
                            </Col>
                            <Row>
                                <div className="d-flex justify-content-end">
                                    <Button
                                        size="lg"
                                        type="submit"
                                        disabled={isLoadingCreateSupplier}
                                        className={`siem-primary-button ${classes['new-supplier-form__submit-button']}`}
                                    >
                                        {(isLoadingCreateSupplier || isLoadingUpdatingSupplier) && (
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                style={{ marginRight: 20 }}
                                            />
                                        )}
                                        {isLoadingCreateSupplier ? 'Creando...' : handleSubmitButtonText()}
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

export default SupplierForm;
