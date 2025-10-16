import classes from './TablePagination.module.scss';

import { useEffect, useMemo, useState, type FC } from 'react';
import Pagination from 'react-bootstrap/esm/Pagination';

interface TablePaginationProps {
    // todo
    data: any;
    resetOffset: boolean;
    onNextClick: () => void;
    onPreviousClick: () => void;
    handleGoToPage: (page: number) => void;
}
export const PAGE_SIZE = 10;

const TablePagination: FC<TablePaginationProps> = ({
    data,
    resetOffset,
    handleGoToPage,
    onPreviousClick,
    onNextClick,
}) => {
    const [offset, setOffset] = useState<number>(0);

    useEffect(() => {
        if (resetOffset) {
            console.log('resetting');
            setOffset(1);
        }
    }, [resetOffset]);

    const getPageNumbers = (current: number, total: number, delta = 2) => {
        const range: (number | string)[] = [];
        const left = Math.max(1, current - delta);
        const right = Math.min(total, current + delta);

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= left && i <= right)) {
                range.push(i);
            } else if ((i === left - 1 && left > 2) || (i === right + 1 && right < total - 1)) {
                range.push('...');
            }
        }

        return [...new Set(range)];
    };

    const goToPage = (page: number) => {
        const newOffset = (page - 1) * PAGE_SIZE;
        setOffset(newOffset);
        handleGoToPage(page);
    };

    const handleGetPreviousOperations = () => {
        console.log('PREV');
        const newOffset = Math.max(0, offset - PAGE_SIZE);
        setOffset(newOffset);
        onPreviousClick();
    };

    const handleGetNextOperations = () => {
        console.log('NEXT');
        const newOffset = offset + PAGE_SIZE;
        console.log('newOffset', newOffset);
        setOffset(newOffset);
        onNextClick();
    };

    const currentPage = useMemo(() => {
        if (!data?.next && !data?.previous) return 1;
        return Math.floor(offset / PAGE_SIZE) + 1;
    }, [data]);
    const totalPages = useMemo(() => {
        return Math.ceil((data?.count || 0) / PAGE_SIZE);
    }, [data]);

    return (
        <Pagination
            as="div"
            className={classes.paginationWrapper}
        >
            <Pagination.Prev
                disabled={!data?.previous}
                onClick={handleGetPreviousOperations}
            />

            {getPageNumbers(currentPage, totalPages).map((page, index) =>
                typeof page === 'number' ? (
                    <Pagination.Item
                        key={index}
                        active={page === currentPage}
                        onClick={() => goToPage(page)}
                    >
                        {page}
                    </Pagination.Item>
                ) : (
                    <Pagination.Ellipsis
                        key={`ellipsis-${index}`}
                        disabled
                    />
                ),
            )}

            <Pagination.Next
                // onClick={onNextClick}
                disabled={!data?.next}
                onClick={handleGetNextOperations}
            />
        </Pagination>
    );
};

export default TablePagination;
