import { createApi } from '@reduxjs/toolkit/query/react';
import { HTTP_METHODS, TRACKER_TAG_TYPES, USERS_CHANGE_PASSWORD_ENDPOINT, USERS_ENDPOINT } from './api.types';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: [TRACKER_TAG_TYPES.USER_TAG],
    endpoints: (builder) => ({
        changeUserProfileImage: builder.mutation({
            query: ({ userId, body }) => ({
                method: HTTP_METHODS.PATCH,
                url: `${USERS_ENDPOINT}${userId}/`,
                body,
            }),
        }),
        changeUserPassword: builder.mutation({
            query: (body) => ({
                method: HTTP_METHODS.POST,
                url: `${USERS_CHANGE_PASSWORD_ENDPOINT}`,
                body,
            }),
        }),
        gerUserInfo: builder.query({
            query: (userId) => ({
                url: `${USERS_ENDPOINT}${userId}/`,
            }),
        }),
    }),
});

export const { useChangeUserProfileImageMutation, useLazyGerUserInfoQuery, useChangeUserPasswordMutation } = userApi;
