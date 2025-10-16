import type { FormDataValues, RequirementsTaskAcion } from './utils.types';

export function isFormDatesInvalid(formData: FormDataValues, requirements: RequirementsTaskAcion): boolean {
    return Object.entries(requirements).some(([key, required]) => {
        if (!required) return false;
        const fieldName = key.replace('Required', 'Value');
        return !formData[fieldName];
    });
}
