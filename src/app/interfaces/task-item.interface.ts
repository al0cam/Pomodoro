export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  isCompleted?: boolean;
  createdAt: Date;
  dueAt?: Date;
  estimatedPomodoros?: number;
  completedPomodoros?: number;
  isExpanded?: boolean;
}
