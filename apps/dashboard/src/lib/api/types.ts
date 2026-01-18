// Matches the Lambda API response format from @foundry/lambda
export interface ApiResponse<T> {
	success: boolean
	data: T
	correlationId: string
	timestamp: string
}

export interface ApiErrorResponse {
	success: false
	error: {
		name: string
		message: string
		meta?: Record<string, unknown>
	}
	correlationId: string
	timestamp: string
}

export interface PaginatedResponse<T> {
	success: true
	data: T[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNextPage: boolean
		hasPreviousPage: boolean
	}
	correlationId: string
	timestamp: string
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse
