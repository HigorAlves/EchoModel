/**
 * @fileoverview Pagination Types
 *
 * Standardized pagination wrapper for queries.
 */

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
	readonly items: T[]
	readonly total: number
	readonly page: number
	readonly limit: number
	readonly totalPages: number
	readonly hasNextPage: boolean
	readonly hasPreviousPage: boolean
}

/**
 * Pagination input parameters
 */
export interface PaginationInput {
	readonly page?: number
	readonly limit?: number
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(total: number, page: number, limit: number) {
	const totalPages = Math.ceil(total / limit)
	return {
		total,
		page,
		limit,
		totalPages,
		hasNextPage: page * limit < total,
		hasPreviousPage: page > 1,
	}
}
