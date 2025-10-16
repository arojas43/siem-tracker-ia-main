import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppState, ToastState } from './appState.types';
import { BootstrapColorVariant } from '@utils/utils.types';

const initialState: AppState = {
    toastState: { show: false, message: '', variant: BootstrapColorVariant.PRIMARY, isError: false },
};

const appStateSlice = createSlice({
    initialState,
    name: 'appState',
    reducers: {
        clearAppState: () => initialState,
        /* TOASTER STATE */
        appIsToasting(state: AppState, { payload }: PayloadAction<ToastState>) {
            const { message, show, variant, isError } = payload;

            state.toastState.show = show;
            state.toastState.message = message;
            state.toastState.variant = variant;
            state.toastState.isError = isError;
        },
    },
});

export default appStateSlice.reducer;
export const { clearAppState, appIsToasting } = appStateSlice.actions;
