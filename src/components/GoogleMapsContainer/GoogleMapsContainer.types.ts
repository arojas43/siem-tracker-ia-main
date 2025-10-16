import type { GoogleMapsCountryData } from '@store/api/api.types';

export const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api/js';

export interface GoogleMapsContainerProps {
    mapInformation: Record<string, GoogleMapsCountryData>;
}
