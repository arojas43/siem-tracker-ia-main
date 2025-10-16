import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@store/api/baseQueryWithReauth.ts';
import type {
    GetOperationsReferenceNumberResponse,
    Operation,
    CreateOperationRequest,
    UpdateOperationRequest,
    GetOperationsResponse,
    ContainerResponse,
    PhasesByOperationCodeResponse,
    GetOperationWidgetsDataResponse,
    ClientPhasesByOperationCodeResponse} from './api.types';
import {
    HTTP_METHODS,
    TRACKER_TAG_TYPES,
    onQueryStartedErrorHandle,
    OPERATIONS_REFERENCE_NUMBER_ENDPOINT,
    OPERATIONS_ENDPOINT,
    OPERATION_TYPES_ENDPOINT,
    OPERATION_FORWARDER_ENDPOINT,
    CONTAINERS_ENDPOINT,
    PHASES_BY_OPCODE_ENDPOINT,
    OPERATION_WIDGETS_DATA_ENDPOINT,
    CLIENT_PHASES_BY_OPCODE_ENDPOINT,
    CLIENT_OPERATION_WIDGETS_DATA_ENDPOINT,
} from './api.types';

export const operationApi = createApi({
    reducerPath: 'operationApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: [TRACKER_TAG_TYPES.OPERATIONS_TAG],
    endpoints: (builder) => ({
        getOperationWidgetsData: builder.query<GetOperationWidgetsDataResponse, void>({
            query: () => ({
                url: OPERATION_WIDGETS_DATA_ENDPOINT,
                method: HTTP_METHODS.GET,
            }),
        }),
        getClientOperationWidgetsData: builder.query<GetOperationWidgetsDataResponse, void>({
            query: () => ({
                url: CLIENT_OPERATION_WIDGETS_DATA_ENDPOINT,
                // url: OPERATION_WIDGETS_DATA_ENDPOINT,
                method: HTTP_METHODS.GET,
            }),
        }),
        getOperationReferenceNumber: builder.query({
            query: (clientId: number) => ({
                url: `${OPERATIONS_REFERENCE_NUMBER_ENDPOINT}?client_id=${clientId}`,
                method: HTTP_METHODS.GET,
            }),
            transformResponse: (response: GetOperationsReferenceNumberResponse) => response.reference_number,
        }),
        createOperation: builder.mutation<Operation, CreateOperationRequest>({
            query: (operationData) => ({
                method: HTTP_METHODS.POST,
                url: OPERATIONS_ENDPOINT,
                body: operationData,
            }),
        }),
        updateOperation: builder.mutation<Operation, UpdateOperationRequest>({
            query: ({ operationId, operationRequestBody }) => ({
                method: HTTP_METHODS.PUT,
                url: `${OPERATIONS_ENDPOINT}${operationId}/`,
                body: operationRequestBody,
            }),
        }),
        getOperations: builder.query<GetOperationsResponse, string | void>({
            providesTags: [TRACKER_TAG_TYPES.OPERATIONS_TAG],
            query: (params = '') => ({
                method: HTTP_METHODS.GET,
                url: `${OPERATIONS_ENDPOINT}${params}`,
            }),
            onQueryStarted: onQueryStartedErrorHandle,
        }),

        getOperationTypes: builder.query<{ results: { id: string; name: string }[] }, void>({
            query: () => ({
                method: HTTP_METHODS.GET,
                url: OPERATION_TYPES_ENDPOINT,
            }),
        }),
        getOperationForwarder: builder.query<{ results: { id: string; forwarder_name: string }[] }, string | void>({
            query: (params = '') => ({
                method: HTTP_METHODS.GET,
                url: `${OPERATION_FORWARDER_ENDPOINT}${params}`,
            }),
        }),
        getOperationContainer: builder.query<ContainerResponse, void>({
            query: () => ({
                method: HTTP_METHODS.GET,
                url: CONTAINERS_ENDPOINT,
            }),
        }),
        getOperationById: builder.query<Operation | null, number>({
            query: (operationId) => ({
                url: `${OPERATIONS_ENDPOINT}?id=${operationId}`,
                method: HTTP_METHODS.GET,
            }),
            transformResponse: (response: GetOperationsResponse) => {
                if (response.results && response.results.length > 0) {
                    return response.results[0];
                }
                return null;
            },
        }),
        getOperationByOperationCode: builder.query<Operation | null, string>({
            query: (operationCode) => ({
                url: `${OPERATIONS_ENDPOINT}?operation_code=${operationCode}`,
                method: HTTP_METHODS.GET,
            }),
            transformResponse: (response: GetOperationsResponse) => {
                if (response.results && response.results.length > 0) {
                    return response.results[0];
                }
                return null;
            },
        }),
        deleteOperation: builder.mutation({
            query: (operationId: number) => ({
                method: HTTP_METHODS.DELETE,
                url: `${OPERATIONS_ENDPOINT}${operationId}/`,
            }),
        }),
        getPhasesByOperationCode: builder.query<PhasesByOperationCodeResponse, string>({
            query: (operationCode) => ({
                url: `${PHASES_BY_OPCODE_ENDPOINT}?operation_code=${operationCode}&phase_type=SIEM`,
                method: HTTP_METHODS.GET,
            }),
        }),
        getClientPhasesByOperationCode: builder.query<ClientPhasesByOperationCodeResponse, string>({
            query: (operationCode) => ({
                url: `${CLIENT_PHASES_BY_OPCODE_ENDPOINT}?operation_code=${operationCode}`,
                method: HTTP_METHODS.GET,
            }),
        }),

        deactivateOperation: builder.mutation({
            query: (operationId: number) => ({
                method: HTTP_METHODS.PATCH,
                url: `${OPERATIONS_ENDPOINT}${operationId}/`,
                body: {
                    is_active: false,
                },
            }),
        }),

        getOperationImportantDates: builder.query<ClientPhasesByOperationCodeResponse, string>({
            query: (operationCode) => ({
                url: `${OPERATIONS_ENDPOINT}${operationCode}/important-dates/`,
                method: HTTP_METHODS.GET,
            }),
        }),
    }),
});

export const {
    useGetOperationsQuery,
    useGetOperationByIdQuery,
    useGetOperationTypesQuery,
    useLazyGetOperationsQuery,
    useCreateOperationMutation,
    useDeleteOperationMutation,
    useUpdateOperationMutation,
    useLazyGetOperationByIdQuery,
    useGetOperationContainerQuery,
    useGetOperationForwarderQuery,
    useDeactivateOperationMutation,
    useGetOperationWidgetsDataQuery,
    useGetPhasesByOperationCodeQuery,
    useGetOperationImportantDatesQuery,
    useGetClientOperationWidgetsDataQuery,
    useGetClientPhasesByOperationCodeQuery,
    useLazyGetOperationByOperationCodeQuery,
    useLazyGetOperationReferenceNumberQuery,
} = operationApi;
