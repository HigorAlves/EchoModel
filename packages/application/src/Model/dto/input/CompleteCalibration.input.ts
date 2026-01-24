/**
 * @fileoverview Complete Calibration Input DTO
 */

import { z } from 'zod'

export const CompleteCalibrationSchema = z.object({
	modelId: z.string().uuid(),
	calibrationImageIds: z.array(z.string().uuid()).min(1, 'At least one calibration image is required'),
})

export type CompleteCalibrationInput = z.infer<typeof CompleteCalibrationSchema>
