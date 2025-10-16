import { store } from '@store/store';
import { useEffect } from 'react';

export default function useUserType() {
    const { userType, isSuperuser } = store.getState().userInfo;

    let isSuperUser = isSuperuser;
    let isSIEM = userType === 'siem';
    let isClient = userType === 'external';

    useEffect(() => {
        isSuperUser = isSuperuser;
        isSIEM = userType === 'siem';
        isClient = userType === 'external';
    }, [userType]);

    return { isSIEM, isClient, isSuperUser };
}
