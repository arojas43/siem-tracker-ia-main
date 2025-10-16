import classes from './OperationNavTabs.module.scss';

import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import Nav from 'react-bootstrap/esm/Nav';
import { TABS_NAMES } from './OperationNavTabs.types';

const INACTIVE_CLASS = `nav-link ${classes['nav-link']}`;
const ACTIVE_CLASS = `nav-link ${classes['nav-link-active']}`;

const OperationNavTabs: FC = () => {
    return (
        <div>
            <Nav
                fill
                variant="tabs"
                defaultActiveKey="/phases"
                className={classes['nav']}
            >
                <Nav.Item className={classes['nav-item']}>
                    <NavLink
                        to={TABS_NAMES.FORM}
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        Campos de la operación
                    </NavLink>
                </Nav.Item>
                <Nav.Item className={classes['nav-item']}>
                    <NavLink
                        to={TABS_NAMES.PHASES}
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        Fases
                    </NavLink>
                </Nav.Item>
                <Nav.Item className={classes['nav-item']}>
                    <NavLink
                        to={TABS_NAMES.PEDIMENTS}
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        Pedimentos
                    </NavLink>
                </Nav.Item>
                <Nav.Item className={classes['nav-item']}>
                    <NavLink
                        to={TABS_NAMES.DATES}
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        Fechas
                    </NavLink>
                </Nav.Item>
                <Nav.Item className={classes['nav-item']}>
                    <NavLink
                        to="documents"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        Documentos
                    </NavLink>
                </Nav.Item>
                <Nav.Item className={classes['nav-item']}>
                    <NavLink
                        to="images"
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        Previo
                    </NavLink>
                </Nav.Item>
                {/* 
                <Nav.Item className={classes['nav-item']}>
                    <NavLink
                        to={TABS_NAMES.SETTINGS}
                        className={({ isActive }) => (isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
                    >
                        Ajustes
                    </NavLink>
                </Nav.Item>
                 */}
            </Nav>
        </div>
    );
};

export default OperationNavTabs;
