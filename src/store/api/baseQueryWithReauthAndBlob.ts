import type { BaseQueryFn, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { RootState } from '@store/store';
import { saveAuthentication, clearAuthenticationState } from '@store/Authentication/authentication.slice';
import { HTTP_METHODS, REFRESH_ENDPOINT } from '@store/api/api.types.ts';

interface RefreshResponse {
    access: string;
    refresh: string;
}

const USE_BASIC = (import.meta.env.VITE_USE_BASIC_AUTH || '').toString() === 'true';

export const rawBaseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_ENDPOINT,
    prepareHeaders: (headers, api) => {
        const { auth } = api.getState() as RootState;
        if (USE_BASIC) {
            const username = auth?.basicAuth?.username ?? '';
            const password = auth?.basicAuth?.password ?? '';
            if (username && password) {
                const encoded = btoa(`${username}:${password}`);
                headers.set('Authorization', `Basic ${encoded}`);
            }
        } else {
            if (auth?.accessToken) {
                headers.set('Authorization', `Bearer ${auth.accessToken}`);
            }
        }
        return headers;
    },
    responseHandler: async (response) => await response.blob(),
});

export const baseQueryWithReauthAndBlob: BaseQueryFn<any, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions,
) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const state = api.getState() as RootState;
        if (USE_BASIC) {
            api.dispatch(clearAuthenticationState());
            return result;
        }
        const refreshToken = state.auth?.refreshToken;

        if (refreshToken) {
            const refreshResult = await rawBaseQuery(
                {
                    url: REFRESH_ENDPOINT,
                    method: HTTP_METHODS.POST,
                    body: { refresh: refreshToken },
                },
                api,
                extraOptions,
            );

            if (refreshResult.data) {
                const { access, refresh } = refreshResult.data as RefreshResponse;
                api.dispatch(saveAuthentication({ access, refresh }));

                result = await rawBaseQuery(args, api, extraOptions);
            } else {
                api.dispatch(clearAuthenticationState());
            }
        } else {
            api.dispatch(clearAuthenticationState());
        }
    }

    if (
        result.meta?.response instanceof Response &&
        result.meta.response.headers.get('content-type')?.includes('application/zip')
    ) {
        return {
            data: result.data,
            meta: result.meta,
        };
    }

    return result;
};
