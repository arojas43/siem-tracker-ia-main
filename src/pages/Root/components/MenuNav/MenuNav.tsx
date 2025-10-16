import Nav from 'react-bootstrap/esm/Nav';
import classes from './MenuNav.module.scss';
import { useEffect, useState, type FC } from 'react';
import { NavLink, Link } from 'react-router-dom';
import SiemLogo from '@components/SiemLogo/SiemLogo';
import { IoHomeOutline } from 'react-icons/io5';
import { MdContentPaste } from 'react-icons/md';
import { FaRegHandshake } from 'react-icons/fa6';
import { AiOutlineContainer } from 'react-icons/ai';
import { GiPoliceOfficerHead } from 'react-icons/gi';
import { FaHandHolding } from 'react-icons/fa';
import { FaRobot } from 'react-icons/fa';
//import { AiOutlineContacts } from 'react-icons/ai';
import navMobileEvent from '../../navMobileEvent';
import useUserType from '@hooks/userType.hooks';
// import ChatbotAgent from '@components/ChatbotAgent/ChatbotAgent'; // Removed - now using page

const MenuNav: FC = () => {
    const INACTIVE_CLASS = `nav-link ${classes['menu-nav__item']} ${classes['menu-nav__item-deactive']}`;
    const ACTIVE_CLASS = `nav-link ${classes['menu-nav__item']} ${classes['menu-nav__item-active']}`;

    const { isClient } = useUserType();
    const [isMobileMenuOpened, setIsMobileMenuOpened] = useState(false);

    const handleMobileMenuClick = () => {
        setIsMobileMenuOpened(false);
    };

    useEffect(() => {
        const handleEvent = () => {
            setIsMobileMenuOpened(!isMobileMenuOpened);
        };

        navMobileEvent.addEventListener('menuOpened', handleEvent);

        return () => {
            navMobileEvent.removeEventListener('menuOpened', handleEvent);
        };
    }, [isMobileMenuOpened]);

    useEffect(() => {
        const handleCloseMenuEvent = () => {
            setIsMobileMenuOpened(false);
        };

        navMobileEvent.addEventListener('menuClosed', handleCloseMenuEvent);

        return () => {
            navMobileEvent.removeEventListener('menuClosed', handleCloseMenuEvent);
        };
    }, []);

    return (
        <div
            className={
                isMobileMenuOpened ? `${classes['menu-nav']} ${classes['menu-nav-opened']}` : classes['menu-nav']
            }
        >
            <div className={classes['menu-nav__logo']}>
                <Link to="/home">
                    <SiemLogo
                        className={classes['menu-nav__logo--image']}
                        style={{ cursor: 'pointer' }}
                    />
                </Link>
            </div>

            <Nav
                defaultActiveKey="/home"
                className={classes['menu-nav__list']}
            >
                <Nav.Item>
                    <NavLink
                        onClick={handleMobileMenuClick}
                        to="/home"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <IoHomeOutline size={25} />
                        Menú
                    </NavLink>
                </Nav.Item>

                <Nav.Item>
                    <NavLink
                        onClick={handleMobileMenuClick}
                        to="/operations"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <AiOutlineContainer size={25} />
                        Operaciones
                    </NavLink>
                </Nav.Item>

                <Nav.Item hidden={isClient}>
                    <NavLink
                        onClick={handleMobileMenuClick}
                        to="/tasks"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <MdContentPaste size={25} />
                        Tareas
                    </NavLink>
                </Nav.Item>
                <Nav.Item hidden={isClient}>
                    <NavLink
                        onClick={handleMobileMenuClick}
                        to="/clients"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <FaRegHandshake size={25} />
                        Clientes
                    </NavLink>
                </Nav.Item>
                <Nav.Item hidden={isClient}>
                    <NavLink
                        onClick={handleMobileMenuClick}
                        to="/suppliers"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <FaHandHolding size={25} />
                        Proveedores
                    </NavLink>
                </Nav.Item>
                <Nav.Item hidden={isClient}>
                    <NavLink
                        onClick={handleMobileMenuClick}
                        to="/customs"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <GiPoliceOfficerHead size={25} />
                        Aduanas
                    </NavLink>
                </Nav.Item>
                
                {/* Chatbot Agent - Available for all users */}
                <Nav.Item>
                    <NavLink
                        onClick={handleMobileMenuClick}
                        to="/chatbot"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <FaRobot size={25} />
                        Asistente IA
                    </NavLink>
                </Nav.Item>
                {/* <Nav.Item>
                    <NavLink
                        onClick={handleMobileMenuClick}
                        to="/directory"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <AiOutlineContacts size={25} />
                        Directorio
                    </NavLink>
                </Nav.Item> */}
                {/* <Nav.Item>
                    <NavLink
                        to="/advisors"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <IoHomeOutline size={25} />
                        Asesores
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink
                        to="/reports"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <IoHomeOutline size={25} />
                        Reportes
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink
                        to="/investments"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <IoHomeOutline size={25} />
                        Inversion
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink
                        to="/configuration"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <IoHomeOutline size={25} />
                        Configuracion
                    </NavLink>
                </Nav.Item> */}
                {/* <Nav.Item>
                    <NavLink
                        onClick={handleMobileMenuClick}
                        to="/help"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        <RiCustomerService2Line size={25} />
                        Ayuda
                    </NavLink>
                </Nav.Item> */}
            </Nav>
        </div>
    );
};

export default MenuNav;
