import { createApi } from '@reduxjs/toolkit/query/react';
import type {
    DocumentResponse} from './api.types';
import {
    HTTP_METHODS,
    TRACKER_TAG_TYPES,
    DELETE_FILE_ENDPOINT,
    OPERATION_FILES_ENDPOINT,
    OPERATION_PEDIMENTS_FILES_ENDPOINT,
    CLIENT_OPERATION_FILES_ENDPOINT,
} from './api.types';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export const documentApi = createApi({
    reducerPath: 'documentApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: [TRACKER_TAG_TYPES.DOCUMENT_TAG],
    endpoints: (builder) => ({
        getAllOperationFiles: builder.query<any, { operationCode: string }>({
            query: ({ operationCode }) => ({
                method: HTTP_METHODS.GET,
                url: `${OPERATION_FILES_ENDPOINT}?file_type=all&operation_code=${operationCode}`,
            }),
        }),
        getAllOperationPhaseFiles: builder.query<any, { operationCode: string; phaseId: string }>({
            query: ({ operationCode, phaseId }) => ({
                method: HTTP_METHODS.GET,
                url: `${OPERATION_FILES_ENDPOINT}?file_type=all&operation_code=${operationCode}&phase_id=${phaseId}`,
            }),
        }),
        getOperationPedimentsFiles: builder.query<any, { operationCode: string }>({
            query: ({ operationCode }) => ({
                method: HTTP_METHODS.GET,
                url: `${OPERATION_PEDIMENTS_FILES_ENDPOINT}${operationCode}/`,
            }),
            transformResponse: (response: DocumentResponse) => {
                if (response.status === 'ok') {
                    return response.urls;
                }
                return null;
            },
        }),
        getOperationDocuments: builder.query<any, { operationCode: string }>({
            query: ({ operationCode }) => ({
                method: HTTP_METHODS.GET,
                url: `${OPERATION_FILES_ENDPOINT}?file_type=documents&operation_code=${operationCode}`,
            }),
            transformResponse: (response: DocumentResponse) => {
                if (response.status === 'ok') {
                    return response.urls;
                }
                return null;
            },
        }),
        getClientOperationDocuments: builder.query<any, { operationCode: string }>({
            query: ({ operationCode }) => ({
                method: HTTP_METHODS.GET,
                url: `${CLIENT_OPERATION_FILES_ENDPOINT}${operationCode}/`,
            }),
            transformResponse: (response: DocumentResponse) => {
                if (response.status === 'ok') {
                    return response.urls;
                }
                return null;
            },
        }),

        getOperationImages: builder.query<any, { operationCode: string }>({
            query: ({ operationCode }) => ({
                method: HTTP_METHODS.GET,
                url: `${OPERATION_FILES_ENDPOINT}?file_type=images&operation_code=${operationCode}`,
            }),
            transformResponse: (response: DocumentResponse) => {
                if (response.status === 'ok') {
                    return response.urls;
                }
                return null;
            },
        }),
        deleteFileById: builder.mutation({
            query: (fileId: number) => ({
                method: HTTP_METHODS.DELETE,
                url: `${DELETE_FILE_ENDPOINT}${fileId}/`,
            }),
        }),
    }),
});

export const {
    useDeleteFileByIdMutation,
    useGetOperationImagesQuery,
    useGetAllOperationFilesQuery,
    useGetOperationDocumentsQuery,
    useGetClientOperationDocumentsQuery,
    useGetOperationPedimentsFilesQuery,
    useGetAllOperationPhaseFilesQuery,
    useLazyGetAllOperationPhaseFilesQuery,
} = documentApi;
