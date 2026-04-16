export interface User {
  email: string;
  fullName: string;
  token: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;  // ? = optional
  isCompleted: boolean;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  userId: string;
}

export const Priority = {
  Low: 1,
  Medium: 2,
  High: 3,
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
}