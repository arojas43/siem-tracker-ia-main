import classes from './NewCustomPage.module.scss';
import { useEffect, type FC } from 'react';
import { useParams } from 'react-router-dom';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import CustomForm from './components/CustomForm';

const NewCustomPage: FC = () => {
    const { setHeaderTitle } = usePageHeader();
    const { customId } = useParams<{ customId: string }>();

    useEffect(() => {
        if (customId) {
            setHeaderTitle('Editar datos de aduana');
        } else {
            setHeaderTitle('Nueva Aduana');
        }
    }, []);

    const NEW_CUSTOM_CSS_CLASSES = `tracker-page-container__card ${classes['new-custom-page']}`;
    const CUSTOM_CSS_CLASSES = `tracker-page-container__card ${classes['new-custom-page']}`;

    const cssClasses = customId ? CUSTOM_CSS_CLASSES : NEW_CUSTOM_CSS_CLASSES;

    return (
        <div className={`tracker-page-container  ${cssClasses}`}>
            <CustomForm customId={customId} />
        </div>
    );
};

export default NewCustomPage;
