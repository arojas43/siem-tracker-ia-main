// import { checkIfAuthenticatedLoader } from '@utils/auth/auth';

import { Navigate, createBrowserRouter } from 'react-router-dom';

import RootPage from './pages/Root/RootPage';
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import OperationsPage from './pages/Operations';
import OperationFormPage from './pages/Operations/pages/OperationForm';
import { PrivateRoute } from '@utils/PrivateRoute.tsx';
import OperationPhasesPage from './pages/Operations/pages/OperationPhases';
import OperationTaskPage from './pages/Operations/pages/OperationTask';
import TasksPage from './pages/Tasks';
import ClientsPage from './pages/Clients';
import HelpPage from './pages/Help/HelpPage';
import {
    OperationInfoPage,
    OperationPedimentPage,
    OperationSettingsPage,
    OperationDocumentsPage,
    OperationImagesPage,
    OperationDatesPage,
} from './pages/Operations/pages';
import NewClientPage from './pages/Clients/pages/NewClient';
import CustomsPage from './pages/Customs';
import NewCustomPage from './pages/Customs/pages/NewCustom';
import SuppliersPage from './pages/Suppliers';
import NewSupplierPage from './pages/Suppliers/pages/NewSupplier';
import ChatbotPage from './pages/Chatbot';
//import DirectoryPage from './pages/Directory';
import {
    ClientOperationDocuments,
    ClientOperationInfo,
    ClientPreviewImages,
} from './pages/Operations/pages/ClientPages';
// import PageNotFound from './pages/Errors/PageNotFound/PageNotFound';
// import CreateAccountPage from './pages/CreateAccount/CreateAccountPage';
// import { createAccountPageLoader } from './pages/CreateAccount/CreateAccountPage.loader';
// import BatchCreateAccount from './pages/BatchCreateAccount';

export const router = createBrowserRouter([
    {
        path: '/',
        id: 'root',
        element: <RootPage />,
        // errorElement: <PageNotFound />,
        // loader: (data) => checkIfAuthenticatedLoader(data),
        children: [
            {
                index: true,
                element: (
                    <Navigate
                        to="/login"
                        replace
                    />
                ),
            },
            {
                path: '/login',
                element: <LoginPage />,
            },
            {
                path: '/home',
                element: (
                    <PrivateRoute>
                        <HomePage />
                    </PrivateRoute>
                ),
            },
            /* CLIENT OPERATIONS */
            {
                path: '/operations/client/:operationCode',
                element: (
                    <PrivateRoute>
                        <ClientOperationInfo />
                    </PrivateRoute>
                ),
            },
            {
                path: '/operations/client/documents/:operationCode',
                element: (
                    <PrivateRoute>
                        <ClientOperationDocuments />
                    </PrivateRoute>
                ),
            },
            {
                path: '/operations/client/images/:operationCode',
                element: (
                    <PrivateRoute>
                        <ClientPreviewImages />
                    </PrivateRoute>
                ),
            },
            /* SIEM OPERATIONS */
            {
                path: '/operations',
                element: (
                    <PrivateRoute>
                        <OperationsPage />
                    </PrivateRoute>
                ),
            },
            {
                path: '/operations/form',
                element: (
                    <PrivateRoute>
                        <OperationFormPage />
                    </PrivateRoute>
                ),
            },

            {
                path: '/operations/info/:operationCode',
                element: (
                    <PrivateRoute>
                        <OperationInfoPage />
                    </PrivateRoute>
                ),
                children: [
                    {
                        path: 'form',
                        element: (
                            <PrivateRoute>
                                <OperationFormPage />
                            </PrivateRoute>
                        ),
                    },
                    {
                        path: 'phases',
                        element: (
                            <PrivateRoute>
                                <OperationPhasesPage />
                            </PrivateRoute>
                        ),
                    },
                    {
                        path: 'pediment',
                        element: (
                            <PrivateRoute>
                                <OperationPedimentPage />
                            </PrivateRoute>
                        ),
                    },
                    {
                        path: 'dates',
                        element: (
                            <PrivateRoute>
                                <OperationDatesPage />
                            </PrivateRoute>
                        ),
                    },
                    {
                        path: 'documents',
                        element: (
                            <PrivateRoute>
                                <OperationDocumentsPage />
                            </PrivateRoute>
                        ),
                    },
                    {
                        path: 'images',
                        element: (
                            <PrivateRoute>
                                <OperationImagesPage />
                            </PrivateRoute>
                        ),
                    },
                    {
                        path: 'settings',
                        element: (
                            <PrivateRoute>
                                <OperationSettingsPage />
                            </PrivateRoute>
                        ),
                    },
                ],
            },
            // {
            //     path: '/operations/info/phase',
            //     element: (
            //         <PrivateRoute>
            //             <OperationPhasesPage />
            //         </PrivateRoute>
            //     ),
            // },
            // {
            //     path: '/operations/:operationCode',
            //     element: (
            //         <PrivateRoute>
            //             <OperationPhasesPage />
            //         </PrivateRoute>
            //     ),
            // },
            {
                path: '/operations/tasks',
                element: (
                    <PrivateRoute>
                        <OperationTaskPage />
                    </PrivateRoute>
                ),
            },
            /* TASK */
            {
                path: '/tasks',
                element: (
                    <PrivateRoute>
                        <TasksPage />
                    </PrivateRoute>
                ),
            },
            /* CLIENTS */
            {
                path: '/clients',
                element: (
                    <PrivateRoute>
                        <ClientsPage />
                    </PrivateRoute>
                ),
            },
            {
                path: '/clients/form',
                element: (
                    <PrivateRoute>
                        <NewClientPage />
                    </PrivateRoute>
                ),
            },
            {
                path: '/clients/:clientId/form',
                element: (
                    <PrivateRoute>
                        <NewClientPage />
                    </PrivateRoute>
                ),
            },

            /* HELP */
            {
                path: '/help',
                element: (
                    <PrivateRoute>
                        <HelpPage />
                    </PrivateRoute>
                ),
            },

            /* CUSTOMS */
            {
                path: '/customs',
                element: (
                    <PrivateRoute>
                        <CustomsPage />
                    </PrivateRoute>
                ),
            },
            {
                path: '/customs/form',
                element: (
                    <PrivateRoute>
                        <NewCustomPage />
                    </PrivateRoute>
                ),
            },
            {
                path: '/customs/:customId/form',
                element: (
                    <PrivateRoute>
                        <NewCustomPage />
                    </PrivateRoute>
                ),
            },

            /* DIRECTORY
            {
                path: '/directory',
                element: (
                    <PrivateRoute>
                        <DirectoryPage />
                    </PrivateRoute>
                ),
            },*/
            /* SUPPLIERS */
            {
                path: '/suppliers',
                element: (
                    <PrivateRoute>
                        <SuppliersPage />
                    </PrivateRoute>
                ),
            },
            {
                path: '/suppliers/form',
                element: (
                    <PrivateRoute>
                        <NewSupplierPage />
                    </PrivateRoute>
                ),
            },
            {
                path: '/suppliers/:supplierId/form',
                element: (
                    <PrivateRoute>
                        <NewSupplierPage />
                    </PrivateRoute>
                ),
            },

            /* CHATBOT */
            {
                path: '/chatbot',
                element: (
                    <PrivateRoute>
                        <ChatbotPage />
                    </PrivateRoute>
                ),
            },
        ],
    },
]);
