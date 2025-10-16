import { Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@hooks/reduxTyped.hooks';
import { useEffect } from 'react';
import MainView from './components/MainView';

const RootPage: React.FC = () => {
    const isAuthenticated = useAppSelector((store) => store.auth.isAuthenticated);
    const location = useLocation();

    useEffect(() => {
        console.log('isAuthenticated', isAuthenticated);
    }, [isAuthenticated]);

    const excludePaths = ['/login'];
    if (!isAuthenticated || excludePaths.includes(location.pathname)) {
        return <Outlet />;
    }

    return <MainView />;
};

export default RootPage;
