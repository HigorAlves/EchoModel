/**
 * @fileoverview Fail Calibration Input DTO
 */

import { z } from 'zod'

export const FailCalibrationSchema = z.object({
	modelId: z.string().uuid(),
	reason: z.string().min(1, 'Failure reason is required').max(1000),
})

export type FailCalibrationInput = z.infer<typeof FailCalibrationSchema>
