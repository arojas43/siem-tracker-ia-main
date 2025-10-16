import type { UserState } from '@store/UserInfo/userInfo.types';

export interface AuthenticationState {
    accessToken: string;
    refreshToken: string;
    isAuthenticated: boolean;
    basicAuth?: {
        username: string;
        password: string;
    };
}

export interface AuthenticationResponse {
    access: string;
    refresh: string;
    user?: UserState;
}

export interface BasicAuthCredentials {
    username: string;
    password: string;
}
