/**
 * @fileoverview Create User Input DTO
 */

import { z } from 'zod'

export const CreateUserSchema = z.object({
	fullName: z.string().min(2).max(100),
	locale: z.string().length(5),
	/** External ID linking to external auth provider (e.g., Firebase Auth UID) */
	externalId: z.string().min(1).max(128).optional(),
	/** Custom document ID to use instead of auto-generated one */
	userId: z.string().min(1).max(128).optional(),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>
