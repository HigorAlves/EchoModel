/**
 * @fileoverview Update User Input DTO
 */

import { z } from 'zod'

/**
 * Schema for validating the request body of update user endpoint.
 * Note: userId comes from URL param, not body, so it's not required here.
 * Status is also optional and can be ACTIVE, INACTIVE, or SUSPENDED.
 */
export const UpdateUserSchema = z.object({
	fullName: z.string().min(2).max(100).optional(),
	locale: z.string().length(5).optional(),
	status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
})

export type UpdateUseInput = z.infer<typeof UpdateUserSchema>
