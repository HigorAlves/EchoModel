import type { ApiErrorResponse, ApiResponse, PaginatedResponse } from './types'

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		public readonly errorResponse: ApiErrorResponse,
	) {
		super(errorResponse.error.message)
		this.name = errorResponse.error.name
	}
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
	body?: unknown
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
	const { body, headers, ...rest } = options

	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
		...rest,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		body: body ? JSON.stringify(body) : undefined,
	})

	const data = await response.json()

	if (!response.ok || !data.success) {
		throw new ApiError(response.status, data as ApiErrorResponse)
	}

	return data as T
}

export const api = {
	get: <T>(endpoint: string, options?: RequestOptions) =>
		request<ApiResponse<T>>(endpoint, { ...options, method: 'GET' }),

	post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
		request<ApiResponse<T>>(endpoint, { ...options, method: 'POST', body }),

	put: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
		request<ApiResponse<T>>(endpoint, { ...options, method: 'PUT', body }),

	patch: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
		request<ApiResponse<T>>(endpoint, { ...options, method: 'PATCH', body }),

	delete: <T>(endpoint: string, options?: RequestOptions) =>
		request<ApiResponse<T>>(endpoint, { ...options, method: 'DELETE' }),

	paginated: <T>(endpoint: string, options?: RequestOptions) =>
		request<PaginatedResponse<T>>(endpoint, { ...options, method: 'GET' }),
}
