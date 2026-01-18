/**
 * @fileoverview Create User Input DTO
 */

import { z } from 'zod'

export const CreateUserSchema = z.object({
	fullName: z.string().min(2).max(100),
	locale: z.string().length(5),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>
