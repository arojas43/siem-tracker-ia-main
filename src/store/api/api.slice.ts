 
 
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@store/api/baseQueryWithReauth.ts';

import type {
    UsersResponse,
    TasksByOperationCodeAndPhaseIdResponse,
    ClientResponse,
    SupplierResponse,
    MerchandiseTypeResponse,
    CustomsResponse,
    Client,
    UpdateClientRequest,
    Customs,
    UpdateCustomRequest,
    CustomRequest,
    GroupUsersResponse,
    Supplier,
    UpdateSupplierRequest,
    SupplierRequest,
    CountriesResponse,
    LanguagesResponse,
    TasksResponse,
    HomeWidgetResponse,
    ClientHomeWidgetResponse,
    DirectoryUserResponse,
    AllTasksByOperationCodeAndPhaseIdResponse,
    SmallTask} from './api.types';
import {
    HTTP_METHODS,
    CLIENTS_ENDPOINT,
    USERS_ENDPOINT,
    TRACKER_TAG_TYPES,
    CUSTOMS_ENDPOINT,
    TASKS_BY_OPCODE_PHASES_ID_ENDPOINT,
    SUPPLIERS_ENDPOINT,
    MERCHANDISE_TYPE_ENDPOINT,
    TASK_ENDPOINT,
    GROUPED_USERS_ENDPOINT,
    COUNTRIES_ENDPOINT,
    LANGUAGES_ENDPOINT,
    HOME_WIDGET_DATA_ENDPOINT,
    CLIENT_HOME_WIDGET_DATA_ENDPOINT,
    ALL_TASKS_BY_OPCODE_PHASES_ID_ENDPOINT
} from './api.types';
import type { ClientRequest } from 'http';

export const trackerApiSlice = createApi({
    reducerPath: 'trackerApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: [TRACKER_TAG_TYPES.OPERATIONS_TAG, TRACKER_TAG_TYPES.AUTHENTICATION_TAG],
    refetchOnMountOrArgChange: true,
    endpoints: (builder) => ({
        getHomeWidgetsData: builder.query<HomeWidgetResponse, void>({
            query: () => ({
                url: HOME_WIDGET_DATA_ENDPOINT,
                method: HTTP_METHODS.GET,
            }),
        }),
        getClientHomeWidgetsData: builder.query<ClientHomeWidgetResponse, void>({
            query: () => ({
                url: CLIENT_HOME_WIDGET_DATA_ENDPOINT,
                method: HTTP_METHODS.GET,
            }),
        }),
        getUsers: builder.query<UsersResponse, string | void>({
            query: (params = '') => ({
                method: HTTP_METHODS.GET,
                url: `${USERS_ENDPOINT}${params}`,
            }),
        }),
        getUserById: builder.query<any, number>({
            query: (userId) => ({
                url: `${USERS_ENDPOINT}${userId}/`,
                method: HTTP_METHODS.GET,
            }),
        }),
        getGroupedUsers: builder.query<GroupUsersResponse, void>({
            query: () => ({
                method: HTTP_METHODS.GET,
                url: GROUPED_USERS_ENDPOINT,
            }),
            transformResponse: (response: { detail: GroupUsersResponse }) => response.detail,
        }),
        getClients: builder.query<ClientResponse, string | void>({
            query: (params = '') => ({
                method: HTTP_METHODS.GET,
                url: `${CLIENTS_ENDPOINT}${params}`,
            }),
        }),
        getSuppliers: builder.query<SupplierResponse, string | void>({
            query: (params = '') => ({
                method: HTTP_METHODS.GET,
                url: `${SUPPLIERS_ENDPOINT}${params}`,
            }),
        }),
        getMerchandiseTypes: builder.query<MerchandiseTypeResponse, string | void>({
            query: (params = '') => ({
                method: HTTP_METHODS.GET,
                url: `${MERCHANDISE_TYPE_ENDPOINT}${params}`,
            }),
        }),

        getCustoms: builder.query<CustomsResponse, string | void>({
            query: (params = '') => ({
                method: HTTP_METHODS.GET,
                url: `${CUSTOMS_ENDPOINT}${params}`,
            }),
        }),

        getTasksByOperationAndPhaseCode: builder.query<
            TasksByOperationCodeAndPhaseIdResponse,
            { operationCode: string; phaseId: string }
        >({
            query: ({ operationCode, phaseId }) => ({
                url: `${TASKS_BY_OPCODE_PHASES_ID_ENDPOINT}?operation_code=${operationCode}&phase_id=${phaseId}`,
                method: HTTP_METHODS.GET,
            }),
        }),
        getAllTasksByOperationAndPhaseCode: builder.query<SmallTask[], { operationCode: string; phaseId: string }>({
            query: ({ operationCode, phaseId }) => ({
                url: `${ALL_TASKS_BY_OPCODE_PHASES_ID_ENDPOINT}?operation_code=${operationCode}&phase_id=${phaseId}`,
                method: HTTP_METHODS.GET,
            }),
            transformResponse: (response: AllTasksByOperationCodeAndPhaseIdResponse) => {
                if (response.tasks && response.tasks.length > 0) {
                    return response.tasks;
                }
                return [];
            },
        }),
        updateTaskById: builder.mutation({
            query: ({ taskId, isSave, body }) => ({
                method: HTTP_METHODS.PATCH,
                url: `${TASK_ENDPOINT}${taskId}${isSave ? '/?save=true' : '/'}`,
                body,
            }),
        }),
        getTasks: builder.query<TasksResponse, string | void>({
            query: (params = '') => ({
                method: HTTP_METHODS.GET,
                url: `${TASK_ENDPOINT}${params}`,
            }),
        }),

        // ******* CLIENTS *****
        getClientById: builder.query<Client | null, string>({
            query: (clientId) => ({
                url: `${CLIENTS_ENDPOINT}?id=${clientId}`,
                method: HTTP_METHODS.GET,
            }),
            transformResponse: (response: ClientResponse) => {
                if (response.results && response.results.length > 0) {
                    return response.results[0];
                }
                return null;
            },
        }),
        createClient: builder.mutation<Client, ClientRequest>({
            query: (clientData) => ({
                method: HTTP_METHODS.POST,
                url: CLIENTS_ENDPOINT,
                body: clientData,
            }),
        }),
        updateClient: builder.mutation<Client, UpdateClientRequest>({
            query: ({ clientId, clientRequestBody }) => ({
                method: HTTP_METHODS.PUT,
                url: `${CLIENTS_ENDPOINT}${clientId}/`,
                body: clientRequestBody,
            }),
        }),
        deactivateClient: builder.mutation({
            query: ({ clientId, body }) => ({
                method: HTTP_METHODS.PATCH,
                url: `${CLIENTS_ENDPOINT}${clientId}/`,
                body,
            }),
        }),
        // ******* FILES *****
        // deleteFileById: builder.mutation({
        //     query: (fileId: number) => ({
        //         method: HTTP_METHODS.DELETE,
        //         url: `${DELETE_FILE_ENDPOINT}${fileId}/`,
        //     }),
        // }),
        // ******* CUSTOMS *****
        deactivateCustom: builder.mutation({
            query: (clientId: number) => ({
                method: HTTP_METHODS.PATCH,
                url: `${CUSTOMS_ENDPOINT}${clientId}/`,
                body: {
                    is_active: false,
                },
            }),
        }),
        getCustomById: builder.query<Customs | null, string>({
            query: (clientId) => ({
                url: `${CUSTOMS_ENDPOINT}?id=${clientId}`,
                method: HTTP_METHODS.GET,
            }),
            transformResponse: (response: CustomsResponse) => {
                if (response.results && response.results.length > 0) {
                    return response.results[0];
                }
                return null;
            },
        }),
        updateCustom: builder.mutation<Customs, UpdateCustomRequest>({
            query: ({ customId, customRequestBody }) => ({
                method: HTTP_METHODS.PUT,
                url: `${CUSTOMS_ENDPOINT}${customId}/`,
                body: customRequestBody,
            }),
        }),
        createCustom: builder.mutation<Customs, CustomRequest>({
            query: (customData) => ({
                method: HTTP_METHODS.POST,
                url: CUSTOMS_ENDPOINT,
                body: customData,
            }),
        }),

        // ******* MANAGE TASK *****
        managePhaseTasks: builder.mutation({
            query: ({ body }) => ({
                method: HTTP_METHODS.PATCH,
                url: `${TASK_ENDPOINT}tasks-manager/`,
                body,
            }),
        }),

        // ******* SUPPLIERS *****
        deactivateSupplier: builder.mutation({
            query: (supplierId: number) => ({
                method: HTTP_METHODS.PATCH,
                url: `${SUPPLIERS_ENDPOINT}${supplierId}/`,
                body: {
                    is_active: false,
                },
            }),
        }),
        updateSupplier: builder.mutation<Supplier, UpdateSupplierRequest>({
            query: ({ supplierId, supplierRequestBody }) => ({
                method: HTTP_METHODS.PUT,
                url: `${SUPPLIERS_ENDPOINT}${supplierId}/`,
                body: supplierRequestBody,
            }),
        }),
        getSupplierById: builder.query<Supplier | null, string>({
            query: (supplierId) => ({
                url: `${SUPPLIERS_ENDPOINT}?id=${supplierId}`,
                method: HTTP_METHODS.GET,
            }),
            transformResponse: (response: SupplierResponse) => {
                if (response.results && response.results.length > 0) {
                    return response.results[0];
                }
                return null;
            },
        }),
        createSupplier: builder.mutation<Supplier, SupplierRequest>({
            query: (supplierData) => ({
                method: HTTP_METHODS.POST,
                url: SUPPLIERS_ENDPOINT,
                body: supplierData,
            }),
        }),

        // ********** COUNTRIES *********
        getCountries: builder.query<CountriesResponse, void>({
            query: () => ({
                method: HTTP_METHODS.GET,
                url: `${COUNTRIES_ENDPOINT}?limit=200`,
            }),
        }),

        // ********** LANGUAGES *********
        getLanguages: builder.query<LanguagesResponse, void>({
            query: () => ({
                method: HTTP_METHODS.GET,
                url: LANGUAGES_ENDPOINT,
            }),
        }),

        // ********** DIRECTORY *********
        getDirectory: builder.query<DirectoryUserResponse, string | void>({
            query: (params = '') => ({
                method: HTTP_METHODS.GET,
                url: `/directory/${params}`,
            }),
        }),
    }),
});

export const {
    useGetHomeWidgetsDataQuery,
    useGetClientHomeWidgetsDataQuery,

    useGetUsersQuery,
    useGetGroupedUsersQuery,
    useGetClientsQuery,
    useLazyGetClientsQuery,
    useGetCustomsQuery,
    useLazyGetCustomsQuery,
    useGetSuppliersQuery,
    useLazyGetSuppliersQuery,

    useLazyGetUserByIdQuery,

    useGetMerchandiseTypesQuery,

    useGetTasksByOperationAndPhaseCodeQuery,
    useGetAllTasksByOperationAndPhaseCodeQuery,
    useLazyGetTasksByOperationAndPhaseCodeQuery,
    useLazyGetAllTasksByOperationAndPhaseCodeQuery,
    useLazyGetClientByIdQuery,
    useCreateClientMutation,
    useUpdateClientMutation,
    useDeactivateClientMutation,
    useDeactivateCustomMutation,
    useLazyGetCustomByIdQuery,
    useUpdateCustomMutation,
    useCreateCustomMutation,
    useUpdateTaskByIdMutation,

    useDeactivateSupplierMutation,
    useUpdateSupplierMutation,
    useLazyGetSupplierByIdQuery,
    useCreateSupplierMutation,
    useGetCountriesQuery,
    useGetLanguagesQuery,
    useGetTasksQuery,
    useLazyGetTasksQuery,
    useGetDirectoryQuery,

    /**MANAGE TASKS */
    useManagePhaseTasksMutation,
} = trackerApiSlice;
