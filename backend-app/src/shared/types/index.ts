export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface HealthStatus {
  status: 'OK' | 'ERROR';
  message: string;
  timestamp: string;
}
