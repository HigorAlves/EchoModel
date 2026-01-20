import { z } from 'zod'
import { CameraFraming } from '../model.enum'
import { ModelValidationError } from '../model.error'

/**
 * @fileoverview Model Camera Configuration Value Object
 *
 * Represents the camera configuration for Seedream 4.5 Fashion generation.
 * Includes framing preset selection and optional custom settings.
 */

/**
 * Custom camera settings when using CUSTOM framing
 */
export interface CustomCameraSettings {
	/** Focal length in mm (24-200) */
	readonly focalLength: number
	/** Crop ratio as string (e.g., "3:4", "16:9") */
	readonly cropRatio: string
	/** Camera angle (e.g., "straight-on", "3/4 view", "profile") */
	readonly angle: string
}

/**
 * Camera configuration data structure
 */
export interface CameraConfigData {
	readonly framing: CameraFraming
	readonly customSettings?: CustomCameraSettings
}

/**
 * Default camera configuration
 */
export const DEFAULT_CAMERA_CONFIG: CameraConfigData = {
	framing: CameraFraming.WAIST_UP_50MM,
}

const cropRatioPattern = /^\d+:\d+$/

const customCameraSettingsSchema = z.object({
	focalLength: z.number().min(24, 'Focal length must be at least 24mm').max(200, 'Focal length cannot exceed 200mm'),
	cropRatio: z.string().regex(cropRatioPattern, 'Crop ratio must be in format "X:Y" (e.g., "3:4", "16:9")'),
	angle: z
		.string()
		.min(1, 'Camera angle is required')
		.max(50, 'Camera angle cannot exceed 50 characters')
		.refine((val) => val.trim().length > 0, 'Camera angle cannot be empty'),
})

const cameraConfigSchema = z
	.object({
		framing: z.nativeEnum(CameraFraming),
		customSettings: customCameraSettingsSchema.optional(),
	})
	.refine(
		(data) => {
			// If framing is CUSTOM, customSettings must be provided
			if (data.framing === CameraFraming.CUSTOM) {
				return data.customSettings !== undefined
			}
			return true
		},
		{ message: 'Custom camera settings are required when using CUSTOM framing' },
	)

export class ModelCameraConfig {
	private constructor(private readonly data: CameraConfigData) {}

	/**
	 * Factory method to create a ModelCameraConfig
	 * @param data - The camera configuration data to validate and wrap
	 * @returns New ModelCameraConfig instance
	 * @throws ModelValidationError if the configuration is invalid
	 */
	static create(data: CameraConfigData): ModelCameraConfig {
		const result = cameraConfigSchema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new ModelValidationError(errors, { field: 'cameraConfig', value: data })
		}

		return new ModelCameraConfig(result.data)
	}

	/**
	 * Create default camera configuration (WAIST_UP_50MM)
	 */
	static createDefault(): ModelCameraConfig {
		return new ModelCameraConfig(DEFAULT_CAMERA_CONFIG)
	}

	/**
	 * Create from framing preset without custom settings
	 */
	static fromFraming(framing: CameraFraming): ModelCameraConfig {
		if (framing === CameraFraming.CUSTOM) {
			throw new ModelValidationError(['Custom framing requires customSettings'], { field: 'cameraConfig', framing })
		}
		return new ModelCameraConfig({ framing })
	}

	get value(): CameraConfigData {
		return this.data
	}

	get framing(): CameraFraming {
		return this.data.framing
	}

	get customSettings(): CustomCameraSettings | undefined {
		return this.data.customSettings
	}

	get isCustom(): boolean {
		return this.data.framing === CameraFraming.CUSTOM
	}

	/**
	 * Get the effective focal length for this configuration
	 */
	get effectiveFocalLength(): number {
		if (this.data.customSettings) {
			return this.data.customSettings.focalLength
		}
		switch (this.data.framing) {
			case CameraFraming.WAIST_UP_50MM:
				return 50
			case CameraFraming.FULL_BODY_35MM:
				return 35
			case CameraFraming.PORTRAIT_85MM:
				return 85
			default:
				return 50
		}
	}

	/**
	 * Create new config with different framing
	 */
	withFraming(framing: CameraFraming, customSettings?: CustomCameraSettings): ModelCameraConfig {
		return ModelCameraConfig.create({
			framing,
			customSettings: framing === CameraFraming.CUSTOM ? customSettings : undefined,
		})
	}

	equals(other: ModelCameraConfig): boolean {
		if (this.data.framing !== other.data.framing) {
			return false
		}
		if (this.data.customSettings && other.data.customSettings) {
			return (
				this.data.customSettings.focalLength === other.data.customSettings.focalLength &&
				this.data.customSettings.cropRatio === other.data.customSettings.cropRatio &&
				this.data.customSettings.angle === other.data.customSettings.angle
			)
		}
		return this.data.customSettings === other.data.customSettings
	}

	toString(): string {
		if (this.isCustom && this.data.customSettings) {
			const { focalLength, cropRatio, angle } = this.data.customSettings
			return `Custom(${focalLength}mm, ${cropRatio}, ${angle})`
		}
		return this.data.framing
	}

	toJSON(): CameraConfigData {
		return this.data
	}
}
