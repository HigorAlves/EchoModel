import { api } from '@/lib/api'
import type { CreateUserInput, UpdateUserInput, User } from '../types'

const ENDPOINT = '/users'

export const usersService = {
	list: (page = 1, limit = 20) => api.paginated<User>(`${ENDPOINT}?page=${page}&limit=${limit}`),

	getById: (id: string) => api.get<User>(`${ENDPOINT}/${id}`),

	create: (input: CreateUserInput) => api.post<User>(ENDPOINT, input),

	update: (id: string, input: UpdateUserInput) => api.patch<User>(`${ENDPOINT}/${id}`, input),

	delete: (id: string) => api.delete<void>(`${ENDPOINT}/${id}`),
}
