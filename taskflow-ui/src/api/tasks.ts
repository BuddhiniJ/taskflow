import api from './axios';
import type { Task, CreateTaskRequest } from '../types';

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks');
  return response.data;
};

export const createTask = async (req: CreateTaskRequest): Promise<Task> => {
  const response = await api.post<Task>('/tasks', req);
  return response.data;
};

export const updateTask = async (
  id: number,
  req: Partial<Task>
): Promise<void> => {
  await api.put(`/tasks/${id}`, req);
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};