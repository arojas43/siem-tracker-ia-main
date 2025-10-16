import { type FC, useEffect, useRef, useState } from 'react';
import type { GoogleMapsContainerProps } from './GoogleMapsContainer.types';
import { GOOGLE_MAPS_BASE_URL } from './GoogleMapsContainer.types';

const GoogleMapsContainer: FC<GoogleMapsContainerProps> = ({ mapInformation }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [hasMap, setHasMap] = useState(false);
    const coordinatesDataRef = useRef<Record<string, any>>({ lat: 0, lng: 0 });
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        // if (hasMap) {
        const existingScript = document.querySelector(`script[src^="${GOOGLE_MAPS_BASE_URL}"]`);
        (window as any).initMap = initMap;

        if (!existingScript) {
            const script = document.createElement('script');
            script.src = `${GOOGLE_MAPS_BASE_URL}?key=${
                import.meta.env.VITE_GOOGLE_MAPS_API_KEY
            }&callback=initMap&loading=async&libraries=marker`;
            script.async = true;
            script.defer = true;
            script.onerror = () => console.error('Failed to load Google Maps script');
            document.head.appendChild(script);
        } else if ((window as any).google?.maps) {
            initMap();
        }
        // }
    }, [hasMap]);

    useEffect(() => {
        if (mapInformation) {
            let hasCoordinates = false;
            let holderCoords = { lat: 0, lng: 0 };

            const { country_to, country_from } = mapInformation;

            if (country_to && country_to.id) {
                holderCoords = {
                    lat: country_to.latitude,
                    lng: country_to.longitude,
                };
                hasCoordinates = true;
            } else if (country_from && country_from.id) {
                holderCoords = {
                    lat: country_from.latitude,
                    lng: country_from.longitude,
                };
                hasCoordinates = true;
            }

            coordinatesDataRef.current = holderCoords;
            setHasMap(hasCoordinates);
        }
    }, [mapInformation]);

    const initMap = async () => {
        if (mapRef.current && (window as any).google) {
            const google = (window as any).google;
            const coords = coordinatesDataRef.current;

            if (!coords) return;

            const map = new google.maps.Map(mapRef.current, {
                zoom: hasMap ? 5 : 1.5,
                center: coords,
                zoomControl: false,
                mapTypeControl: false,
                disableDefaultUI: true,
                gestureHandling: 'none',
                streetViewControl: false,
                fullscreenControl: false,
                mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
            });
            mapInstanceRef.current = map;

            if (hasMap) {
                new google.maps.marker.AdvancedMarkerElement({
                    map,
                    position: coords,
                });
            }

            setIsMapReady(true);
        }
    };

    const renderMapBlock = () => {
        return (
            <>
                {!isMapReady && (
                    <div
                        style={{
                            inset: 0,
                            zIndex: 1,
                            display: 'flex',
                            fontWeight: 500,
                            fontSize: '1rem',
                            position: 'absolute',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f9f9f9',
                        }}
                    >
                        Cargando mapa...
                    </div>
                )}
                <div
                    ref={mapRef}
                    style={{ width: '100%', height: '100%', borderRadius: '20px' }}
                />
            </>
        );
    };

    // const renderMapPlaceholder = () => {
    //     return (
    //         <div
    //             style={{
    //                 inset: 0,
    //                 zIndex: 1,
    //                 display: 'flex',
    //                 fontWeight: 500,
    //                 fontSize: '1rem',
    //                 position: 'absolute',
    //                 alignItems: 'center',
    //                 justifyContent: 'center',
    //                 backgroundColor: '#f9f9f9',
    //                 borderRadius: 20,
    //             }}
    //         >
    //             Ubicación no disponible por el momento.
    //         </div>
    //     );
    // };

    return (
        <div style={{ width: '100%', height: '400px', position: 'relative' }}>
            {/* {hasMap ? renderMapBlock() : renderMapPlaceholder()} */}
            {renderMapBlock()}
        </div>
    );
};

export default GoogleMapsContainer;
