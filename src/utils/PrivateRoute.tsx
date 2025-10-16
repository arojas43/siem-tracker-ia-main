import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '@store/store';

interface PrivateRouteProps {
    children: ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}