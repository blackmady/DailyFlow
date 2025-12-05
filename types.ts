export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export const DEFAULT_DEVICES = ['手机', '电脑', '平板', '其他'];

export interface Task {
  id: string;
  name: string;
  description: string;
  checkInTime: string; // HH:mm format
  device: string;
  appOrUrl: string;
  status: TaskStatus;
  createdAt: number;
}

export interface TaskSuggestion {
  name: string;
  description: string;
  checkInTime: string;
  device: string;
  appOrUrl: string;
}
