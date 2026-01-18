/**
 * @fileoverview Approve Calibration Input DTO
 */

import { z } from 'zod'

export const ApproveCalibrationSchema = z.object({
	modelId: z.string().uuid(),
	selectedCalibrationImageIds: z.array(z.string().uuid()).min(1).max(4),
})

export type ApproveCalibrationInput = z.infer<typeof ApproveCalibrationSchema>
