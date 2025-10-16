import classes from './SupplierTable.module.scss';
import { useDeactivateSupplierMutation, useLazyGetSuppliersQuery } from '@store/api/api.slice';
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

interface SuppliersTableProps extends HTMLAttributes<HTMLDivElement> {}

const SuppliersTable: FC<SuppliersTableProps> = ({ style }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const searchRef = useRef<string>('');
    const [resetOffset, setResetOffset] = useState<boolean>(false);
    const [getSuppliers, { data: suppliersData, isLoading }] = useLazyGetSuppliersQuery();
    const [showModal, setShowModal] = useState<boolean>(false);
    const idRef = useRef<number>(-1);
    const messageRef = useRef<string>('');
    const [handleDeleteSupplierById, { isLoading: isLoadingDeleteSupplier }] = useDeactivateSupplierMutation();

    useEffect(() => {
        getSuppliers();
    }, []);

    const handleGoToSupplierInfo = (id: number) => {
        navigate(`/suppliers/${id}/form/`);
    };

    const handleDeleteSupplier = (id: number, name: string) => {
        idRef.current = id;
        messageRef.current = `¿Estás seguro de querer borrar el proveedor ${name}?`;
        setShowModal(true);
    };

    const onConfirmModal = async () => {
        setShowModal(false);

        try {
            await handleDeleteSupplierById(idRef.current).unwrap();
            dispatch(appIsToasting({ message: '¡Exito al borrar proveedor!', isError: false, show: true }));
            getSuppliers(`?search=${searchRef.current}`);
        } catch (error) {
            dispatch(appIsToasting({ message: 'Error al borrar proveedor.', isError: true, show: true }));
        }
    };

    const handleSupplierSearch = (search: string) => {
        searchRef.current = search;
        setResetOffset(true);
        getSuppliers(`?search=${search}`);
    };

    const handleClearSearch = () => {
        searchRef.current = '';
        getSuppliers();
        setResetOffset(true);
    };

    const handleOnBlurSupplierSearch = () => {
        if (searchRef.current === '') {
            getSuppliers();
            setResetOffset(true);
        }
    };

    const handleGoToPage = (page: number) => {
        const newOffset = (page - 1) * PAGE_SIZE;
        getSuppliers(`?limit=10&offset=${newOffset}&search=${searchRef.current}`);
    };

    const handleGetNextSuppliers = () => {
        getSuppliers(getQueryString(suppliersData!.next!));
    };

    const handleGetPreviousSuppliers = () => {
        getSuppliers(getQueryString(suppliersData!.previous!));
    };

    const memoRenderTableContent = useMemo(() => {
        if (!suppliersData?.results || suppliersData?.results.length === 0) {
            return (
                <tr>
                    <td
                        colSpan={8}
                        className="text-center"
                    >
                        No hay proveedores
                    </td>
                </tr>
            );
        }

        return suppliersData?.results.map((supplier) => {
            return (
                <tr key={supplier.id}>
                    <td>{supplier?.supplier_name || '—'}</td>
                    <td>
                        {supplier?.supplier_country_info && supplier.supplier_country_info.name
                            ? supplier.supplier_country_info.name
                            : '—'}
                    </td>
                    <td>{supplier?.tax_id || '—'}</td>
                    <td>{supplier?.tax_address || '—'}</td>
                    <td>
                        {supplier?.supplier_language_info && supplier.supplier_language_info.name
                            ? supplier.supplier_language_info.name
                            : '—'}
                    </td>
                    <td>
                        <FiEdit
                            className={classes['supplier-table-action-button']}
                            onClick={() => handleGoToSupplierInfo(supplier.id)}
                        />
                        <GoTrash
                            className={`${classes['supplier-table-action-button']} siem-delete-icon-button`}
                            onClick={() => handleDeleteSupplier(supplier.id, supplier.supplier_name)}
                        />
                    </td>
                </tr>
            );
        });
    }, [suppliersData?.results]);

    return (
        <>
            <Card
                className={classes['supplier-table']}
                style={style}
            >
                <div
                    id="input"
                    style={{ flex: 1 }}
                    className="d-flex justify-content-end align-items-center"
                >
                    <div className="w-50">
                        <TableSearchBar
                            placeholder="Buscar Proveedor"
                            onSearch={handleSupplierSearch}
                            onBlur={handleOnBlurSupplierSearch}
                            onClearSearch={handleClearSearch}
                        />
                    </div>
                </div>
                <div>
                    {isLoading || isLoadingDeleteSupplier ? (
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
                                    <th>Nombre de Proovedor</th>
                                    <th>País</th>
                                    <th>TaxID (RFC proveedor)</th>
                                    <th>Domicilio fiscal</th>
                                    <th>Idioma proveedor</th>
                                    <th>Accion</th>
                                </tr>
                            </thead>
                            <tbody>{memoRenderTableContent}</tbody>
                        </Table>
                    )}
                    <TablePagination
                        data={suppliersData}
                        resetOffset={resetOffset}
                        handleGoToPage={handleGoToPage}
                        onNextClick={handleGetNextSuppliers}
                        onPreviousClick={handleGetPreviousSuppliers}
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

export default SuppliersTable;
