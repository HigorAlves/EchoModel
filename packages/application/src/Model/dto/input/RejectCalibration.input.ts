/**
 * @fileoverview Reject Calibration Input DTO
 */

import { z } from 'zod'

export const RejectCalibrationSchema = z.object({
	modelId: z.string().uuid(),
	reason: z.string().min(1).max(500),
})

export type RejectCalibrationInput = z.infer<typeof RejectCalibrationSchema>
