import classes from './ClientTable.module.scss';
import { useDeactivateClientMutation, useLazyGetClientsQuery } from '@store/api/api.slice';
import type { HTMLAttributes, FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Card from 'react-bootstrap/esm/Card';
import Table from 'react-bootstrap/esm/Table';
import Spinner from 'react-bootstrap/esm/Spinner';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '@components/ConfirmationModal';
import { useAppDispatch } from '@hooks/reduxTyped.hooks';
import { appIsToasting } from '@store/AppState/appState.slice';
import { GoTrash } from 'react-icons/go';
import { FiEdit } from 'react-icons/fi';
import { Image } from 'react-bootstrap';
import { TablePagination, TableSearchBar } from '@components/index';
import { PAGE_SIZE } from '@components/TablePagination/TablePagination';
import { getQueryString } from '@utils/utils.types';

interface ClientsTableProps extends HTMLAttributes<HTMLDivElement> {}

const ClientsTable: FC<ClientsTableProps> = ({ style }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const searchRef = useRef<string>('');
    const [resetOffset, setResetOffset] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const idRef = useRef<number>(-1);
    const messageRef = useRef<string>('');
    const [handleDeleteClientById, { isLoading: isLoadingDeleteClient }] = useDeactivateClientMutation();
    const [getClients, { data: clientData, isLoading }] = useLazyGetClientsQuery();

    useEffect(() => {
        getClients();
    }, []);

    const handleGoToClientInfo = (id: number) => {
        navigate(`/clients/${id}/form/`);
    };

    const handleDeleteClient = (id: number, name: string) => {
        idRef.current = id;
        messageRef.current = `¿Estás seguro de querer borrar al cliente ${name}?`;
        setShowModal(true);
    };

    const onConfirmModal = async () => {
        setShowModal(false);

        try {
            /** SE HACE DE ESTA MANERA PORQ EL BE TIENE UN DESMADRE Y NO SIGUE LA MISMA SINTAXIS EN SUS ENDPOINTS */
            const formData = new FormData();
            formData.append('data', JSON.stringify({ is_active: false }));
            await handleDeleteClientById({ clientId: idRef.current, body: formData }).unwrap();
            dispatch(appIsToasting({ message: '¡Exito al borrar cliente!', isError: false, show: true }));
            getClients(`?search=${searchRef.current}`);
        } catch (error) {
            dispatch(appIsToasting({ message: 'Error al borrar cliente.', isError: true, show: true }));
        }
    };

    const handleClientSearch = (search: string) => {
        searchRef.current = search;
        setResetOffset(true);
        getClients(`?search=${search}`);
    };

    const handleClearSearch = () => {
        searchRef.current = '';
        getClients();
        setResetOffset(true);
    };

    const handleOnBlurClientSearch = () => {
        if (searchRef.current === '') {
            getClients();
            setResetOffset(true);
        }
    };

    const handleGoToPage = (page: number) => {
        const newOffset = (page - 1) * PAGE_SIZE;
        getClients(`?limit=10&offset=${newOffset}&search=${searchRef.current}`);
    };

    const handleGetNextClients = () => {
        getClients(getQueryString(clientData!.next!));
    };

    const handleGetPreviousClients = () => {
        getClients(getQueryString(clientData!.previous!));
    };

    const memoRenderTableContent = useMemo(() => {
        if (!clientData?.results || clientData?.results.length === 0) {
            return (
                <tr>
                    <td
                        colSpan={8}
                        className="text-center"
                    >
                        No hay clientes
                    </td>
                </tr>
            );
        }

        return clientData?.results.map((client) => {
            return (
                <tr key={client.id}>
                    <td>{client.full_name}</td>
                    <td>{client.address}</td>
                    <td>
                        <Image
                            src={client.logo}
                            roundedCircle
                            className={classes['client-table-logo']}
                        />
                    </td>
                    <td>
                        <FiEdit
                            className={classes['client-table-action-button']}
                            onClick={() => handleGoToClientInfo(client.id)}
                        />
                        <GoTrash
                            className={`${classes['client-table-action-button']} siem-delete-icon-button`}
                            onClick={() => handleDeleteClient(client.id, client.full_name)}
                        />
                    </td>
                </tr>
            );
        });
    }, [clientData?.results]);

    return (
        <>
            <Card
                className={classes['client-table']}
                style={style}
            >
                <div
                    id="input"
                    style={{ flex: 1 }}
                    className="d-flex justify-content-end align-items-center"
                >
                    <div className="w-50">
                        <TableSearchBar
                            placeholder="Buscar Cliente"
                            onSearch={handleClientSearch}
                            onBlur={handleOnBlurClientSearch}
                            onClearSearch={handleClearSearch}
                        />
                    </div>
                </div>
                <div>
                    {isLoading || isLoadingDeleteClient ? (
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
                        <Table hover>
                            <thead>
                                <tr>
                                    <th>Nombre o denominación fiscal</th>
                                    <th>Domicilio fiscal</th>
                                    <th>Logo</th>
                                    <th>Accion</th>
                                </tr>
                            </thead>
                            <tbody>{memoRenderTableContent}</tbody>
                        </Table>
                    )}
                    <TablePagination
                        data={clientData}
                        resetOffset={resetOffset}
                        handleGoToPage={handleGoToPage}
                        onNextClick={handleGetNextClients}
                        onPreviousClick={handleGetPreviousClients}
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

export default ClientsTable;
