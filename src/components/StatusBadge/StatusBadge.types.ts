export type StatusBadgeStatus = 'success' | 'error' | 'warning';
export interface StatusBadgeProps {
    text: string;
    status: StatusBadgeStatus;
}
