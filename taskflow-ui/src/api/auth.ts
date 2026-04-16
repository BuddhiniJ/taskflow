import api from './axios';
import type { AuthResponse } from '../types';

export const register = async (
  fullName: string,
  email: string,
  password: string
): Promise<void> => {
  await api.post('/auth/register', { fullName, email, password });
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
};