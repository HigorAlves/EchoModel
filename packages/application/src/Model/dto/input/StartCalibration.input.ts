/**
 * @fileoverview Start Calibration Input DTO
 */

import { z } from 'zod'

export const StartCalibrationSchema = z.object({
	modelId: z.string().uuid(),
})

export type StartCalibrationInput = z.infer<typeof StartCalibrationSchema>
