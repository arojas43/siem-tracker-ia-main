export const PHASE_STATUS_TEXT_DICTIONARY: Record<string, string> = {
    created: 'Creado',
    completed: 'Completado',
    'in progress': 'En Progreso',
    // Operation options
    'not started': 'No Iniciada',
    blocked: 'Bloqueada',
    'under review': 'En Revision',
    'on the way': 'En Camino',
};

export const PHASE_STATUS_DICTIONARY: Record<string, string> = {
    created: 'error',
    completed: 'success',
    'in progress': 'warning',
    // Operation options
    'not started': 'error',
    blocked: 'blocked',
    'under review': 'underReview',
    'on the way': 'onTheWay',
};
