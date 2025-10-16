import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { trackerApiSlice } from './api/api.slice';
import { authApi } from './api/authApi.slice';
import { userApi } from './api/userApi.slice';
import { operationApi } from './api/operationApi.slice';
import appStateReducer from '@store/AppState/appState.slice';
import operationsReducer from '@store/Operations/operations.slice';
import authenticationReducer from '@store/Authentication/authentication.slice';
import userInfoReducer from '@store/UserInfo/userInfo.slice';
import { documentApi } from './api/documentApi.slice';
import { zipDocumentApi } from './api/zipDocumentApi.slice';

const rootReducer = combineReducers({
    userInfo: userInfoReducer,
    appState: appStateReducer,
    auth: authenticationReducer,
    operations: operationsReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
    [zipDocumentApi.reducerPath]: zipDocumentApi.reducer,
    [operationApi.reducerPath]: operationApi.reducer,
    [trackerApiSlice.reducerPath]: trackerApiSlice.reducer,
});

const USE_BASIC = (import.meta.env.VITE_USE_BASIC_AUTH || '').toString() === 'true';

// Do not persist sensitive Basic Auth credentials; also force re-login on reload when Basic is enabled
const authPersistTransform = createTransform(
    (inboundState: any) => {
        if (USE_BASIC) {
            const { basicAuth, ...rest } = inboundState || {};
            return { ...rest, basicAuth: undefined };
        }
        return inboundState;
    },
    (outboundState: any) => {
        if (USE_BASIC) {
            const { basicAuth, ...rest } = outboundState || {};
            return { ...rest, basicAuth: undefined, isAuthenticated: false, accessToken: '', refreshToken: '' };
        }
        return outboundState;
    },
    { whitelist: ['auth'] },
);

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'userInfo'],
    transforms: [authPersistTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(
            authApi.middleware,
            userApi.middleware,
            documentApi.middleware,
            operationApi.middleware,
            zipDocumentApi.middleware,
            trackerApiSlice.middleware,
        ),
    devTools: true,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
