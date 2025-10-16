import { usePageHeader } from '@hooks/context/AppContext/AppContext';
import { useEffect, type FC } from 'react';
import classes from './TasksPage.module.scss';
import TasksWidgetCard from './components/TasksWidgetCard';
import TasksTable from './components/TasksTable';
import FloatingChatButton from '@components/FloatingChatButton';

const TasksPage: FC = () => {
    const { setHeaderTitle } = usePageHeader();

    useEffect(() => {
        setHeaderTitle('Tareas');
    }, []);

    return (
        <div className="tracker-page-container tracker-page-container__card">
            <div className={classes['tasks-page__container']}>
                <div className={classes['tasks-page__top']}>
                    <TasksWidgetCard />
                </div>
                <div className={classes['tasks-page__bottom']}>{<TasksTable />}</div>
            </div>
            
            {/* Botón flotante de chat */}
            <FloatingChatButton />
        </div>
    );
};

export default TasksPage;
