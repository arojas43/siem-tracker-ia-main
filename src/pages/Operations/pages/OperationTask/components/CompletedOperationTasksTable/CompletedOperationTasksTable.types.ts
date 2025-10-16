// todo fix this as it is repeat
import type { Task, TaskActionType } from '@store/api/api.types';

export type TaskInfo = {
    taskId: number;
    taskActionType: TaskActionType;
    taskActionRequirements: any;
};

export interface CompletedOperationTasksTableProps {
    showTable?: boolean;
    tasks: Task[];
    isLoading: boolean;
    onAction: (taskInfo: TaskInfo) => void;
}
