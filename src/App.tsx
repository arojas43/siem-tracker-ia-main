import { router } from './App.routes';
import { RouterProvider } from 'react-router-dom';
import { AppContextProvider } from '@hooks/context/AppContext/AppContext';

function App() {
    return (
        <AppContextProvider>
            <RouterProvider router={router} />
        </AppContextProvider>
    );
}

export default App;
