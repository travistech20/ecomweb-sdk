export interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  [key: string]: any;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface IHttpClient {
  get<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  post<T>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>>;
  put<T>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>>;
  patch<T>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>>;
  delete<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
}
