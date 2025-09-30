/**
 * Pagination options for provider methods
 * Shared interface for consistent pagination across all providers
 */
export interface PaginationOptions {
  /** Page number (1-based) */
  page?: number
  
  /** Items per page limit */
  limit?: number
}