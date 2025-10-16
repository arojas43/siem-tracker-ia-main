import type { BootstrapColorVariantType } from '@utils/utils.types';

export interface ToastState {
    message: string;
    show: boolean;
    isError: boolean;
    variant?: BootstrapColorVariantType;
}

export interface AppState {
    toastState: ToastState;
}
