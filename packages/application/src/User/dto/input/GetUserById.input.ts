/**
 * @fileoverview Get User By ID Input DTO
 */

import { z } from 'zod'

export const GetUserByIdSchema = z.object({
	userId: z.string().uuid(),
})

export type GetUserByIdInput = z.infer<typeof GetUserByIdSchema>
