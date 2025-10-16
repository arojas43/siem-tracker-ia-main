import type { Task, TaskActionType } from '@store/api/api.types';
import type { TaskActionRequirements } from '../TaskActionsComponents/TaskActionsComponents.types';

export type TaskInfo = {
    taskId: number;
    taskActionType: TaskActionType;
    taskActionRequirements: TaskActionRequirements;
};

export interface IncompletedOperationTasksTableProps {
    showTable?: boolean;
    tasks: Task[];
    isLoading: boolean;
    // todo add type
    onAction: (taskInfo: TaskInfo) => void;
}
