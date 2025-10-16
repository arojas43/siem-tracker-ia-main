/** AUTHENTICATION API ENDPOINTS */
export const LOGIN_ENDPOINT = '/token/';

/** HOME API ENDPOINTS */
export const HOME_WIDGET_DATA_ENDPOINT = '/summary/home/';
export const CLIENT_HOME_WIDGET_DATA_ENDPOINT = '/summary/home/client/';

/** FILES API ENDPOINTS  */
export const DELETE_FILE_ENDPOINT = '/delete_file/';
export const OPERATION_FILES_ENDPOINT = '/download_operation_files/';
export const CLIENT_OPERATION_FILES_ENDPOINT = '/download_operation_files/client/';
export const ZIP_OPERATION_FILES_ENDPOINT = '/download_operation_files/zip/';
export const ZIP_CLIENT_OPERATION_FILES_ENDPOINT = '/download_operation_files/client/';
export const OPERATION_PEDIMENTS_FILES_ENDPOINT = '/download_operation_files/pediments/';
export const OPERATION_EXPENSES_FILES_ENDPOINT = '/download_operation_files/expenses/';

/** OPERATIONS API ENDPOINTS  */
export const OPERATIONS_ENDPOINT = '/operations/';
export const OPERATION_FORWARDER_ENDPOINT = '/forwarders/';
export const OPERATION_TYPES_ENDPOINT = '/operation_types/';
export const OPERATION_WIDGETS_DATA_ENDPOINT = '/summary/operations/';
export const CLIENT_OPERATION_WIDGETS_DATA_ENDPOINT = '/summary/operations/client/';
export const OPERATIONS_REFERENCE_NUMBER_ENDPOINT = '/reference-number/';

export const TASK_ENDPOINT = '/tasks/';
export const USERS_ENDPOINT = '/users/';
export const USERS_CHANGE_PASSWORD_ENDPOINT = '/change_password/';
export const CUSTOMS_ENDPOINT = '/customs/';
export const CLIENTS_ENDPOINT = '/clients/';
export const REFRESH_ENDPOINT = '/token/refresh/';
export const CONTAINERS_ENDPOINT = '/containers/';

export const GROUPED_USERS_ENDPOINT = '/group_users/';
export const SUPPLIERS_ENDPOINT = '/goods_suppliers/';

export const MERCHANDISE_TYPE_ENDPOINT = '/merchandise_types/';
export const PHASES_BY_OPCODE_ENDPOINT = '/phases-by-operation-code/';
export const TASKS_BY_OPCODE_PHASES_ID_ENDPOINT = '/tasks-by-phase-and-operation/';
export const ALL_TASKS_BY_OPCODE_PHASES_ID_ENDPOINT = '/all-tasks-by-phase-and-operation/';
export const CLIENT_PHASES_BY_OPCODE_ENDPOINT = '/phases-by-operation-code/client/';
export const COUNTRIES_ENDPOINT = '/countries/';
export const LANGUAGES_ENDPOINT = '/languages/';

export enum TRACKER_TAG_TYPES {
    USER_TAG = 'userTag',
    DOCUMENT_TAG = 'documentTag',
    OPERATIONS_TAG = 'operationsTag',
    AUTHENTICATION_TAG = 'authenticationTag',
}

export enum HTTP_METHODS {
    GET = 'GET',
    PUT = 'PUT',
    POST = 'POST',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

export type LoginBody = {
    username: string;
    password: string;
};

export interface ClientInfo {
    client_id: number;
    client_name: string;
}

export interface SiemAdvisorInfo {
    siem_advisor_id: number;
    siem_advisor_first_name: string;
}

// export interface Operation {
//     carrier: number;
//     client_info: ClientInfo;
//     container: number;
//     created_at: string;
//     customs: number;
//     customs_declaration: number;
//     description: string;
//     forwarder: number;
//     id: number;
//     operation_code: string;
//     operation_type: string;
//     progress: string;
//     siem_advisor_info: SiemAdvisorInfo;
//     updated_at: string;

// }
// todo fix any types
export interface Operation {
    id: number;
    client_info: {
        client_id: number;
        client_name: string;
    };
    siem_advisor: any; // todo fix
    operation_code: string;
    observation: string;
    operation_type: string;
    container_size: string;
    transport_unit: string;
    prior_in_origin: boolean;
    progress: number;
    reception_date: string;
    MBL: string;
    master_bill: string;
    ETA: string;
    weight: number;
    weight_unit: string;
    packages: number;
    CBM: number;
    rectifications: string;
    priority: string;
    free_days: number;
    created_at: string;
    updated_at: string;
    container: any; // todo fix
    customs: any; // todo fix
    customs_declaration: any; // todo fix
    carrier: number;
    forwarder: number;
    siem_client_advisor: number;
    supplier: number;
    operations_director: number;
    operations_manager: number;
    traffic_and_logistics_manager: number;
    accounting_manager: number;
    accountant: number;
    customs_compliance_manager: number;
    national_logistics_manager: number;
    logistics_supervisor: number;
    senior_traffic_logistics_analyst: number;
    operations_executive: number;
    operational_documenter: number;
    classifier: number;
    operator: number;
    dispatch_customs: any; // todo fix
    merchandise_type: number;
    reference: string;
    used_free_days: string;
    revalidation_date: string;
    status: string;
    ship_flag: number;
    pis_entry_date: string;
    merchandise_description: string;
    license_plate: string;
    economic_number: number;
    supplier_name: string;
    siem_client_advisor_info: {
        siem_client_advisor_id: number;
        siem_client_advisor_name: string;
        siem_client_advisor_photo: string;
    };
    customs_declaration_info: {
        detailed_customs_declaration: string;
        rectified_customs_declaration: string;
    };
}

export interface GetOperationsResponse {
    count: number;
    next: string;
    previous: string;
    results: Operation[];
}

export interface GetOperationWidgetsDataResponse {
    active_operations: number;
    growth_percentage: number;
    growth_trend: 'up' | 'down';
    total_operations: number;
    total_payment_pediment: number;
    total_payment_pediment_growth_trend: 'up' | 'down';
}

export interface GetClientOperationWidgetsDataResponse {
    active_operations: number;
    growth_percentage: number;
    growth_trend: 'up' | 'down';
    total_operations: number;
}

export interface GetOperationsReferenceNumberResponse {
    reference_number: string;
}

export interface Client {
    id: number;
    is_active: boolean;
    full_name: string;
    logo: string;
    address: string;
    created_at: string;
    updated_at: string;
}

export interface Supplier {
    id: number;
    supplier_name: string;
    tax_id: string;
    tax_address: string;
    created_at: string;
    updated_at: string;

    supplier_country_info: {
        id: number;
        name: string;
    };
    supplier_language_info: {
        id: number;
        name: string;
    };
}

export interface Merchandise {
    id: number;
    name: string;
}

export interface Customs {
    id: number;
    customs_name: string;
    customs_key: string;
    created_at: string;
    updated_at: string;
}

export interface Country {
    id: number;
    is_active: boolean;
    country_name: string;
    created_at: string;
    updated_at: string;
}

export interface Language {
    id: number;
    is_active: boolean;
    name: string;
    iso_code: string;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export type ClientResponse = PaginatedResponse<Client>;
export type SupplierResponse = PaginatedResponse<Supplier>;
export type CustomsResponse = PaginatedResponse<Customs>;
export type MerchandiseTypeResponse = PaginatedResponse<Merchandise>;
export type CountriesResponse = PaginatedResponse<Country>;
export type LanguagesResponse = PaginatedResponse<Language>;
export type TasksResponse = PaginatedResponse<Task>;

export interface User {
    id: number;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
    client_id: number;
    group_name: string;
}

export interface OperationByClient {
    name: string;
    total: number;
    finished: number;
}

export interface OperationByType {
    A1: number;
    M3: number;
    A3: number;
    A4: number;
}

export interface OperationSummary {
    active?: number;
    in_progress?: number;
    created: number;
    finished: number;
}

export interface Semaphore {
    green: { count: number; label: string };
    red: { count: number; label: string };
    yellow: { count: number; label: string };
}

export interface HomeWidgetResponse {
    month: string;
    operations_by_client: OperationByClient[];
    operations_summary: OperationSummary;
    // todo fix that
    pending_tasks: any[];
    semaphore: Semaphore;
}

export interface ClientHomeWidgetResponse {
    month: string;
    client_name: string;
    operations_by_type: OperationByType;
    operations_summary: OperationSummary;
}

export interface UsersResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: User[];
}

export interface GroupUser {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    client_id: number;
}

export interface GroupUserData {
    default: number;
    group_users: GroupUser[];
}

export interface GroupUsersResponse {
    users: GroupUserData;
    operators: GroupUserData;
    classifiers: GroupUserData;
    accountants: GroupUserData;
    super_admins: GroupUserData;
    siem_advisors: GroupUserData;
    accounting_managers: GroupUserData;
    operations_managers: GroupUserData;
    operations_directors: GroupUserData;
    siem_client_advisors: GroupUserData;
    logistics_supervisors: GroupUserData;
    operations_executives: GroupUserData;
    operational_documenters: GroupUserData;
    customs_compliance_managers: GroupUserData;
    national_logistics_managers: GroupUserData;
    traffic_and_logistics_managers: GroupUserData;
    senior_traffic_logistics_analysts: GroupUserData;
}

export type GroupUserRoles = keyof GroupUsersResponse;

export interface UpdateOperationRequest {
    operationId: number;
    operationRequestBody: CreateOperationRequest;
}

export interface CreateOperationRequest {
    MBL?: string;
    ETA?: string;
    CBM?: string;
    weight?: number;
    client?: string;
    customs?: string;
    carrier?: string;
    progress?: string;
    packages?: number;
    supplier?: string;
    priority?: string;
    container?: string;
    free_days?: number;
    forwarder?: string;
    master_bill?: string;
    weight_unit?: string;
    observation?: string;
    rectifications?: string;
    reception_date?: string;
    operation_code?: string;
    operation_type?: string;
    container_size?: string;
    transport_unit?: string;
    prior_in_origin?: string;
    siem_client_advisor?: string;
    customs_declaration?: string;
    operations_director?: string;
    operations_manager?: string;
    traffic_and_logistics_manager?: string;
    accounting_manager?: string;
    customs_compliance_manager?: string;
    national_logistics_manager?: string;
    logistics_supervisor?: string;
    senior_traffic_logistics_analyst?: string;
    operations_executive?: string;
    operational_documenter?: string;
    classifier?: string;
    operator?: string;
    dispatch_customs?: string;
    merchandise_type?: string;
}

export interface ContainerResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Container[];
}

export interface Container {
    id: number;
    ETA: string;
    free_days: number;
    used_free_days: number;
    BL: string;
    house_waybill: string;
    weight: string;
    packages: number;
    status: string;
    remarks: string;
    created_at: string;
    updated_at: string;
    country_of_origin: number;
    supplier: number;
    customs: number;
}

export interface Advisors {
    id: number;
    username: string;
    last_name: string;
    first_name: string;
    profile_picture: string;
}

export interface Phase {
    id: number;
    name: string;
    order: number;
    phase_progress: number;
    phase_status: string;
    updated_at: string;
    phase_type: string;
    reception_date: string;
    advisors: Advisors[];
    client_payment_date?: string;
    expense_report_submission_date?: string;
    register_invoice_issue_date?: string;
    invoice_issue_date?: string;
    pre_inspection_appointment_date?: string;
    register_modulation_date?: string;
    register_a1_customs_payment?: string;
    register_final_delivery_date?: string;
    prior_in_origin?: boolean;
}

export interface PhasesByOperationCodeResponse {
    operation_code: string;
    operation_type: string;
    phases: Phase[];
}

export interface GoogleMapsCountryData {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
}

export interface ClientPhasesByOperationCodeResponse {
    MBL: string;
    detailed_customs_declaration: string;
    rectified_customs_declaration: string;
    prior_in_origin: string;
    ETA: string;
    container: string;
    operation_code: string;
    operation_type: string;
    country_from: GoogleMapsCountryData;
    country_to: GoogleMapsCountryData;
    observation: string;
    siem_advisor_info: {
        id: number;
        username: string;
        last_name: string;
        first_name: string;
    };
    phases: Phase[];
    custom_name: string;
    supplier_name: string;
}

export type TaskActionType =
    | 'one_date'
    | 'two_dates'
    | 'four_dates'
    | 'form_1_field'
    | 'photo_upload'
    | 'form_3_fields'
    | 'document_upload'
    | 'user_assignation'
    | 'download_expenses'
    | 'one_date_doc_upload'
    | 'two_dates_doc_upload'
    | 'three_dates_doc_upload'
    | 'one_date_comments_checkbox'
    | 'checkbox_onYes_date_1_comments'
    | 'one_date_checkbox_onYes_comments'
    | 'checkbox_onYes_2_dates_doc_upload'
    | 'one_date_checkbox_onYes_doc_upload'
    | 'one_date_checkbox_onYes_one_date_doc_upload';

export interface TaskDocumentUpload {
    documentList: [
        {
            documentName: string;
            required: boolean;
        },
    ];
    documentListSize: 1;
}

export interface Task {
    id: number;
    isActive: boolean;
    status: string;
    created_at: string;
    taskId: number;
    task_name: string;
    taskTitle: string;
    updatedAt: string;
    taskStatus: string;
    associateId: string;
    taskActionType: TaskActionType;
    taskActionRequirements: TaskDocumentUpload;
    additional_info: {
        operation_code: string;
        phase_id: number;
        phase_name: string;
    };
    advisor_info: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        profile_picture: string;
    };
}
export interface SmallTask {
    isActive: boolean;
    taskId: string;
    taskName: string;
}

export interface TasksByOperationCodeAndPhaseIdResponse {
    phaseId: string;
    operationId: string;
    tasksCompleted: Task[];
    tasksIncompleted: Task[];
    phaseName?: string;
}

export interface AllTasksByOperationCodeAndPhaseIdResponse {
    tasks: SmallTask[];
}

export interface ClientRequest {
    id?: number;
    full_name?: string;
    logo?: string;
    address?: string;
    is_active?: boolean;
}

export interface UpdateClientRequest {
    clientId: number;
    clientRequestBody: ClientRequest;
}

export interface CustomRequest {
    id?: number;
    customs_name?: string;
    customs_key?: string;
}

export interface UpdateCustomRequest {
    customId: number;
    customRequestBody: CustomRequest;
}

export interface DirectoryUser {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    user_type: string;
    profile_photo: string | null;
    client: number | null;
    position: { id: number; name: string } | null;
    department: string | null;
}

export interface DirectoryUserResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: DirectoryUser[];
}

export interface DirectoryRequest {
    search?: string;
    ordering?: string;
    limit?: number;
    offset?: number;
    department?: string;
    email?: string;
    phone?: string;
}

export interface SupplierRequest {
    id?: number;
    supplier_name?: string;
    supplier_country?: string;
    supplier_language?: string;
    tax_id?: string;
    tax_address?: string;
}

export interface UpdateSupplierRequest {
    supplierId: number;
    supplierRequestBody: SupplierRequest;
}

export const onQueryStartedErrorHandle = async (_args: any, api: any) => {
    try {
        await api.queryFulfilled;
    } catch ({ error: { status } }: any) {
        // Authentication API Error - status logged for debugging
        // eslint-disable-next-line no-console
        console.error('Authentication API Error:', status);
    }
};

export interface OperationDocument {
    created_at: string;
    documentName: string;
    file_name: string;
    file_type: 'documents' | 'images';
    gCloudStorageUrl: string;
}

export interface DocumentResponse {
    status: string;
    type: string;
    urls: OperationDocument[];
}
