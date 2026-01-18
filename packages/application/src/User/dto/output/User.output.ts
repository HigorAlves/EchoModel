/**
 * @fileoverview User Response DTO
 */

export interface UserOutput {
	readonly id: string
	readonly fullName: string
	readonly locale: string
	readonly status: string
	readonly createdAt: Date
	readonly updatedAt: Date
}

export interface CreateUserResponse {
	readonly userId: string
}

export interface UpdateUserResponse {
	readonly userId: string
	readonly updated: boolean
}

export interface DeleteUserResponse {
	readonly userId: string
	readonly deleted: boolean
}
