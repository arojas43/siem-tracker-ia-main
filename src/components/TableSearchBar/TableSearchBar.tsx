import classes from './TableSearchBar.module.scss';
import { useRef, useState } from 'react';
import type { FC, KeyboardEvent, FocusEvent } from 'react';
import Form from 'react-bootstrap/esm/Form';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import { FaSearch } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

interface TableSearchBarProps {
    placeholder: string;
    onBlur: () => void;
    onClearSearch: () => void;
    onSearch: (search: string) => void;
}

const TableSearchBar: FC<TableSearchBarProps> = ({ placeholder = 'Buscar', onSearch, onClearSearch, onBlur }) => {
    const [search, setSearch] = useState<string>('');
    const prevSearchRef = useRef<string>('');

    const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setSearch(e.currentTarget.value);
            onSearch(e.currentTarget.value);
        }
    };

    const handleOnBlurSearch = (e: FocusEvent<HTMLInputElement>) => {
        const currentValue = e.currentTarget.value.trim();
        const previousValue = prevSearchRef.current.trim();

        if (previousValue !== '' && currentValue === '') {
            setSearch('');
            onBlur();
        }

        prevSearchRef.current = currentValue;
    };

    const handleClearSearch = () => {
        setSearch('');
        onClearSearch();
    };

    return (
        <InputGroup
            as="div"
            className={classes['search-bar']}
        >
            <InputGroup className={`me-2 ${classes['search-bar__input--group']}`}>
                <InputGroup.Text
                    className={`${classes['search-bar__input--icon']} ${classes['search-bar__icon--clickable']}`}
                    onClick={() => onSearch(search)}
                >
                    <FaSearch size={20} />
                </InputGroup.Text>

                <Form.Control
                    size="sm"
                    type="text"
                    placeholder={placeholder}
                    className={`me-2 ${classes['search-bar__input']}`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearch}
                    onBlur={handleOnBlurSearch}
                />
                <InputGroup.Text
                    hidden={!search}
                    className={classes['search-bar__input--icon']}
                    onClick={handleClearSearch}
                >
                    <IoMdClose size={20} />
                </InputGroup.Text>
            </InputGroup>
        </InputGroup>
    );
};

export default TableSearchBar;
