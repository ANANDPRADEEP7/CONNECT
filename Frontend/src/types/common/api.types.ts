/**
 * Standard envelope returned by the Axios interceptor after unwrapping and merging.
 * If T is an object, the properties of T are merged with message, statusCode, etc.
 * If T is an array or primitive, it is represented accordingly.
 */
export type ApiResponse<T = void> = (T extends void ? unknown : T) & {
  message: string;
  statusCode?: number;
  error?: unknown;
};
