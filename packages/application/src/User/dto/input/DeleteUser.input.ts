/**
 * @fileoverview Delete User Input DTO
 */

import { z } from 'zod'

export const DeleteUserSchema = z.object({
	userId: z.string().uuid(),
})

export type DeleteUserInput = z.infer<typeof DeleteUserSchema>
