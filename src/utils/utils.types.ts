export enum BootstrapColorVariant {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    SUCCESS = 'success',
    DANGER = 'danger',
    WARNING = 'warning',
    INFO = 'info',
    LIGHT = 'light',
    DARK = 'dark',
}

export type BootstrapColorVariantType = `${BootstrapColorVariant}`;

export function getQueryString(url: string): string {
    const queryIndex = url.indexOf('?');
    return queryIndex !== -1 ? url.slice(queryIndex) : '';
}

export type FormDataValues = {
    [key: string]: string | null | undefined;
};

export type RequirementsTaskAcion = {
    [key: string]: boolean;
};
