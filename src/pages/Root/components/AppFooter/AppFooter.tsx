import classes from './AppFooter.module.scss';
import type { FC } from 'react';

const AppFooter: FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={classes['app-footer']}>
            <p>&copy; {currentYear} Nova Code. All rights reserved.</p>
        </footer>
    );
};

export default AppFooter;
