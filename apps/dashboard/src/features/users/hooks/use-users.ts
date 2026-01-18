'use client'

import { useCallback, useState } from 'react'
import type { ApiErrorResponse, PaginatedResponse } from '@/lib/api'
import { ApiError } from '@/lib/api'
import { usersService } from '../services'
import type { CreateUserInput, UpdateUserInput, User } from '../types'

interface UseUsersState {
	users: User[]
	pagination: PaginatedResponse<User>['pagination'] | null
	isLoading: boolean
	error: ApiErrorResponse['error'] | null
}

export function useUsers() {
	const [state, setState] = useState<UseUsersState>({
		users: [],
		pagination: null,
		isLoading: false,
		error: null,
	})

	const fetchUsers = useCallback(async (page = 1, limit = 20) => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }))
		try {
			const response = await usersService.list(page, limit)
			setState({
				users: response.data,
				pagination: response.pagination,
				isLoading: false,
				error: null,
			})
		} catch (err) {
			const error = err instanceof ApiError ? err.errorResponse.error : { name: 'Error', message: 'Unknown error' }
			setState((prev) => ({ ...prev, isLoading: false, error }))
		}
	}, [])

	const createUser = useCallback(async (input: CreateUserInput) => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }))
		try {
			const response = await usersService.create(input)
			setState((prev) => ({
				...prev,
				users: [...prev.users, response.data],
				isLoading: false,
			}))
			return response.data
		} catch (err) {
			const error = err instanceof ApiError ? err.errorResponse.error : { name: 'Error', message: 'Unknown error' }
			setState((prev) => ({ ...prev, isLoading: false, error }))
			throw err
		}
	}, [])

	const updateUser = useCallback(async (id: string, input: UpdateUserInput) => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }))
		try {
			const response = await usersService.update(id, input)
			setState((prev) => ({
				...prev,
				users: prev.users.map((u) => (u.id === id ? response.data : u)),
				isLoading: false,
			}))
			return response.data
		} catch (err) {
			const error = err instanceof ApiError ? err.errorResponse.error : { name: 'Error', message: 'Unknown error' }
			setState((prev) => ({ ...prev, isLoading: false, error }))
			throw err
		}
	}, [])

	const deleteUser = useCallback(async (id: string) => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }))
		try {
			await usersService.delete(id)
			setState((prev) => ({
				...prev,
				users: prev.users.filter((u) => u.id !== id),
				isLoading: false,
			}))
		} catch (err) {
			const error = err instanceof ApiError ? err.errorResponse.error : { name: 'Error', message: 'Unknown error' }
			setState((prev) => ({ ...prev, isLoading: false, error }))
			throw err
		}
	}, [])

	return {
		...state,
		fetchUsers,
		createUser,
		updateUser,
		deleteUser,
	}
}
