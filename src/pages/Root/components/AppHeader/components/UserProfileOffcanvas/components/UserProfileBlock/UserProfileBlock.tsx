import { useChangeUserProfileImageMutation } from '@store/api/userApi.slice';
import classes from './UserProfileBlock.module.scss';
import { useEffect, useRef, type ChangeEvent, type FC } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Image from 'react-bootstrap/esm/Image';
import { BsCameraFill } from 'react-icons/bs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxTyped.hooks';
import { saveUserInfo } from '@store/UserInfo/userInfo.slice';

interface UserProfileBlockProps {}

const UserProfileBlock: FC<UserProfileBlockProps> = () => {
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { profilePhoto, firstName, lastName, email, id: userId } = useAppSelector((store) => store.userInfo);

    const [handleChangeUserProfilePic, { data: userData, isLoading: isLoadingChangeUserProfile }] =
        useChangeUserProfileImageMutation();

    useEffect(() => {
        if (userData) {
            dispatch(saveUserInfo(userData));
        }
    }, [userData]);

    const handleChangeProfilePic = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const formData = new FormData();
        formData.append('files', file as File);

        handleChangeUserProfilePic({
            userId: userId,
            body: formData,
        });
    };

    return (
        <>
            <div
                className={classes['image-wrapper']}
                style={{ position: 'relative', display: 'inline-block' }}
            >
                <Image
                    roundedCircle
                    style={{ width: 250, height: 250, objectFit: 'cover' }}
                    src={profilePhoto}
                    className={classes['user-image']}
                />

                {isLoadingChangeUserProfile && (
                    <div className={classes['loading-overlay']}>
                        <div className={classes['spinner']} />
                    </div>
                )}

                <Button
                    variant="light"
                    className={classes['camera-button']}
                    onClick={handleChangeProfilePic}
                >
                    <BsCameraFill size={25} />
                </Button>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className={classes['hidden-input']}
                    style={{ display: 'none' }}
                />
            </div>
            <div>
                <h5 style={{ textAlign: 'center' }}>
                    {firstName} {lastName}
                </h5>
                <h4 style={{ textAlign: 'center' }}>{email}</h4>
            </div>
        </>
    );
};

export default UserProfileBlock;
