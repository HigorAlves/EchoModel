import { z } from 'zod'
import { LightingPreset } from '../model.enum'
import { ModelValidationError } from '../model.error'

/**
 * @fileoverview Model Lighting Configuration Value Object
 *
 * Represents the lighting configuration for Seedream 4.5 Fashion generation.
 * Includes preset selection and optional custom settings.
 */

/**
 * Custom lighting settings when using CUSTOM preset
 */
export interface CustomLightingSettings {
	/** Light intensity (0-100) */
	readonly intensity: number
	/** Color temperature warmth (0-100, 50 = neutral) */
	readonly warmth: number
	/** Contrast level (0-100) */
	readonly contrast: number
}

/**
 * Lighting configuration data structure
 */
export interface LightingConfigData {
	readonly preset: LightingPreset
	readonly customSettings?: CustomLightingSettings
}

/**
 * Default lighting configuration
 */
export const DEFAULT_LIGHTING_CONFIG: LightingConfigData = {
	preset: LightingPreset.SOFT_STUDIO,
}

const customLightingSettingsSchema = z.object({
	intensity: z.number().min(0, 'Intensity must be at least 0').max(100, 'Intensity cannot exceed 100'),
	warmth: z.number().min(0, 'Warmth must be at least 0').max(100, 'Warmth cannot exceed 100'),
	contrast: z.number().min(0, 'Contrast must be at least 0').max(100, 'Contrast cannot exceed 100'),
})

const lightingConfigSchema = z
	.object({
		preset: z.nativeEnum(LightingPreset),
		customSettings: customLightingSettingsSchema.optional(),
	})
	.refine(
		(data) => {
			// If preset is CUSTOM, customSettings must be provided
			if (data.preset === LightingPreset.CUSTOM) {
				return data.customSettings !== undefined
			}
			return true
		},
		{ message: 'Custom lighting settings are required when using CUSTOM preset' },
	)

export class ModelLightingConfig {
	private constructor(private readonly data: LightingConfigData) {}

	/**
	 * Factory method to create a ModelLightingConfig
	 * @param data - The lighting configuration data to validate and wrap
	 * @returns New ModelLightingConfig instance
	 * @throws ModelValidationError if the configuration is invalid
	 */
	static create(data: LightingConfigData): ModelLightingConfig {
		const result = lightingConfigSchema.safeParse(data)
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message)
			throw new ModelValidationError(errors, { field: 'lightingConfig', value: data })
		}

		return new ModelLightingConfig(result.data)
	}

	/**
	 * Create default lighting configuration (SOFT_STUDIO)
	 */
	static createDefault(): ModelLightingConfig {
		return new ModelLightingConfig(DEFAULT_LIGHTING_CONFIG)
	}

	/**
	 * Create from preset without custom settings
	 */
	static fromPreset(preset: LightingPreset): ModelLightingConfig {
		if (preset === LightingPreset.CUSTOM) {
			throw new ModelValidationError(['Custom preset requires customSettings'], { field: 'lightingConfig', preset })
		}
		return new ModelLightingConfig({ preset })
	}

	get value(): LightingConfigData {
		return this.data
	}

	get preset(): LightingPreset {
		return this.data.preset
	}

	get customSettings(): CustomLightingSettings | undefined {
		return this.data.customSettings
	}

	get isCustom(): boolean {
		return this.data.preset === LightingPreset.CUSTOM
	}

	/**
	 * Create new config with different preset
	 */
	withPreset(preset: LightingPreset, customSettings?: CustomLightingSettings): ModelLightingConfig {
		return ModelLightingConfig.create({
			preset,
			customSettings: preset === LightingPreset.CUSTOM ? customSettings : undefined,
		})
	}

	equals(other: ModelLightingConfig): boolean {
		if (this.data.preset !== other.data.preset) {
			return false
		}
		if (this.data.customSettings && other.data.customSettings) {
			return (
				this.data.customSettings.intensity === other.data.customSettings.intensity &&
				this.data.customSettings.warmth === other.data.customSettings.warmth &&
				this.data.customSettings.contrast === other.data.customSettings.contrast
			)
		}
		return this.data.customSettings === other.data.customSettings
	}

	toString(): string {
		if (this.isCustom && this.data.customSettings) {
			const { intensity, warmth, contrast } = this.data.customSettings
			return `Custom(intensity: ${intensity}, warmth: ${warmth}, contrast: ${contrast})`
		}
		return this.data.preset
	}

	toJSON(): LightingConfigData {
		return this.data
	}
}
