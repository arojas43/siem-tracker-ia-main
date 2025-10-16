import { createApi } from '@reduxjs/toolkit/query/react';
import {
    HTTP_METHODS,
    TRACKER_TAG_TYPES,
    OPERATION_PEDIMENTS_FILES_ENDPOINT,
    ZIP_OPERATION_FILES_ENDPOINT,
    OPERATION_EXPENSES_FILES_ENDPOINT,
    ZIP_CLIENT_OPERATION_FILES_ENDPOINT,
} from './api.types';
import { baseQueryWithReauthAndBlob } from './baseQueryWithReauthAndBlob';

export const zipDocumentApi = createApi({
    reducerPath: 'zipDocumentApi',
    baseQuery: baseQueryWithReauthAndBlob,
    tagTypes: [TRACKER_TAG_TYPES.DOCUMENT_TAG],
    endpoints: (builder) => ({
        getOperationPedimentsFilesZip: builder.query<any, { operationCode: string }>({
            query: ({ operationCode }) => ({
                method: HTTP_METHODS.GET,
                url: `${OPERATION_PEDIMENTS_FILES_ENDPOINT}${operationCode}/zip`,
            }),
        }),

        getOperationDocumentsZip: builder.query<Blob, { operationCode: string }>({
            query: ({ operationCode }) => ({
                method: 'GET',
                url: `${ZIP_OPERATION_FILES_ENDPOINT}?file_type=documents&operation_code=${operationCode}`,
            }),
        }),
        getClientOperationDocumentsZip: builder.query<Blob, { operationCode: string }>({
            query: ({ operationCode }) => ({
                method: 'GET',
                url: `${ZIP_CLIENT_OPERATION_FILES_ENDPOINT}${operationCode}/zip/`,
            }),
        }),
        getPhaseDocumentsZip: builder.query<Blob, { operationCode: string; phaseId: string }>({
            query: ({ operationCode, phaseId }) => ({
                method: 'GET',
                url: `${ZIP_OPERATION_FILES_ENDPOINT}?file_type=documents&phase_id=${phaseId}&operation_code=${operationCode}`,
            }),
        }),
        getOperationExpensesZip: builder.query<Blob, { taskId: number }>({
            query: ({ taskId }) => ({
                method: 'GET',
                url: `${OPERATION_EXPENSES_FILES_ENDPOINT}${taskId}/zip/`,
            }),
        }),
    }),
});

export const {
    useLazyGetClientOperationDocumentsZipQuery,
    useLazyGetOperationDocumentsZipQuery,
    useLazyGetOperationExpensesZipQuery,
    useLazyGetPhaseDocumentsZipQuery,
} = zipDocumentApi;
