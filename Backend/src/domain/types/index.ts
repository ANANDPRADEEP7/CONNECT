/**
 * Domain-level shared TypeScript types.
 * Keep these types small – they must not reference any framework or library.
 */

/** Represents a paginated result from any repository query. */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** Generic id-based lookup type */
export type ID = string;
