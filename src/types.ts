export enum TaskStatus {
  TODO = 'todo',
  COMPLETED = 'completed',
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Task {
  id: string;
  name: string;
  subjectId: string;
  status: TaskStatus;
  points: number;
  createdAt: string;
  completedAt?: string;
}

export interface UserProfile {
  name: string;
  title: string;
  points: number;
  level: number;
}

export type View = 'home' | 'calendar' | 'subjects' | 'timer';
