import type { ReactNode, FC } from 'react';
import { createContext, useContext, useState } from 'react';

interface PageContextType {
    headerTitle: string;
    setHeaderTitle: (headerTitle: string) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const usePageHeader = (): PageContextType => {
    const context = useContext(PageContext);
    if (!context) {
        throw new Error('usePageTitle must be used within a PageTitleProvider');
    }
    return context;
};

interface PageTitleProviderProps {
    children: ReactNode;
}

export const AppContextProvider: FC<PageTitleProviderProps> = ({ children }) => {
    const [headerTitle, setHeaderTitle] = useState<string>('');

    return <PageContext.Provider value={{ headerTitle, setHeaderTitle }}>{children}</PageContext.Provider>;
};
