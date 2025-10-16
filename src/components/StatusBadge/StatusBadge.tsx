import classes from './StatusBadge.module.scss';
import type { FC } from 'react';
import type { StatusBadgeProps } from './StatusBadge.types';

const StatusBadge: FC<StatusBadgeProps> = ({ text, status }) => {
    return (
        <div className={classes.statusBadge}>
            <span className={`${classes.statusDot} ${classes[status]}`} />
            <span className={classes.statusText}>{text}</span>
        </div>
    );
};

export default StatusBadge;
