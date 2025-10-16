import classes from './DirectoryPage.module.scss';
import DirectoryTable from './components/DirectoryTable/DirectoryTable';
import React, { useEffect , useState } from 'react';
import { usePageHeader } from '../../hooks/context/AppContext/AppContext';
import TableSearchBar from '../../components/TableSearchBar/TableSearchBar';

const DirectoryPage: React.FC = () => {
    const { setHeaderTitle } = usePageHeader();
    const [search, setSearch] = useState('');

    useEffect(() => {
        setHeaderTitle('Directorio');
    }, [setHeaderTitle]);

    return (
        <div className={`tracker-page-container tracker-page-container__card ${classes['directory-page']}`}>
            <div className={classes['directory-page__container']}>
                <div className={classes['directory-page__bottom']}>
                    <div className={classes['directory-table-card']}>
                        <div
                            id="input"
                            style={{ flex: 1 }}
                            className="d-flex justify-content-end align-items-center"
                        >
                            <div className="w-50">
                                <TableSearchBar
                                    placeholder="Buscar contacto, email, departamento..."
                                    onSearch={setSearch}
                                    onBlur={() => setSearch('')}
                                    onClearSearch={() => setSearch('')}
                                />
                            </div>
                        </div>
                        <div>
                            <DirectoryTable search={search} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectoryPage;
