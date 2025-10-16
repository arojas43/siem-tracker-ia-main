import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App.tsx';
import { store, persistor } from '@store/store';
import { pdfjs } from 'react-pdf';

// Variables de entorno cargadas correctamente

// pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString(); // working
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <PersistGate
                loading={null}
                persistor={persistor}
            >
                <App />
            </PersistGate>
        </Provider>
    </StrictMode>,
);
