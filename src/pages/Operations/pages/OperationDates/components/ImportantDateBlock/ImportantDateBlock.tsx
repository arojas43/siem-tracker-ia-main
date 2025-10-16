import Table from 'react-bootstrap/esm/Table';
import classes from './ImportantDateBlock.module.scss';
import type { FC} from 'react';
import { useMemo } from 'react';
import type { ImportantDateBlockProps } from './ImportantDatesBlock.types';
import type { ImportantDates } from '../../OperationDates.types';

const ImportantDateBlock: FC<ImportantDateBlockProps> = ({ title, dates }) => {
    const renderDatesMemo = useMemo(() => {
        console.log('dates', dates);
        if (!dates || !dates.length) {
            return (
                <tr>
                    <td
                        colSpan={3}
                        className="text-center"
                    >
                        No hay fechas.
                    </td>
                </tr>
            );
        }

        return dates.map((date: ImportantDates, index: number) => (
            <tr
                key={index}
                className={date.highlighted ? classes.highlight : ''}
            >
                <td>{date.task_name || '-'}</td>
                <td>{date.date_name || '-'}</td>
                <td>{date.date || '-'}</td>
            </tr>
        ));
    }, [dates]);

    return (
        <div className={classes['important-dates-block']}>
            <h5>{title}</h5>
            <Table className={classes['important-dates-table']}>
                <thead>
                    <tr>
                        <th>Nombre Tarea</th>
                        <th>Nombre fecha</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>{renderDatesMemo}</tbody>
            </Table>
        </div>
    );
};

export default ImportantDateBlock;
