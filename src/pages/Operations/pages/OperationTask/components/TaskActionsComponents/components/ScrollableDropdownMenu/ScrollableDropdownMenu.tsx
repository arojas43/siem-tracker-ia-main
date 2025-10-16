import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import classes from './ScrollableDropdownMenu.module.scss';

interface ScrollableDropdownMenuProps {
    maxHeight?: number;
    children: React.ReactNode;
}

const ScrollableDropdownMenu: React.FC<ScrollableDropdownMenuProps> = ({ maxHeight = 150, children }) => (
    <Dropdown.Menu
        className={classes.scrollableMenu}
        style={{ maxHeight }}
    >
        {children}
    </Dropdown.Menu>
);

export default ScrollableDropdownMenu;
