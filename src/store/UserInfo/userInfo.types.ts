export interface UserState {
    id: number;
    profilePhoto: string;
    isSuperuser: boolean;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: 'siem' | 'external';
    client: number;
    userPermissions: any[];
}

export interface UserResponse {
    id: number;
    profile_photo: string;
    is_superuser: boolean;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    user_type: 'siem' | 'external';
    client: number;
    user_permissions: any[];
}
