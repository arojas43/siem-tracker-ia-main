import classes from './NewSupplierPage.module.scss';
import { useEffect, type FC } from 'react';
import { useParams } from 'react-router-dom';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import SupplierForm from './components/SupplierForm';

const NewSupplierPage: FC = () => {
    const { setHeaderTitle } = usePageHeader();
    const { supplierId } = useParams<{ supplierId: string }>();

    useEffect(() => {
        if (supplierId) {
            setHeaderTitle('Editar datos de proveedor');
        } else {
            setHeaderTitle('Nuevo Proveedor');
        }
    }, []);

    const NEW_SUPPLIER_CSS_CLASSES = `tracker-page-container__card ${classes['new-supplier-page']}`;
    const SUPPLIER_CSS_CLASSES = `tracker-page-container__card ${classes['new-supplier-page']}`;

    const cssClasses = supplierId ? SUPPLIER_CSS_CLASSES : NEW_SUPPLIER_CSS_CLASSES;

    return (
        <div className={`tracker-page-container  ${cssClasses}`}>
            <SupplierForm supplierId={supplierId} />
        </div>
    );
};

export default NewSupplierPage;
