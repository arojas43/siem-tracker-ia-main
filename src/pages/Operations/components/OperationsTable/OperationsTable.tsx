import classes from './OperationTable.module.scss';
import { useDeactivateOperationMutation, useLazyGetOperationsQuery } from '@store/api/operationApi.slice';
import type { FC , HTMLAttributes} from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Card from 'react-bootstrap/esm/Card';
import Dropdown from 'react-bootstrap/esm/Dropdown';
import Table from 'react-bootstrap/esm/Table';
import Spinner from 'react-bootstrap/esm/Spinner';
import { BsThreeDots } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { TABS_NAMES } from '../OperationNavTabs/OperationNavTabs.types';
import ConfirmationModal from '@components/ConfirmationModal';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { appIsToasting } from '@store/AppState/appState.slice';
import useUserType from '@hooks/userType.hooks';
import TablePagination from '@components/TablePagination';
import { PAGE_SIZE } from '@components/TablePagination/TablePagination';
import { StatusBadge, TableSearchBar } from '@components/index';
import { getQueryString } from '@utils/utils.types';
import {
    PHASE_STATUS_DICTIONARY,
    PHASE_STATUS_TEXT_DICTIONARY,
} from '../../pages/OperationPhases/OperationPhasesPage.types';
import type { StatusBadgeStatus } from '@components/StatusBadge/StatusBadge.types';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/esm/OverlayTrigger';
import Tooltip from 'react-bootstrap/esm/Tooltip';

// Componente para mostrar el nombre del proveedor expandible
const SupplierNameExpandable: React.FC<{ name: string }> = ({ name }) => {
    // Forzar a string siempre
    const safeName = name;
    const [expanded, setExpanded] = useState(false);
    const maxLength = 15; // Número de caracteres visibles
    const isLong = safeName && safeName.length > maxLength;
    const displayText = !expanded && isLong ? safeName.slice(0, maxLength) + '...' : safeName;

    // Si está expandido, mostrar multi-línea
    return (
        <span
            style={{
                display: 'inline-block',
                whiteSpace: expanded ? 'normal' : 'nowrap',
                cursor: isLong ? 'pointer' : 'default',
                verticalAlign: 'middle',
                wordBreak: 'break-word',
                maxWidth: 180,
            }}
            onClick={() => isLong && setExpanded(!expanded)}
            title={isLong && !expanded ? safeName : ''}
        >
            {displayText}
        </span>
    );
};

interface OperationsTableProps extends HTMLAttributes<HTMLDivElement> {}

const OperationsTable: FC<OperationsTableProps> = ({ style }) => {
    // const [offset, setOffset] = useState<number>(0);
    const [resetOffset, setResetOffset] = useState<boolean>(false);
    const { isClient, isSIEM, isSuperUser } = useUserType();
    const isLocal = import.meta.env.VITE_ENV === 'local';
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    // const [search, setSearch] = useState<string>('');
    const [getOperations, { data: operationData, isLoading, isFetching }] = useLazyGetOperationsQuery();

    const [showModal, setShowModal] = useState<boolean>(false);
    const searchRef = useRef<string>('');

    const idRef = useRef<number>(-1);
    const messageRef = useRef<string>('');
    const operationCodeRef = useRef<string>('');

    const [
        handleDeactivateOperationById,
        { isSuccess: isSuccessDeactivateOperation, isError: isErrorDeactivateOperation },
    ] = useDeactivateOperationMutation();

    useEffect(() => {
        if (isClient) {
            getOperations('?include_pedimentos=true');
        } else {
            getOperations();
        }
    }, [isClient]);

    useEffect(() => {
        if (resetOffset) {
            console.log('operation to false');
            setResetOffset(false);
        }
    }, [resetOffset]);

    useEffect(() => {
        if (isSuccessDeactivateOperation) {
            dispatch(appIsToasting({ message: '¡Exito al borrar operación!', isError: false, show: true }));
            // todo find a better way of doing this.
            getOperations();
            return;
        }

        if (isErrorDeactivateOperation) {
            dispatch(appIsToasting({ message: 'Error al tratar de borrar operación.', isError: true, show: true }));
            return;
        }
    }, [isSuccessDeactivateOperation, isErrorDeactivateOperation]);

    const handleGoToClientOperationInfo = (id: string) => {
        navigate(`/operations/client/${id}`);
    };

    const handleGoToClientDocuments = (id: string) => {
        navigate(`/operations/client/documents/${id}`);
    };

    const handleGoToOperationInfo = (id: string, tab: string) => {
        navigate(`/operations/info/${id}/${tab}`);
    };

    const handleDeleteOperation = (id: number, operationCode: string) => {
        idRef.current = id;
        operationCodeRef.current = operationCode;
        messageRef.current = `¿Estás seguro de querer borrar operación ${operationCode}?`;
        setShowModal(true);
    };

    const onConfirmModal = () => {
        setShowModal(false);
        handleDeactivateOperationById(idRef.current);
    };

    const handleGetPreviousOperations = () => {
        // const newOffset = Math.max(0, offset - PAGE_SIZE);
        // setOffset(newOffset);
        // getOperations(operationData!.previous);
        if (isClient) {
            const prevQuery = getQueryString(operationData!.previous);
            const prevWithPedimentos = prevQuery.includes('include_pedimentos=true')
                ? prevQuery
                : `${prevQuery}${prevQuery.includes('?') ? '&' : '?'}include_pedimentos=true`;
            getOperations(prevWithPedimentos);
        } else {
            getOperations(getQueryString(operationData!.previous));
        }
    };

    const handleGetNextOperations = () => {
        // const newOffset = offset + PAGE_SIZE;
        // setOffset(newOffset);
        // getOperations(operationData!.next);
        if (isClient) {
            const nextQuery = getQueryString(operationData!.next);
            const nextWithPedimentos = nextQuery.includes('include_pedimentos=true')
                ? nextQuery
                : `${nextQuery}${nextQuery.includes('?') ? '&' : '?'}include_pedimentos=true`;
            getOperations(nextWithPedimentos);
        } else {
            getOperations(getQueryString(operationData!.next));
        }
    };

    const handleOperationSearch = (search: string) => {
        console.log('handleOperationSearch', search);
        searchRef.current = search;
        // setOffset(1);
        setResetOffset(true);
        // setSearch(e.currentTarget.value);
        // getOperations(`${OPERATIONS_ENDPOINT}?search=${search}`);
        if (isClient) {
            getOperations(`?search=${search}&include_pedimentos=true`);
        } else {
            getOperations(`?search=${search}`);
        }
    };

    const handleOnBlurOperationSearch = () => {
        // const currentValue = e.currentTarget.value.trim();
        // const previousValue = prevSearchRef.current.trim();

        // if (previousValue !== '' && currentValue === '') {
        // setOffset(1);
        setResetOffset(true);
        // setSearch('');
        searchRef.current = '';
        getOperations();
        // }

        // prevSearchRef.current = currentValue;
    };

    const memoRenderTableContent = useMemo(() => {
        if (!operationData || operationData.results.length === 0) {
            return (
                <tr>
                    <td
                        colSpan={isClient ? 7 : 8}
                        className="text-center"
                    >
                        No hay datos
                    </td>
                </tr>
            );
        }

        return operationData.results.map((operation) => {
            // Unifica el renderizado del dropdown menu para ambos tipos de usuario

            if (isClient) {
                // Tabla para usuario externo
                const { id, supplier_name, container, customs_declaration_info, status, operation_code, ETA } =
                    operation;
                return (
                    <tr key={id}>
                        <td style={{ maxWidth: 180 }}>
                            {supplier_name ? <SupplierNameExpandable name={supplier_name} /> : <span>-</span>}
                        </td>
                        <td>{container || '-'}</td>
                        <td>{ETA ? new Date(ETA).toLocaleDateString() : '-'}</td>
                        <td>{customs_declaration_info?.detailed_customs_declaration || '-'}</td>
                        <td>{customs_declaration_info?.rectified_customs_declaration || '-'}</td>
                        <td>
                            <StatusBadge
                                text={PHASE_STATUS_TEXT_DICTIONARY[status.toLocaleLowerCase()]}
                                status={PHASE_STATUS_DICTIONARY[status.toLocaleLowerCase()] as StatusBadgeStatus}
                            />
                        </td>
                        <td className="text-center">
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant="link"
                                    className=" text-dark dropdown-toggle-none d-flex align-items-center justify-content-center"
                                >
                                    <BsThreeDots size={20} />
                                </Dropdown.Toggle>

                                {renderDropdownMenu({
                                    operation_code,
                                    id,
                                    isClient,
                                    isSIEM,
                                    isSuperUser,
                                    handleGoToClientOperationInfo,
                                    handleGoToClientDocuments,
                                    handleGoToOperationInfo,
                                    handleDeleteOperation,
                                    TABS_NAMES,
                                    classes,
                                })}
                            </Dropdown>
                        </td>
                    </tr>
                );
            } 
                // Tabla para usuarios internos
                const formattedDate = new Date(operation.created_at).toLocaleDateString();
                const { id, client_info, operation_code, status, siem_client_advisor_info, operation_type } = operation;

                return (
                    <tr key={id}>
                        <td>{operation_code}</td>
                        <td hidden={!isLocal}>{operation_type}</td>
                        <td>{formattedDate}</td>
                        <td>{client_info?.client_name || ''}</td>
                        <td className={classes['advisor-column']}>
                            <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip id="advisor-name-tooltip">
                                        {siem_client_advisor_info?.siem_client_advisor_name || 'Unknown'}
                                    </Tooltip>
                                }
                            >
                                <Image
                                    style={{ width: 45, height: 45, objectFit: 'cover' }}
                                    src={siem_client_advisor_info?.siem_client_advisor_photo || ''}
                                    alt={siem_client_advisor_info?.siem_client_advisor_name}
                                    roundedCircle
                                />
                            </OverlayTrigger>
                        </td>
                        <td className={classes['status-column']}>
                            <StatusBadge
                                text={PHASE_STATUS_TEXT_DICTIONARY[status.toLocaleLowerCase()]}
                                status={PHASE_STATUS_DICTIONARY[status.toLocaleLowerCase()] as StatusBadgeStatus}
                            />
                        </td>
                        <td className="text-center">
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant="link"
                                    className=" text-dark dropdown-toggle-none d-flex align-items-center justify-content-center"
                                >
                                    <BsThreeDots size={20} />
                                </Dropdown.Toggle>

                                {renderDropdownMenu({
                                    operation_code,
                                    id,
                                    isClient,
                                    isSIEM,
                                    isSuperUser,
                                    handleGoToClientOperationInfo,
                                    handleGoToClientDocuments,
                                    handleGoToOperationInfo,
                                    handleDeleteOperation,
                                    TABS_NAMES,
                                    classes,
                                })}
                            </Dropdown>
                        </td>
                    </tr>
                );
            
        });
    }, [operationData?.results, isClient]);

    // --- Renderizado unificado del Dropdown.Menu ---
    function renderDropdownMenu({
        operation_code,
        id,
        isClient,
        isSIEM,
        isSuperUser,
        handleGoToClientOperationInfo,
        handleGoToClientDocuments,
        handleGoToOperationInfo,
        handleDeleteOperation,
        TABS_NAMES,
        classes,
    }: any) {
        return (
            <Dropdown.Menu className={classes['tempo']}>
                {/* CLIENT MENU OPTIONS */}
                <Dropdown.Item
                    hidden={isSIEM && !isSuperUser}
                    onClick={() => handleGoToClientOperationInfo(operation_code)}
                >
                    Ver línea del tiempo
                </Dropdown.Item>
                <Dropdown.Item
                    hidden={isSIEM && !isSuperUser}
                    onClick={() => handleGoToClientDocuments(operation_code)}
                >
                    Documentos
                </Dropdown.Item>
                {/* SIEM MENU OPTIONS */}
                <Dropdown.Item
                    hidden={isClient}
                    onClick={() => handleGoToOperationInfo(operation_code, TABS_NAMES.PHASES)}
                >
                    Ver operación
                </Dropdown.Item>
                <Dropdown.Item
                    hidden={isClient}
                    onClick={() => handleGoToOperationInfo(operation_code, TABS_NAMES.FORM)}
                >
                    Editar
                </Dropdown.Item>
                <Dropdown.Item
                    hidden={isClient}
                    onClick={() => handleDeleteOperation(id, operation_code)}
                >
                    Eliminar
                </Dropdown.Item>
            </Dropdown.Menu>
        );
    }

    // const currentPage = useMemo(() => {
    //     if (!operationData?.next && !operationData?.previous) return 1;
    //     return Math.floor(offset / PAGE_SIZE) + 1;
    // }, [operationData]);
    // // const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
    // // const totalPages = Math.ceil((operationData?.count || 0) / PAGE_SIZE);
    // const totalPages = useMemo(() => {
    //     return Math.ceil((operationData?.count || 0) / PAGE_SIZE);
    // }, [operationData]);

    // const getPageNumbers = (current: number, total: number, delta = 2) => {
    //     const range: (number | string)[] = [];
    //     const left = Math.max(1, current - delta);
    //     const right = Math.min(total, current + delta);

    //     for (let i = 1; i <= total; i++) {
    //         if (i === 1 || i === total || (i >= left && i <= right)) {
    //             range.push(i);
    //         } else if ((i === left - 1 && left > 2) || (i === right + 1 && right < total - 1)) {
    //             range.push('...');
    //         }
    //     }

    //     return [...new Set(range)];
    // };

    const handleGoToPage = (page: number) => {
        const newOffset = (page - 1) * PAGE_SIZE;
        // setOffset(newOffset);
        // getOperations(`${OPERATIONS_ENDPOINT}?limit=10&offset=${newOffset}&search=${searchRef.current}`);
        if (isClient) {
            getOperations(`?limit=10&offset=${newOffset}&search=${searchRef.current}&include_pedimentos=true`);
        } else {
            getOperations(`?limit=10&offset=${newOffset}&search=${searchRef.current}`);
        }
    };

    const handleClearSearch = () => {
        searchRef.current = '';
        getOperations();
        setResetOffset(true);
    };
    return (
        <>
            <Card
                className={classes['operation-table']}
                style={style}
            >
                <div
                    className={`${classes['operation-table_filters']} mb-2 d-flex justify-content-between align-items-center`}
                >
                    <Card.Title
                        style={{ paddingTop: 5 }}
                        as="h5"
                        className="flex-grow-1"
                    >
                        Mis Operaciones
                    </Card.Title>

                    <div
                        id="input"
                        style={{ flex: 1 }}
                        className="d-flex justify-content-end align-items-center"
                    >
                        {/* <InputGroup className={`me-2 ${classes['operation-table__input--group']}`}>
                            <InputGroup.Text className={classes['operation-table__input--icon']}>
                                <FaSearch size={20} />
                            </InputGroup.Text>

                            <Form.Control
                                size="sm"
                                type="text"
                                placeholder="Busca operacion"
                                className={`me-2 ${classes['operation-table__input']}`}
                                // onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleOperationSearch}
                                onBlur={handleOnBlurOperationSearch}
                            />
                        </InputGroup> */}
                        <TableSearchBar
                            placeholder="Buscar Operación"
                            onSearch={handleOperationSearch}
                            onClearSearch={handleClearSearch}
                            onBlur={handleOnBlurOperationSearch}
                        />

                        {/* <InputGroup>
                            <InputGroup className={`me-2 ${classes['operation-table__input--group']}`}>
                                <InputGroup.Text className={classes['operation-table__input--icon']}>
                                    <FaSearch size={20} />
                                </InputGroup.Text>

                                <Form.Control
                                    size="sm"
                                    type="text"
                                    placeholder="Busca operacion"
                                    className={`me-2 ${classes['operation-table__input']}`}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleOperationSearch}
                                    onBlur={handleOnBlurOperationSearch}
                                />
                                <InputGroup.Text
                                    hidden={!search}
                                    className={classes['operation-table__input--icon']}
                                    onClick={handleClearSearch}
                                >
                                    <IoMdClose size={20} />
                                </InputGroup.Text>
                            </InputGroup>
                        </InputGroup> */}
                        {/* <Dropdown>
                            <Dropdown.Toggle
                                disabled
                                className={classes['operation-table__dropdown']}
                                id="dropdown-basic"
                            >
                                Filtros
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item href="#/action-1">Filtro 1</Dropdown.Item>
                                <Dropdown.Item href="#/action-2">Filtro 2</Dropdown.Item>
                                <Dropdown.Item href="#/action-3">Filtro 3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown> */}
                    </div>
                </div>
                {/* <div style={{ overflow: 'auto' }}> */}
                <div className={classes['operation-table_container']}>
                    {isLoading || isFetching ? (
                        <div
                            className="text-center my-4"
                            style={{ height: 420 }}
                        >
                            <Spinner
                                animation="border"
                                role="status"
                            >
                                <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <div style={{ height: 670 }}>
                            <Table
                                hover
                                className={classes['tempo']}
                            >
                                <thead>
                                    <tr>
                                        {isClient ? (
                                            <>
                                                <th>Proveedor</th>
                                                <th>Contenedor</th>
                                                <th>ETA</th>
                                                <th>Pedimento</th>
                                                <th>Rectificado</th>
                                                <th>Estatus</th>
                                                <th>Acción</th>
                                            </>
                                        ) : (
                                            <>
                                                <th>Referencia</th>
                                                <th hidden={!isLocal}>Tipo de Operacion</th>
                                                <th>Fecha de creacion</th>
                                                <th>Cliente</th>
                                                <th className={classes['advisor-column']}>Asesor</th>
                                                <th className={classes['status-column']}>Estatus</th>
                                                <th>Accion</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>{memoRenderTableContent}</tbody>
                            </Table>
                        </div>
                    )}
                    <TablePagination
                        resetOffset={resetOffset}
                        data={operationData}
                        handleGoToPage={handleGoToPage}
                        onNextClick={handleGetNextOperations}
                        onPreviousClick={handleGetPreviousOperations}
                    />
                </div>
            </Card>
            <ConfirmationModal
                show={showModal}
                message={messageRef.current}
                onConfirm={onConfirmModal}
                onCancel={() => setShowModal(false)}
            />
        </>
    );
};

export default OperationsTable;
