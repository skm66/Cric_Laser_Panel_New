import axiosInstance from '../../utils/api';
import { ApiResponse } from '../../utils';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ODDS' | 'LIVE' | 'COMMENTARY';
}

export const authApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    axiosInstance.post<ApiResponse<string>>('/auth/register', data),
};
