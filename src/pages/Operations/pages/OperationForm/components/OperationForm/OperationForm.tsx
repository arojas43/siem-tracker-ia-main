// import { Client, User, Container, CreateOperationRequest } from '@store/api/api.types.ts';
// import SuccessOperationCreation from '../SuccessOperationCreation/SuccessOperationCreation.tsx';
// import { createOperationData } from '../../utils/operationHelpers.ts';

import classes from './OperationForm.module.scss';
import Button from 'react-bootstrap/esm/Button';
import type { ChangeEvent, FC, FormEvent} from 'react';
import { useEffect, useState } from 'react';
import Card from 'react-bootstrap/esm/Card';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/esm/Form';
import Row from 'react-bootstrap/esm/Row';
import {
    useGetClientsQuery,
    useGetCustomsQuery,
    useGetSuppliersQuery,
    useGetGroupedUsersQuery,
    useGetMerchandiseTypesQuery,
    useGetCountriesQuery,
    useGetUsersQuery,
} from '@store/api/api.slice';

import {
    useCreateOperationMutation,
    useUpdateOperationMutation,
    useLazyGetOperationByOperationCodeQuery,
    useLazyGetOperationReferenceNumberQuery,
    useGetOperationForwarderQuery,
} from '@store/api/operationApi.slice';
import type { Client, CreateOperationRequest, GroupUser, GroupUserRoles, Supplier } from '@store/api/api.types.ts';

import BackButton from '@components/BackButton/BackButton.tsx';
import { useNavigate } from 'react-router-dom';
import type { DropdownFormField, OperationFormProps, RequiredKeysType } from './OperationForm.types';
import { REQUIRED_KEYS } from './OperationForm.types';
import Spinner from 'react-bootstrap/esm/Spinner';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { appIsToasting } from '@store/AppState/appState.slice';
import InputGroup from 'react-bootstrap/esm/InputGroup';

const OperationForm: FC<OperationFormProps> = ({ operationCode }) => {
    const navigate = useNavigate();

    const [reference, setReference] = useState<string>('');

    // Declarar formData primero para que esté disponible para todos los hooks
    const [formData, setFormData] = useState<Record<DropdownFormField, any>>({
        client: '',
        carrier: 0,
        customs: '',
        priority: '',
        supplier: '',
        ship_flag: '',
        operator: '',
        forwarder: '',
        classifier: '',
        accountant: '',
        weight_unit: '',
        siem_advisor: '',
        operation_type: '',
        transport_unit: '',
        merchandise_type: '',
        operations_manager: '',
        accounting_manager: '',
        prior_in_origin: false,
        siem_client_advisor: '',
        operations_director: '',
        operations_executive: '',
        logistics_supervisor: '',
        operational_documenter: '',
        national_logistics_manager: '',
        customs_compliance_manager: '',
        traffic_and_logistics_manager: '',
        senior_traffic_logistics_analyst: '',
    });

    const dispatch = useAppDispatch();

    const [handleGetOperationByOperationCode, { data: operationData, isLoading: isLoadingOperationData }] =
        useLazyGetOperationByOperationCodeQuery();
    const [
        handleCreateOperation,
        { isLoading: isLoadingCreateOperation, isError: isErrorCreateOperation, isSuccess: isSuccessCreateOperation },
    ] = useCreateOperationMutation();

    const [
        handleUpdateOperation,
        { isLoading: isLoadingUpdatingOperation, isError: isErrorUpdateOperation, isSuccess: isSuccessUpdateOperation },
    ] = useUpdateOperationMutation();

    const {
        data: groupedUsers,
        isLoading: isLoadingGroupedUsers,
        error: isErrorGroupedUsers,
    } = useGetGroupedUsersQuery();

    // Hook para obtener asesores filtrados por cliente
    const {
        data: advisorsData,
        isLoading: isLoadingAdvisors,
        error: isErrorAdvisors,
    } = useGetUsersQuery(
        formData.client
            ? `?group_name=siem_client_advisors&client_id=${formData.client}&limit=10000`
            : '?group_name=siem_client_advisors&limit=10000',
    );

    const { data: customs, isLoading: isLoadingCustoms, error: isErrorCustom } = useGetCustomsQuery('?limit=10000');
    const {
        data: forwarders,
        isLoading: isLoadingForwarders,
        error: isErrorForwarders,
    } = useGetOperationForwarderQuery('?limit=10000');
    const { data: clients, isLoading: isLoadingClients, error: isErrorClients } = useGetClientsQuery('?limit=10000');
    const { data: countries, isLoading: isLoadingCountries, error: isErrorCountries } = useGetCountriesQuery();
    const {
        data: suppliers,
        isLoading: isLoadingSuppliers,
        error: isErrorSuppliers,
    } = useGetSuppliersQuery('?limit=10000');
    const [handleGetOperationReferenceNumberQuery, { data: referenceNumber, isFetching: isFetchingReferenceNumber }] =
        useLazyGetOperationReferenceNumberQuery();

    const {
        data: merchandiseTypes,
        error: isErrorMerchandiseTypes,
        isLoading: isLoadingMerchandiseTypes,
    } = useGetMerchandiseTypesQuery('?limit=10000');

    const IS_EDITING = !!operationCode;

    const [requiredValues, setRequiredValues] = useState<Record<string, boolean>>({
        isInvalidClient: false,
        isInvalidCustoms: false,
        isInvalidReceptionDate: false,
        isInvalidOperationType: false,
        isInvalidSiemClientAdvisor: false,
    });

    useEffect(() => {
        if (operationCode) {
            handleGetOperationByOperationCode(operationCode);
        }
    }, [groupedUsers]);

    useEffect(() => {
        if (referenceNumber) {
            setReference(referenceNumber);
        }
    }, [referenceNumber]);

    useEffect(() => {
        if (operationData) {
            console.log('operationData', operationData.used_free_days);
            setReference(operationData.reference);

            setFormData({
                carrier: operationData.carrier || 0,
                customs: operationData.customs || '',
                priority: operationData.priority || '',
                ship_flag: operationData.ship_flag || '',
                accountant: operationData.accountant || '',
                supplier: '' + operationData.supplier || '',
                operator: '' + operationData.operator || '',
                weight_unit: operationData.weight_unit || '',
                forwarder: '' + operationData.forwarder || '',
                prior_in_origin: operationData.prior_in_origin,
                classifier: '' + operationData.classifier || '',
                transport_unit: operationData.transport_unit || '',
                operation_type: operationData.operation_type || '',
                siem_advisor: '' + operationData.siem_advisor || '',
                client: '' + operationData?.client_info.client_id || '',
                merchandise_type: '' + operationData.merchandise_type || '',
                accounting_manager: '' + operationData.accounting_manager || '',
                operations_manager: '' + operationData.operations_manager || '',
                operations_director: '' + operationData.operations_director || '',
                siem_client_advisor: '' + operationData.siem_client_advisor || '',
                operations_executive: '' + operationData.operations_executive || '',
                logistics_supervisor: '' + operationData.logistics_supervisor || '',
                operational_documenter: '' + operationData.operational_documenter || '',
                customs_compliance_manager: '' + operationData.customs_compliance_manager || '',
                national_logistics_manager: '' + operationData.national_logistics_manager || '',
                traffic_and_logistics_manager: '' + operationData.traffic_and_logistics_manager || '',
                senior_traffic_logistics_analyst: '' + operationData.senior_traffic_logistics_analyst || '',
            });
        } else if (!operationData && groupedUsers) {
            setFormData((prev) => ({
                ...prev,
                operator: '' + groupedUsers['operators'].default || '',
                classifier: '' + groupedUsers['classifiers'].default || '',
                accountant: '' + groupedUsers['accountants'].default || '',
                siem_advisor: '' + groupedUsers['siem_advisors'].default || '',
                operations_manager: '' + groupedUsers['operations_managers'].default || '',
                accounting_manager: '' + groupedUsers['accounting_managers'].default || '',
                operations_director: '' + groupedUsers['operations_directors'].default || '',
                // siem_client_advisor: '' + groupedUsers['siem_client_advisors'].default || '',
                operations_executive: '' + groupedUsers['operations_executives'].default || '',
                logistics_supervisor: '' + groupedUsers['logistics_supervisors'].default || '',
                operational_documenter: '' + groupedUsers['operational_documenters'].default || '',
                customs_compliance_manager: '' + groupedUsers['customs_compliance_managers'].default || '',
                national_logistics_manager: '' + groupedUsers['national_logistics_managers'].default || '',
                traffic_and_logistics_manager: '' + groupedUsers['traffic_and_logistics_managers'].default || '',
                senior_traffic_logistics_analyst: '' + groupedUsers['senior_traffic_logistics_analysts'].default || '',
            }));
        }
    }, [operationData, groupedUsers]);

    useEffect(() => {
        if (isSuccessCreateOperation || isSuccessUpdateOperation) {
            const message = isSuccessUpdateOperation
                ? '¡Tu operación se ha actualizado con éxito!'
                : '¡Tu operación se ha creado con éxito!';

            dispatch(appIsToasting({ message, isError: false, show: true }));
            isSuccessCreateOperation && navigate('/operations');

            isSuccessUpdateOperation && handleGetOperationByOperationCode(operationCode!);

            return;
        }

        if (isErrorCreateOperation || isErrorUpdateOperation) {
            dispatch(
                appIsToasting({ message: 'Ha ocurrido un error, inténtalo más tarde', isError: true, show: true }),
            );
        }
    }, [isSuccessCreateOperation, isSuccessUpdateOperation, isErrorUpdateOperation, isErrorCreateOperation]);

    const handleSubmitButtonText = (): string => {
        let title = 'Crear Operación';

        if (operationCode) {
            title = 'Actualizar Operación';
        }

        return title;
    };

    const handleFormTitle = () => {
        let title = <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Crear nueva operación</div>;

        if (operationCode) {
            title = <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Actualizar operación</div>;
        }

        return title;
    };

    const handleDropdownChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;

        if (name in REQUIRED_KEYS) {
            handleChangeRequiredInput(value, name as RequiredKeysType);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleClientDropdownChanged = (event: ChangeEvent<HTMLSelectElement>) => {
        const { value } = event.target;

        handleDropdownChange(event);
        handleGetOperationReferenceNumberQuery(+value);
    };

    const renderClientDropdownOptions = () => {
        return (
            <Form.Select
                name="client"
                disabled={IS_EDITING}
                value={formData.client}
                onChange={handleClientDropdownChanged}
            >
                <option value="">Seleccione una opción</option>
                {isLoadingClients ? (
                    <option>Cargando...</option>
                ) : isErrorClients ? (
                    <option>Error al cargar</option>
                ) : (
                    clients?.results?.map((client: Client) => (
                        <option
                            key={client.id}
                            value={client.id}
                        >
                            {client.full_name}
                        </option>
                    ))
                )}
            </Form.Select>
        );
    };

    const renderSupplierDropdownOptions = () => {
        return (
            <Form.Select
                name="supplier"
                value={formData.supplier}
                onChange={handleDropdownChange}
            >
                <option value="">Seleccione una opción</option>
                {isLoadingSuppliers ? (
                    <option>Cargando...</option>
                ) : isErrorSuppliers ? (
                    <option>Error al cargar</option>
                ) : (
                    suppliers?.results?.map((supplier: Supplier) => (
                        <option
                            key={supplier.id}
                            value={supplier.id}
                        >
                            {supplier.supplier_name}
                        </option>
                    ))
                )}
            </Form.Select>
        );
    };

    const renderCountriesDropdownOptions = () => {
        return (
            <Form.Select
                name="ship_flag"
                value={formData.ship_flag}
                onChange={handleDropdownChange}
            >
                <option value="">Seleccione una opción</option>
                {isLoadingCountries ? (
                    <option>Cargando...</option>
                ) : isErrorCountries ? (
                    <option>Error al cargar</option>
                ) : (
                    countries?.results?.map((country: any) => (
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

    const renderMerchandiseTypesDropdownOptions = () => {
        return (
            <Form.Select
                name="merchandise_type"
                onChange={handleDropdownChange}
                value={formData.merchandise_type}
            >
                <option value="">Seleccione una opción</option>
                {isLoadingMerchandiseTypes ? (
                    <option>Cargando...</option>
                ) : isErrorMerchandiseTypes ? (
                    <option>Error al cargar</option>
                ) : (
                    merchandiseTypes?.results?.map((merchandiseType) => (
                        <option
                            key={merchandiseType.id}
                            value={merchandiseType.id}
                        >
                            {merchandiseType.name}
                        </option>
                    ))
                )}
            </Form.Select>
        );
    };

    const renderForwarderDropdownOptions = () => {
        return (
            <Form.Select
                name="forwarder"
                value={formData.forwarder}
                onChange={handleDropdownChange}
            >
                <option value="">Seleccione una opción</option>
                {isLoadingForwarders ? (
                    <option>Cargando...</option>
                ) : isErrorForwarders ? (
                    <option>Error al cargar</option>
                ) : (
                    forwarders?.results?.map((forwarder) => (
                        <option
                            key={forwarder.id}
                            value={forwarder.id}
                        >
                            {forwarder.forwarder_name}
                        </option>
                    ))
                )}
            </Form.Select>
        );
    };

    const renderCustomsDropdownOptions = () => {
        return (
            <Form.Select
                name="customs"
                value={formData.customs}
                onChange={handleDropdownChange}
            >
                <option value="">Seleccione una opción</option>
                {isLoadingCustoms ? (
                    <option>Cargando...</option>
                ) : isErrorCustom ? (
                    <option>Error al cargar</option>
                ) : (
                    customs?.results?.map((custom) => (
                        <option
                            key={custom.id}
                            value={custom.id}
                        >
                            {custom.customs_name}
                        </option>
                    ))
                )}
            </Form.Select>
        );
    };

    const renderUserDropdownOptions = (name: DropdownFormField) => {
        // Si es el dropdown de asesor cliente, usar el endpoint /users filtrado por client_id y group_name
        if (name === 'siem_client_advisor') {
            const users = advisorsData?.results || [];
            return (
                <Form.Select
                    name={name}
                    value={formData[name]}
                    onChange={handleDropdownChange}
                    disabled={!formData.client}
                >
                    <option value="">{!formData.client ? 'Seleccione un cliente' : 'Seleccione una opción'}</option>
                    {isLoadingAdvisors ? (
                        <option>Cargando...</option>
                    ) : isErrorAdvisors ? (
                        <option>Error al cargar</option>
                    ) : (
                        users.map((user: any) => (
                            <option
                                key={user.id}
                                value={user.id}
                            >
                                {`${user.first_name} ${user.last_name}`}
                            </option>
                        ))
                    )}
                </Form.Select>
            );
        }

        let key = (name + 's') as GroupUserRoles;
        if (name === ('siem_client_advisor' as DropdownFormField)) key = 'siem_client_advisors' as GroupUserRoles;
        let users: GroupUser[] = groupedUsers?.[key]?.group_users || [];
        return (
            <Form.Select
                name={name}
                value={formData[name]}
                onChange={handleDropdownChange}
            >
                <option value="">Seleccione una opción</option>
                {isLoadingGroupedUsers ? (
                    <option>Cargando...</option>
                ) : isErrorGroupedUsers ? (
                    <option>Error al cargar</option>
                ) : (
                    users.map((user: GroupUser) => (
                        <option
                            key={user.id}
                            value={user.id}
                        >
                            {`${user.first_name} ${user.last_name}`}
                        </option>
                    ))
                )}
            </Form.Select>
        );
    };

    // not happy with this...
    // function crested as BE is not able to handle "" so it needs to be changed to null
    const replaceEmptyStringsWithNull = <T extends Record<string, any>>(obj: T): T => {
        return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, value === '' ? null : value])) as T;
    };

    // todo fix this
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formDataValues = replaceEmptyStringsWithNull(Object.fromEntries(formData.entries()));

        if (!isFormValid(formDataValues)) {
            dispatch(appIsToasting({ message: 'Faltan valores requeridos.', isError: true, show: true }));
            return;
        }

        let requestBody = {
            ...formDataValues,
            operation_code: formDataValues.reference,
            observation: formDataValues.observation === '' ? null : formDataValues.observation,
        };

        console.log('formDataValues', formDataValues);
        console.log('requestBody', requestBody);

        if (operationCode) {
            handleUpdateOperation({
                operationId: operationData!.id,
                operationRequestBody: { ...formDataValues } as CreateOperationRequest,
            });
            return;
        }

        handleCreateOperation(requestBody as any);
    };

    const isFormValid = (formDataValues: CreateOperationRequest) => {
        const { reception_date, client, operation_type, customs, siem_client_advisor } = formDataValues;
        console.log('formDataValues', formDataValues);
        console.log('formDataValues client', client);
        setRequiredValues(() => ({
            isInvalidClient: !client,
            isInvalidOperationType: !operation_type,
            isInvalidCustoms: !customs,
            isInvalidReceptionDate: !reception_date,
            isInvalidSiemClientAdvisor: !siem_client_advisor,
        }));

        return !!reception_date && !!client && !!operation_type && !!customs && !!siem_client_advisor;
    };

    const handleChangeRequiredInput = (value: string, inputName: RequiredKeysType) => {
        const key = REQUIRED_KEYS[inputName];
        let isInvalid = true;

        if (value.length) {
            isInvalid = false;
        }

        setRequiredValues((prev) => ({ ...prev, [key]: isInvalid }));
    };

    return (
        <div style={{ position: 'relative' }}>
            {(isLoadingOperationData || isLoadingCreateOperation || isLoadingUpdatingOperation) && (
                <div className={classes['form-overlay']}>
                    <div className={classes['loader']} />
                </div>
            )}

            <Card
                as="div"
                // className={classes['new-operation-form']}
                className={classes['operation-form']}
            >
                <div
                    className={classes['new-operation-form__header']}
                    hidden={IS_EDITING}
                >
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
                        {/** FIRST BLOCK */}
                        <Row className={classes['operation-form__row']}>
                            <h6>Inicio de operación</h6>
                            <Col className={classes['operation-form__row_col']}>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Fecha de recepción*</Form.Label>

                                    <div
                                        className={
                                            requiredValues.isInvalidReceptionDate
                                                ? classes['new-operation-form__form-input-w-message__invalid']
                                                : classes['new-operation-form__form-input-w-message']
                                        }
                                    >
                                        <Form.Control
                                            type="date"
                                            name="reception_date"
                                            defaultValue={operationData?.reception_date}
                                            onChange={(event) =>
                                                handleChangeRequiredInput(event.currentTarget.value, 'reception_date')
                                            }
                                        />
                                        <Form.Text
                                            className={classes['operation-form__error-message']}
                                            hidden={!requiredValues.isInvalidReceptionDate}
                                        >
                                            Valor requerido
                                        </Form.Text>
                                    </div>
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Prioridad de atención</Form.Label>
                                    <Form.Select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleDropdownChange}
                                    >
                                        <option value="">Seleccione una opción</option>
                                        <option value="LOW">Normal</option>
                                        <option value="URGENT">Alta</option>
                                    </Form.Select>
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Cliente*</Form.Label>
                                    {IS_EDITING && (
                                        <input
                                            type="hidden"
                                            name="client"
                                            value={formData.client || ''}
                                        />
                                    )}
                                    <div
                                        className={
                                            requiredValues.isInvalidClient
                                                ? classes['new-operation-form__form-input-w-message__invalid']
                                                : classes['new-operation-form__form-input-w-message']
                                        }
                                    >
                                        {renderClientDropdownOptions()}
                                        <Form.Text
                                            className={classes['operation-form__error-message']}
                                            hidden={!requiredValues.isInvalidClient}
                                        >
                                            Valor requerido
                                        </Form.Text>
                                    </div>
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Aduana de despacho*</Form.Label>
                                    <div
                                        className={
                                            requiredValues.isInvalidCustoms
                                                ? classes['new-operation-form__form-input-w-message__invalid']
                                                : classes['new-operation-form__form-input-w-message']
                                        }
                                    >
                                        {renderCustomsDropdownOptions()}
                                        <Form.Text
                                            hidden={!requiredValues.isInvalidCustoms}
                                            className={classes['operation-form__error-message']}
                                        >
                                            Valor requerido
                                        </Form.Text>
                                    </div>
                                </div>
                            </Col>
                            <Col>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Tipo de operación*</Form.Label>

                                    <div
                                        className={
                                            requiredValues.isInvalidOperationType
                                                ? classes['new-operation-form__form-input-w-message__invalid']
                                                : classes['new-operation-form__form-input-w-message']
                                        }
                                    >
                                        {IS_EDITING && (
                                            <input
                                                type="hidden"
                                                name="operation_type"
                                                value={formData.operation_type || ''}
                                            />
                                        )}
                                        <Form.Select
                                            disabled={IS_EDITING}
                                            name="operation_type"
                                            onChange={handleDropdownChange}
                                            value={formData.operation_type}
                                        >
                                            <option value="">Selecione una opción</option>
                                            <option value="A1">A1</option>
                                            <option value="M3">M3</option>
                                            {/* <option value="A4">A4</option>
                                            <option value="A3">A3</option> */}
                                        </Form.Select>
                                        <Form.Text
                                            hidden={!requiredValues.isInvalidOperationType}
                                            className={classes['operation-form__error-message']}
                                        >
                                            Valor requerido
                                        </Form.Text>
                                    </div>
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Referencia*</Form.Label>
                                    <InputGroup className={classes['new-operation-form__form-input-w-message']}>
                                        <Form.Control
                                            disabled
                                            name="reference"
                                            value={isFetchingReferenceNumber ? '' : reference || ''}
                                        />
                                        <input
                                            type="hidden"
                                            name="reference"
                                            value={reference || ''}
                                        />
                                        {isFetchingReferenceNumber && (
                                            <InputGroup.Text className={classes['input-group__text']}>
                                                <Spinner
                                                    animation="border"
                                                    variant="secondary"
                                                    size="sm"
                                                />
                                            </InputGroup.Text>
                                        )}
                                    </InputGroup>
                                </div>

                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Asesor cliente*</Form.Label>
                                    <div
                                        className={
                                            requiredValues.isInvalidSiemClientAdvisor
                                                ? classes['new-operation-form__form-input-w-message__invalid']
                                                : classes['new-operation-form__form-input-w-message']
                                        }
                                    >
                                        {renderUserDropdownOptions('siem_client_advisor')}
                                        <Form.Text
                                            hidden={!requiredValues.isInvalidSiemClientAdvisor}
                                            className={classes['operation-form__error-message']}
                                        >
                                            Valor requerido
                                        </Form.Text>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        {/** SECOND BLOCK */}
                        <Row
                            hidden={!IS_EDITING}
                            className={classes['operation-form__row']}
                        >
                            <h6>Tráfico y logística internacional</h6>
                            <Col className={classes['operation-form__column']}>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Forwarder</Form.Label>
                                    {renderForwarderDropdownOptions()}
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>ETA</Form.Label>
                                    <Form.Control
                                        disabled={!IS_EDITING}
                                        name="ETA"
                                        type="date"
                                        defaultValue={operationData?.ETA?.split('T')[0]}
                                    />
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Días libres usados</Form.Label>
                                    <Form.Control
                                        readOnly
                                        className={classes.readOnly}
                                        type="number"
                                        name="used_free_days"
                                        defaultValue={operationData?.used_free_days}
                                    />
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Contenedor</Form.Label>
                                    <Form.Control
                                        name="container"
                                        defaultValue={operationData?.container}
                                    />
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Peso</Form.Label>
                                    <Form.Control
                                        disabled={!IS_EDITING}
                                        name="weight"
                                        type="number"
                                        step="any"
                                        defaultValue={operationData?.weight || ''}
                                    />
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Bultos</Form.Label>
                                    <Form.Control
                                        disabled={!IS_EDITING}
                                        name="packages"
                                        type="number"
                                        defaultValue={operationData?.packages || ''}
                                    />
                                </div>
                            </Col>
                            <Col>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>MBL</Form.Label>
                                    <Form.Control
                                        // disabled
                                        name="MBL"
                                        defaultValue={operationData?.MBL || ''}
                                    />
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Días libres</Form.Label>
                                    <Form.Control
                                        disabled={!IS_EDITING}
                                        type="number"
                                        name="free_days"
                                        defaultValue={operationData?.free_days || ''}
                                    />
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Fecha de revalidación</Form.Label>
                                    <Form.Control
                                        readOnly
                                        className={classes.readOnly}
                                        type="date"
                                        name="revalidation_date"
                                        defaultValue={operationData?.revalidation_date || ''}
                                    />
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Tamaño de contenedor</Form.Label>
                                    <Form.Control
                                        // disabled
                                        name="container_size"
                                        defaultValue={operationData?.container_size || ''}
                                    />
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Unidad de peso</Form.Label>

                                    <Form.Select
                                        name="weight_unit"
                                        onChange={handleDropdownChange}
                                        value={formData.weight_unit}
                                    >
                                        <option value="">Seleccione una opción</option>
                                        <option value="TON">Toneladas</option>
                                        <option value="KG">Kilogramos</option>
                                        <option value="LB">Libras</option>
                                    </Form.Select>
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>CBM (Cubicaje)</Form.Label>
                                    <Form.Control
                                        disabled={!IS_EDITING}
                                        name="CBM"
                                        type="number"
                                        step="any"
                                        defaultValue={operationData?.CBM || ''}
                                    />
                                </div>
                            </Col>
                        </Row>
                        {/** THIRD BLOCK */}
                        <Row
                            hidden={!IS_EDITING}
                            className={classes['operation-form__row']}
                        >
                            <h6>Despacho aduanero</h6>
                            <Col className={classes['operation-form__column']}>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Proveedor</Form.Label>
                                    {renderSupplierDropdownOptions()}
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Tipo de Mercancía</Form.Label>
                                    {renderMerchandiseTypesDropdownOptions()}
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Fecha de entrada PIS</Form.Label>

                                    <Form.Control
                                        // disabled
                                        name="pis_entry_date"
                                        type="date"
                                        defaultValue={operationData?.pis_entry_date}
                                    />
                                </div>
                            </Col>
                            <Col>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Previo en origen</Form.Label>

                                    <Form.Select
                                        name="prior_in_origin"
                                        onChange={handleDropdownChange}
                                        value={formData.prior_in_origin}
                                    >
                                        <option value="">Seleccione una opción</option>
                                        <option value="true">Si</option>
                                        <option value="false">No</option>
                                    </Form.Select>
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Descripcion de mercancia</Form.Label>

                                    <Form.Control
                                        // disabled
                                        name="merchandise_description"
                                        defaultValue={operationData?.merchandise_description}
                                    />
                                </div>
                                {/**todo NO SE TIENE */}
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Bandera de buque</Form.Label>
                                    {renderCountriesDropdownOptions()}
                                </div>
                            </Col>
                        </Row>

                        {/** FOURTH BLOCK */}
                        <Row
                            hidden={!IS_EDITING}
                            className={classes['operation-form__row']}
                        >
                            <h6>Logística Nacional</h6>
                            <Col className={classes['operation-form__column']}>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Transportista</Form.Label>
                                    <Form.Control
                                        readOnly
                                        className={classes.readOnly}
                                        name="carrier"
                                        defaultValue={operationData?.carrier || ''}
                                    />
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Placas</Form.Label>
                                    <Form.Control
                                        readOnly
                                        className={classes.readOnly}
                                        name="license_plate"
                                        defaultValue={operationData?.license_plate}
                                    />
                                </div>
                                {/**todo NO SE TIENE */}
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Régimen de importación</Form.Label>
                                    <Form.Control
                                        readOnly
                                        className={classes.readOnly}
                                        name="import_regime"
                                        // defaultValue={operationData?.carrier}
                                    />
                                </div>
                                <div className={classes['new-operation-form__ta-form-group']}>
                                    <Form.Label>Observaciones</Form.Label>
                                    <Form.Control
                                        name="observation"
                                        as="textarea"
                                        style={{ height: '100px' }}
                                        defaultValue={operationData?.observation || ''}
                                    />
                                </div>
                            </Col>
                            <Col>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Unidad de tranporte</Form.Label>
                                    {/* <Form.Select
                                        name="transport_unit"
                                        onChange={handleDropdownChange}
                                        value={formData.transport_unit}
                                    >
                                        <option value="">Seleccione una opción</option>
                                        <option value="Dry box">Dry box</option>
                                        <option value="1-axle Rabón">1-axle Rabón</option>
                                        <option value="2-axle Tortón">2-axle Tortón</option>
                                        <option value="Double trailer">Double trailer</option>
                                        <option value="Platform">Platform</option>
                                        <option value="Refrigerated box">Refrigerated box</option>
                                        <option value="Tanker">Tanker</option>
                                        <option value="Light truck">Light truck</option>
                                        <option value="Trailer">Trailer</option>
                                        <option value="Chassis">Chassis</option>
                                        <option value="Unit truck">Unit truck</option>
                                    </Form.Select> */}
                                    <Form.Control
                                        readOnly
                                        className={classes.readOnly}
                                        name="transport_unit"
                                        defaultValue={operationData?.transport_unit || ''}
                                    />
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Número económico</Form.Label>
                                    <Form.Control
                                        readOnly
                                        className={classes.readOnly}
                                        type="number"
                                        name="economic_number"
                                        defaultValue={operationData?.economic_number}
                                    />
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Avance</Form.Label>
                                    <Form.Control
                                        readOnly
                                        className={classes.readOnly}
                                        type="number"
                                        name="progress"
                                        defaultValue={operationData?.progress}
                                    />
                                </div>
                                <div className={classes['new-operation-form__ta-form-group']}>
                                    <Form.Label>Rectificaciones</Form.Label>
                                    <Form.Control
                                        name="rectifications"
                                        as="textarea"
                                        style={{ height: '100px' }}
                                        defaultValue={operationData?.rectifications || ''}
                                    />
                                </div>
                            </Col>
                        </Row>

                        <Row className={classes['operation-form__row']}>
                            <h6>Equipo SIEM</h6>
                            <Col className={classes['operation-form__column']}>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Gerente de operaciones</Form.Label>
                                    {renderUserDropdownOptions('operations_manager')}
                                </div>

                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Gerente de contabilidad e impuestos</Form.Label>
                                    {renderUserDropdownOptions('accounting_manager')}
                                </div>

                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Gerente de logística nacional</Form.Label>
                                    {renderUserDropdownOptions('national_logistics_manager')}
                                </div>

                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Analista de operaciones aduaneras</Form.Label>
                                    {renderUserDropdownOptions('siem_advisor')}
                                </div>

                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Ejecutivo/a de operaciones</Form.Label>
                                    {renderUserDropdownOptions('operations_executive')}
                                </div>

                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Clasificador/a</Form.Label>
                                    {renderUserDropdownOptions('classifier')}
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Director/a de operaciones</Form.Label>
                                    {renderUserDropdownOptions('operations_director')}
                                </div>
                            </Col>
                            <Col>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Gerente de tráfico y logística</Form.Label>
                                    {renderUserDropdownOptions('traffic_and_logistics_manager')}
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Gerente de cumplimiento aduanero</Form.Label>
                                    {renderUserDropdownOptions('customs_compliance_manager')}
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Supervisor/a de operaciones logísticas</Form.Label>
                                    {renderUserDropdownOptions('logistics_supervisor')}
                                </div>

                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Analista senior de tráfico y logistica</Form.Label>
                                    {renderUserDropdownOptions('senior_traffic_logistics_analyst')}
                                </div>

                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Documentador/a operativo/a</Form.Label>
                                    {renderUserDropdownOptions('operational_documenter')}
                                </div>

                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Operador/a</Form.Label>
                                    {renderUserDropdownOptions('operator')}
                                </div>
                                <div className={classes['new-operation-form__form-group']}>
                                    <Form.Label>Contador/a</Form.Label>
                                    {renderUserDropdownOptions('accountant')}
                                </div>
                            </Col>
                        </Row>

                        <Row style={{ marginTop: 25 }}>
                            <div className="d-flex justify-content-end">
                                <Button
                                    size="lg"
                                    type="submit"
                                    disabled={isLoadingCreateOperation}
                                    className={`siem-primary-button ${classes['new-operation-form__submit-button']}`}
                                >
                                    {(isLoadingCreateOperation || isLoadingUpdatingOperation) && (
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            style={{ marginRight: 20 }}
                                        />
                                    )}
                                    {isLoadingCreateOperation ? 'Creando...' : handleSubmitButtonText()}
                                </Button>
                            </div>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default OperationForm;
