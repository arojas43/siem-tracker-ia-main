import classes from './MainView.module.scss';
import { Outlet } from 'react-router-dom';
import MenuNav from '../MenuNav';
import AppHeader from '../AppHeader';
import AppFooter from '../AppFooter';
import Toaster from '@components/Toaster';
import navMobileEvent from '../../navMobileEvent';

const handleMobileMenuClick = (e: any) => {
    const eventName =
        e.target.id === 'mobile-menu' || e.target.parentNode.id === 'Menu_Burger' ? 'menuOpened' : 'menuClosed';
    const event = new CustomEvent(eventName, {});
    navMobileEvent.dispatchEvent(event);
};

const MainView: React.FC = () => {
    return (
        <div
            onClick={handleMobileMenuClick}
            className={classes['main-view__container']}
        >
            <Toaster />
            <div className={classes['main-view__outlet-container']}>
                <MenuNav />
                <div className={classes['main-view__content-container']}>
                    <AppHeader />
                    <Outlet />
                </div>
            </div>
            <AppFooter />
        </div>
    );
};

export default MainView;
