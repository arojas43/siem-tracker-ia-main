import classes from './SiemLogo.module.scss';
import type { FC } from 'react';
import type { ImageProps } from 'react-bootstrap/Image';
import Image from 'react-bootstrap/Image';
import siemLogo from '@assets/images/logo_siem.svg';

interface SiemLogoProps extends Omit<ImageProps, 'size'> {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // Custom size options for the logo
}

const SiemLogo: FC<SiemLogoProps> = ({ size = 'md', ...props }) => {
    return (
        <Image
            src={siemLogo}
            className={classes[`image-${size}`]}
            {...props}
        />
    );
};

export default SiemLogo;
