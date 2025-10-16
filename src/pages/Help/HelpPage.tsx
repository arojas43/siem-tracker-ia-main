import { useEffect, type FC } from 'react';
import { usePageHeader } from '@hooks/context/AppContext/AppContext';

const HelpPage: FC = () => {
    const { setHeaderTitle } = usePageHeader();

    useEffect(() => {
        setHeaderTitle('Ayuda');
    }, []);

    return <div className="tracker-page-container tracker-page-container__card">HelpPage</div>;
};

export default HelpPage;
