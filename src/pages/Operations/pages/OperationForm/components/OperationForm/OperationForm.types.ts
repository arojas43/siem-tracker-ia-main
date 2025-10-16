export interface OperationFormProps {
    operationCode: string | undefined;
}

export const REQUIRED_KEYS = {
    client: 'isInvalidClient',
    customs: 'isInvalidCustoms',
    reception_date: 'isInvalidReceptionDate',
    operation_type: 'isInvalidOperationType',
    siem_client_advisor: 'isInvalidSiemClientAdvisor',
};

export type RequiredKeysType = keyof typeof REQUIRED_KEYS;

export type DropdownFormField =
    | 'client'
    | 'carrier'
    | 'customs'
    | 'priority'
    | 'supplier'
    | 'operator'
    | 'ship_flag'
    | 'forwarder'
    | 'classifier'
    | 'accountant'
    | 'weight_unit'
    | 'siem_advisor'
    | 'operation_type'
    | 'transport_unit'
    | 'merchandise_type'
    | 'prior_in_origin'
    | 'operations_manager'
    | 'accounting_manager'
    | 'siem_client_advisor'
    | 'operations_director'
    | 'operations_executive'
    | 'logistics_supervisor'
    | 'operational_documenter'
    | 'national_logistics_manager'
    | 'customs_compliance_manager'
    | 'traffic_and_logistics_manager'
    | 'senior_traffic_logistics_analyst';
