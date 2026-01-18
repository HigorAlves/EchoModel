// Matches DTOs from @foundry/application User bounded context
export interface User {
	id: string
	fullName: string
	locale: string
	createdAt: string
	updatedAt: string
}

export interface CreateUserInput {
	fullName: string
	locale: string
}

export interface UpdateUserInput {
	fullName?: string
	locale?: string
}
