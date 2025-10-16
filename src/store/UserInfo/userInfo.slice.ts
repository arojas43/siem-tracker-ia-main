import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { UserState, UserResponse } from './userInfo.types';

const initialState: UserState = {
    id: -1,
    profilePhoto: '',
    isSuperuser: false,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    userType: 'siem',
    client: -1,
    userPermissions: [],
};

const userInfoSlice = createSlice({
    initialState,
    name: 'userInfoSlice',
    reducers: {
        clearUserState: () => initialState,
        saveUserInfo(state: UserState, { payload }: PayloadAction<UserResponse>) {
            const {
                id,
                profile_photo,
                is_superuser,
                username,
                first_name,
                last_name,
                email,
                user_type,
                client,
                user_permissions,
            } = payload;

            state.id = id;
            state.profilePhoto = profile_photo;
            state.isSuperuser = is_superuser;
            state.username = username;
            state.firstName = first_name;
            state.lastName = last_name;
            state.email = email;
            state.userType = user_type;
            state.client = client;
            state.userPermissions = user_permissions;
        },
    },
});

export default userInfoSlice.reducer;
export const { clearUserState, saveUserInfo } = userInfoSlice.actions;
