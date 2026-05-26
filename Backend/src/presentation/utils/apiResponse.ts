export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export function createApiResponse<T>(
  statusCode: number,
  message: string,
  data?: T,
  error?: string,
): ApiResponse<T> {
  return {
    statusCode,
    message,
    data,
    error,
  };
}
