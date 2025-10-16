import classes from './CustomTable.module.scss';
import { useDeactivateCustomMutation, useLazyGetCustomsQuery } from '@store/api/api.slice';
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
import { TableSearchBar } from '@components/index';
import TablePagination, { PAGE_SIZE } from '@components/TablePagination/TablePagination';
import { getQueryString } from '@utils/utils.types';

interface CustomsTableProps extends HTMLAttributes<HTMLDivElement> {}

const CustomsTable: FC<CustomsTableProps> = ({ style }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const searchRef = useRef<string>('');
    const [resetOffset, setResetOffset] = useState<boolean>(false);
    const [getCustoms, { data: customsData, isLoading }] = useLazyGetCustomsQuery();
    const [showModal, setShowModal] = useState<boolean>(false);
    const idRef = useRef<number>(-1);
    const messageRef = useRef<string>('');
    const [handleDeleteCustomById, { isLoading: isLoadingDeleteCustom }] = useDeactivateCustomMutation();

    useEffect(() => {
        getCustoms();
    }, []);

    const handleGoToCustomInfo = (id: number) => {
        navigate(`/customs/${id}/form/`);
    };

    const handleDeleteCustom = (id: number, name: string) => {
        idRef.current = id;
        messageRef.current = `¿Estás seguro de querer borrar la aduana ${name}?`;
        setShowModal(true);
    };

    const onConfirmModal = async () => {
        setShowModal(false);

        try {
            await handleDeleteCustomById(idRef.current).unwrap();
            dispatch(appIsToasting({ message: '¡Exito al borrar aduana!', isError: false, show: true }));
            getCustoms(`?search=${searchRef.current}`);
        } catch (error) {
            dispatch(appIsToasting({ message: 'Error al borrar aduana.', isError: true, show: true }));
        }
    };

    const handleCustomsSearch = (search: string) => {
        searchRef.current = search;
        setResetOffset(true);
        getCustoms(`?search=${search}`);
    };

    const handleClearSearch = () => {
        searchRef.current = '';
        getCustoms();
        setResetOffset(true);
    };

    const handleOnBlurCustomsSearch = () => {
        if (searchRef.current === '') {
            getCustoms();
            setResetOffset(true);
        }
    };

    const handleGoToPage = (page: number) => {
        const newOffset = (page - 1) * PAGE_SIZE;
        getCustoms(`?limit=10&offset=${newOffset}&search=${searchRef.current}`);
    };

    const handleGetNextCustoms = () => {
        getCustoms(getQueryString(customsData!.next!));
    };

    const handleGetPreviousCustoms = () => {
        getCustoms(getQueryString(customsData!.previous!));
    };

    const memoRenderTableContent = useMemo(() => {
        if (!customsData?.results || customsData?.results.length === 0) {
            return (
                <tr>
                    <td
                        colSpan={8}
                        className="text-center"
                    >
                        No hay aduanas
                    </td>
                </tr>
            );
        }

        return customsData?.results.map((custom) => {
            return (
                <tr key={custom.id}>
                    <td>{custom.customs_name}</td>
                    <td>{custom.customs_key}</td>
                    <td>{new Date(custom.updated_at).toLocaleDateString()}</td>
                    <td>
                        <FiEdit
                            className={classes['custom-table-action-button']}
                            onClick={() => handleGoToCustomInfo(custom.id)}
                        />
                        <GoTrash
                            className={`${classes['custom-table-action-button']} siem-delete-icon-button`}
                            onClick={() => handleDeleteCustom(custom.id, custom.customs_name)}
                        />
                    </td>
                </tr>
            );
        });
    }, [customsData?.results]);

    return (
        <>
            <Card
                className={classes['custom-table']}
                style={style}
            >
                <div
                    id="input"
                    style={{ flex: 1 }}
                    className="d-flex justify-content-end align-items-center"
                >
                    <div className="w-50">
                        <TableSearchBar
                            placeholder="Buscar Aduana"
                            onSearch={handleCustomsSearch}
                            onBlur={handleOnBlurCustomsSearch}
                            onClearSearch={handleClearSearch}
                        />
                    </div>
                </div>
                <div>
                    {isLoading || isLoadingDeleteCustom ? (
                        <div className="text-center my-4">
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
                                    <th>Nombre de Aduana</th>
                                    <th>Clave de aduana</th>
                                    <th>Última actualización</th>
                                    <th>Accion</th>
                                </tr>
                            </thead>
                            <tbody>{memoRenderTableContent}</tbody>
                        </Table>
                    )}
                    <TablePagination
                        data={customsData}
                        resetOffset={resetOffset}
                        handleGoToPage={handleGoToPage}
                        onNextClick={handleGetNextCustoms}
                        onPreviousClick={handleGetPreviousCustoms}
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

export default CustomsTable;
