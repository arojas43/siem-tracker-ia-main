/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ENV: string;
    readonly VITE_IS_PROD: string;
    readonly VITE_API_ENDPOINT: string;
    readonly VITE_CHATBOT_ENDPOINT?: string;
    readonly VITE_GOOGLE_MAPS_MAP_ID: string;
    readonly VITE_GOOGLE_MAPS_API_KEY: string;
    readonly VITE_USE_BASIC_AUTH?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
