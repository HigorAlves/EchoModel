/**
 * @fileoverview Model Form Zod Schemas
 *
 * Comprehensive validation schemas for the Create Model wizard.
 */

import { z } from 'zod'

// ============================================================================
// Enum Schemas
// ============================================================================

export const GenderSchema = z.enum(['MALE', 'FEMALE', 'NON_BINARY'])
export const AgeRangeSchema = z.enum(['YOUNG_ADULT', 'ADULT', 'MIDDLE_AGED', 'MATURE'])
export const EthnicitySchema = z.enum([
	'ASIAN',
	'BLACK',
	'CAUCASIAN',
	'HISPANIC',
	'MIDDLE_EASTERN',
	'MIXED',
	'SOUTH_ASIAN',
])
export const BodyTypeSchema = z.enum(['SLIM', 'ATHLETIC', 'AVERAGE', 'CURVY', 'PLUS_SIZE'])

export const LightingPresetSchema = z.enum([
	'SOFT_STUDIO',
	'EDITORIAL_CONTRAST',
	'NATURAL_DAYLIGHT',
	'RING_LIGHT',
	'GOLDEN_HOUR',
	'DRAMATIC_SHADOW',
	'BUTTERFLY',
	'REMBRANDT',
	'CUSTOM',
])

export const CameraFramingSchema = z.enum([
	'WAIST_UP_50MM',
	'FULL_BODY_35MM',
	'PORTRAIT_85MM',
	'CLOSE_UP',
	'THREE_QUARTER',
	'BACK_VIEW',
	'KNEE_UP',
	'CUSTOM',
])

export const BackgroundTypeSchema = z.enum([
	'STUDIO_WHITE',
	'STUDIO_GRAY',
	'GRADIENT',
	'OUTDOOR_URBAN',
	'OUTDOOR_NATURE',
	'TRANSPARENT',
])

export const PoseStyleSchema = z.enum(['STATIC_FRONT', 'STATIC_SIDE', 'WALKING', 'EDITORIAL', 'CASUAL', 'DYNAMIC'])

export const ExpressionSchema = z.enum(['NEUTRAL', 'SMILE', 'SERIOUS', 'CONFIDENT', 'SOFT'])

export const PostProcessingStyleSchema = z.enum(['NATURAL', 'VIBRANT', 'MUTED', 'HIGH_CONTRAST', 'WARM', 'COOL'])

export const ProductCategorySchema = z.enum([
	'TOPS',
	'BOTTOMS',
	'DRESSES',
	'OUTERWEAR',
	'ACCESSORIES',
	'FOOTWEAR',
	'SWIMWEAR',
	'ACTIVEWEAR',
	'FORMAL',
	'JEWELRY',
])

// ============================================================================
// Step Schemas
// ============================================================================

/**
 * Step 1: Basic Information Schema
 */
export const BasicInfoSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
	description: z.string().max(500, 'Description must be less than 500 characters').optional(),
})

/**
 * Step 2: Appearance Schema
 */
export const AppearanceSchema = z.object({
	gender: GenderSchema,
	ageRange: AgeRangeSchema,
	ethnicity: EthnicitySchema,
	bodyType: BodyTypeSchema,
	prompt: z.string().max(1000, 'Prompt must be less than 1000 characters').optional(),
})

/**
 * Step 3: Fashion Configuration Schema
 */
export const FashionConfigSchema = z.object({
	lightingPreset: LightingPresetSchema.default('SOFT_STUDIO'),
	cameraFraming: CameraFramingSchema.default('WAIST_UP_50MM'),
	backgroundType: BackgroundTypeSchema.default('STUDIO_WHITE'),
	poseStyle: PoseStyleSchema.default('STATIC_FRONT'),
	expression: ExpressionSchema.default('NEUTRAL'),
	postProcessingStyle: PostProcessingStyleSchema.default('NATURAL'),
	texturePreferences: z.array(z.string().min(1).max(50)).max(5, 'Maximum 5 texture preferences'),
	productCategories: z.array(ProductCategorySchema).min(1, 'Select at least 1 category').max(3, 'Maximum 3 categories'),
	supportOutfitSwapping: z.boolean().default(true),
})

/**
 * Step 4: Reference Images Schema
 */
export const ReferenceImagesSchema = z.object({
	referenceImages: z
		.array(
			z.object({
				id: z.string(),
				file: z.instanceof(File).optional(),
				preview: z.string(),
				name: z.string(),
				size: z.number(),
				uploadProgress: z.number().min(0).max(100).optional(),
				assetId: z.string().optional(),
				storagePath: z.string().optional(),
			}),
		)
		.max(5, 'Maximum 5 reference images'),
})

// ============================================================================
// Complete Form Schema
// ============================================================================

export const CreateModelFormSchema = z.object({
	// Step 1: Basic Info
	name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
	description: z.string().max(500, 'Description must be less than 500 characters').optional(),

	// Step 2: Appearance
	gender: GenderSchema,
	ageRange: AgeRangeSchema,
	ethnicity: EthnicitySchema,
	bodyType: BodyTypeSchema,
	prompt: z.string().max(1000, 'Prompt must be less than 1000 characters').optional(),

	// Step 3: Fashion Configuration
	lightingPreset: LightingPresetSchema,
	cameraFraming: CameraFramingSchema,
	backgroundType: BackgroundTypeSchema,
	poseStyle: PoseStyleSchema,
	expression: ExpressionSchema,
	postProcessingStyle: PostProcessingStyleSchema,
	texturePreferences: z.array(z.string().min(1).max(50)).max(5),
	productCategories: z.array(ProductCategorySchema).min(1).max(3),
	supportOutfitSwapping: z.boolean(),

	// Step 4: Reference Images
	referenceImages: z
		.array(
			z.object({
				id: z.string(),
				file: z.instanceof(File).optional(),
				preview: z.string(),
				name: z.string(),
				size: z.number(),
				uploadProgress: z.number().min(0).max(100).optional(),
				assetId: z.string().optional(),
				storagePath: z.string().optional(),
			}),
		)
		.max(5),
})

// ============================================================================
// Type Exports
// ============================================================================

export type Gender = z.infer<typeof GenderSchema>
export type AgeRange = z.infer<typeof AgeRangeSchema>
export type Ethnicity = z.infer<typeof EthnicitySchema>
export type BodyType = z.infer<typeof BodyTypeSchema>
export type LightingPreset = z.infer<typeof LightingPresetSchema>
export type CameraFraming = z.infer<typeof CameraFramingSchema>
export type BackgroundType = z.infer<typeof BackgroundTypeSchema>
export type PoseStyle = z.infer<typeof PoseStyleSchema>
export type Expression = z.infer<typeof ExpressionSchema>
export type PostProcessingStyle = z.infer<typeof PostProcessingStyleSchema>
export type ProductCategory = z.infer<typeof ProductCategorySchema>

export type BasicInfo = z.infer<typeof BasicInfoSchema>
export type Appearance = z.infer<typeof AppearanceSchema>
export type FashionConfig = z.infer<typeof FashionConfigSchema>
export type ReferenceImages = z.infer<typeof ReferenceImagesSchema>
export type CreateModelFormData = z.infer<typeof CreateModelFormSchema>

// ============================================================================
// Default Values
// ============================================================================

export const defaultFormValues: CreateModelFormData = {
	// Step 1: Basic Info
	name: '',
	description: '',

	// Step 2: Appearance
	gender: 'FEMALE',
	ageRange: 'ADULT',
	ethnicity: 'CAUCASIAN',
	bodyType: 'AVERAGE',
	prompt: '',

	// Step 3: Fashion Configuration
	lightingPreset: 'SOFT_STUDIO',
	cameraFraming: 'WAIST_UP_50MM',
	backgroundType: 'STUDIO_WHITE',
	poseStyle: 'STATIC_FRONT',
	expression: 'NEUTRAL',
	postProcessingStyle: 'NATURAL',
	texturePreferences: [],
	productCategories: [],
	supportOutfitSwapping: true,

	// Step 4: Reference Images
	referenceImages: [],
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateStep(step: number, data: Partial<CreateModelFormData>): boolean {
	try {
		switch (step) {
			case 1:
				BasicInfoSchema.parse({ name: data.name, description: data.description })
				return true
			case 2:
				AppearanceSchema.parse({
					gender: data.gender,
					ageRange: data.ageRange,
					ethnicity: data.ethnicity,
					bodyType: data.bodyType,
					prompt: data.prompt,
				})
				return true
			case 3:
				FashionConfigSchema.parse({
					lightingPreset: data.lightingPreset,
					cameraFraming: data.cameraFraming,
					backgroundType: data.backgroundType,
					poseStyle: data.poseStyle,
					expression: data.expression,
					postProcessingStyle: data.postProcessingStyle,
					texturePreferences: data.texturePreferences,
					productCategories: data.productCategories,
					supportOutfitSwapping: data.supportOutfitSwapping,
				})
				return true
			case 4:
				ReferenceImagesSchema.parse({ referenceImages: data.referenceImages })
				return true
			case 5:
				return true // Review step, no validation needed
			default:
				return false
		}
	} catch {
		return false
	}
}

export function getStepErrors(step: number, data: Partial<CreateModelFormData>): Record<string, string[]> {
	try {
		switch (step) {
			case 1:
				BasicInfoSchema.parse({ name: data.name, description: data.description })
				break
			case 2:
				AppearanceSchema.parse({
					gender: data.gender,
					ageRange: data.ageRange,
					ethnicity: data.ethnicity,
					bodyType: data.bodyType,
					prompt: data.prompt,
				})
				break
			case 3:
				FashionConfigSchema.parse({
					lightingPreset: data.lightingPreset,
					cameraFraming: data.cameraFraming,
					backgroundType: data.backgroundType,
					poseStyle: data.poseStyle,
					expression: data.expression,
					postProcessingStyle: data.postProcessingStyle,
					texturePreferences: data.texturePreferences,
					productCategories: data.productCategories,
					supportOutfitSwapping: data.supportOutfitSwapping,
				})
				break
			case 4:
				ReferenceImagesSchema.parse({ referenceImages: data.referenceImages })
				break
		}
		return {}
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors: Record<string, string[]> = {}
			for (const issue of error.issues) {
				const path = issue.path.join('.')
				if (!errors[path]) {
					errors[path] = []
				}
				errors[path].push(issue.message)
			}
			return errors
		}
		return {}
	}
}
