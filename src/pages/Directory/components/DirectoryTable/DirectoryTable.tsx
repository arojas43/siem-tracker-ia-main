import React, { useState, useEffect } from 'react';
import type { DirectoryRequest, DirectoryUser } from '../../../../store/api/api.types';
import { useGetDirectoryQuery } from '../../../../store/api/api.slice';
import classes from './DirectoryTable.module.scss';

import TablePagination from '../../../../components/TablePagination/TablePagination';

interface DirectoryTableProps {
    search: string;
}

const PAGE_SIZE = 9;

const DirectoryTable: React.FC<DirectoryTableProps> = ({ search }) => {
    const [filters] = useState<DirectoryRequest>({ search: '' });
    const [page, setPage] = useState(1);
    const [resetOffset, setResetOffset] = useState(false);

    const offset = (page - 1) * PAGE_SIZE;
    const params: DirectoryRequest = {
        ...filters,
        search: search || undefined,
        limit: PAGE_SIZE,
        offset,
    };
    const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');

    const { data, isLoading, error } = useGetDirectoryQuery(queryString ? `?${queryString}` : '');
    const users = data?.results || [];
    const total = data?.count || 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    useEffect(() => {
        setPage(1);
        setResetOffset(true);
    }, [search]);

    const handleGoToPage = (newPage: number) => {
        setPage(newPage);
        setResetOffset(false);
    };

    return (
        <div className={classes['directory-table']}>
            {isLoading && <div>Cargando...</div>}
            {error && <div>Error al cargar el directorio</div>}
            <div className={classes['directory-table__cards']}>
                {users.map((user: DirectoryUser) => (
                    <div
                        key={user.id}
                        className={classes['directory-card']}
                    >
                        <img
                            src={
                                user.profile_photo ||
                                'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.full_name)
                            }
                            alt={user.full_name}
                            className={classes['directory-card__photo']}
                        />
                        <div className={classes['directory-card__info']}>
                            <div className={classes['directory-card__name']}>{user.full_name}</div>
                            <div className={classes['directory-card__position']}>
                                {user.position ? user.position.name : 'Sin puesto'}
                            </div>
                            <div className={classes['directory-card__department']}>
                                {user.department || 'Sin departamento'}
                            </div>
                            <div className={classes['directory-card__email']}>
                                <a href={`mailto:${user.email}`}>{user.email}</a>
                            </div>
                            <div className={classes['directory-card__phone']}>
                                {user.phone ? <a href={`tel:${user.phone}`}>{user.phone}</a> : 'Sin teléfono'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {totalPages > 1 && (
                <TablePagination
                    data={{
                        count: total,
                        next: page < totalPages ? true : null,
                        previous: page > 1 ? true : null,
                    }}
                    resetOffset={resetOffset}
                    handleGoToPage={handleGoToPage}
                    onNextClick={() => handleGoToPage(page + 1)}
                    onPreviousClick={() => handleGoToPage(page - 1)}
                />
            )}
        </div>
    );
};

export default DirectoryTable;
