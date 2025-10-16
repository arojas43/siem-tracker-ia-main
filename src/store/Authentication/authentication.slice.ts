import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AuthenticationResponse, AuthenticationState, BasicAuthCredentials } from './authentication.types';

const initialState: AuthenticationState = {
    accessToken: '',
    refreshToken: '',
    isAuthenticated: false,
    basicAuth: undefined,
};

const authenticationSlice = createSlice({
    initialState,
    name: 'authenticationSlice',
    reducers: {
        clearAuthenticationState: () => initialState,
        saveAuthentication(state: AuthenticationState, { payload }: PayloadAction<AuthenticationResponse>) {
            const { access, refresh } = payload;
            state.accessToken = access;
            state.refreshToken = refresh;
            state.isAuthenticated = !!access;
        },
        saveBasicAuthCredentials(state: AuthenticationState, { payload }: PayloadAction<BasicAuthCredentials>) {
            state.basicAuth = { username: payload.username, password: payload.password };
            state.isAuthenticated = true;
        },
    },
});

export default authenticationSlice.reducer;
export const { clearAuthenticationState, saveAuthentication, saveBasicAuthCredentials } = authenticationSlice.actions;
