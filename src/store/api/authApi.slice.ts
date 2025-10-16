import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@store/api/baseQueryWithReauth.ts';
import type { LoginBody} from './api.types';
import { LOGIN_ENDPOINT, HTTP_METHODS, TRACKER_TAG_TYPES, onQueryStartedErrorHandle } from './api.types';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: [TRACKER_TAG_TYPES.AUTHENTICATION_TAG],
    endpoints: (builder) => ({
        login: builder.query({
            providesTags: [TRACKER_TAG_TYPES.AUTHENTICATION_TAG],
            query: (body: LoginBody) => ({
                method: HTTP_METHODS.POST,
                url: LOGIN_ENDPOINT,
                body,
            }),
            onQueryStarted: onQueryStartedErrorHandle,
        }),
    }),
});

export const { useLazyLoginQuery } = authApi;
