interface DocumentListItem {
    documentName: string;
    required: boolean;
    file_name?: string;
    gCloudStorageUrl?: string;
    completed?: boolean;
}

interface ImageListItem {
    photoId: number;
    photoName?: string;
    gCloudStorageUrl?: string;
}

export interface UserListItem {
    id: number;
    firstName: string;
    lastName: string;
}

export interface Expense {
    uploaded: boolean;
    name: string;
}
export interface TaskActionRequirements {
    firstFieldLabel?: string;
    firstFieldValue?: string;

    secondFieldLabel?: string;
    secondFieldValue?: string;

    thirdFieldLabel?: string;
    thirdFieldValue?: string;

    firstDateLabel?: string;
    firstDateValue?: string;

    secondDateLabel?: string;
    secondDateValue?: string;

    thirdDateLabel?: string;
    thirdDateValue?: string;

    forthDateLabel?: string;
    forthDateValue?: string;

    documentListSize?: number;
    documentList?: DocumentListItem[];
    images?: ImageListItem[];

    usersList?: UserListItem[];

    checkboxLabel?: string;
    checkboxValue?: string;

    commentValue?: string;

    expensesList?: Expense[];
    canDownloadExpenses?: boolean;

    selectedUserId?: number;
    firstDateRequired?: boolean;
    secondDateRequired?: boolean;
    thirdDateRequired?: boolean;
    forthDateRequired?: boolean;
}

export interface TaskActionFormProps {
    showCard?: boolean;
    taskActionRequirements?: TaskActionRequirements;
    onClose: (reload?: boolean) => void;
    taskId: number;
}

export type FileTypeMap = {
    'image/png'?: any[];
    'image/jpg'?: any[];
    'image/jpeg'?: any[];
    'application/pdf'?: any[];
    'application/vnd.ms-excel'?: any[];
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'?: any[];
};

export interface TrackerFile extends File {
    documentName: string;
    dropdownIndex: number;
    dropDownSelectedName: string;
    originalDocumentName: string;
}

export interface TaskDocument {
    file_name?: string;
    completed?: boolean;
    gCloudStorageUrl?: string;
    required: boolean;
    selected: boolean;
    documentName: string;
}
