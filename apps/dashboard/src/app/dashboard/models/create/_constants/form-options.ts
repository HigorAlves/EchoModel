/**
 * @fileoverview Form Options Constants
 *
 * Comprehensive configuration options for the Create Model wizard.
 * Includes expanded options for Fashion Configuration.
 */

import type {
	BackgroundType,
	CameraFraming,
	Expression,
	LightingPreset,
	PoseStyle,
	PostProcessingStyle,
	ProductCategory,
} from '@/lib/firebase'

// ============================================================================
// Lighting Presets (expanded from 3 to 8)
// ============================================================================

export interface LightingPresetOption {
	value: LightingPreset
	label: string
	description: string
	icon?: string
}

export const LIGHTING_PRESETS: LightingPresetOption[] = [
	{ value: 'SOFT_STUDIO', label: 'Soft Studio', description: 'Even, flattering light ideal for e-commerce' },
	{
		value: 'EDITORIAL_CONTRAST',
		label: 'Editorial Contrast',
		description: 'High contrast for dramatic fashion shots',
	},
	{ value: 'NATURAL_DAYLIGHT', label: 'Natural Daylight', description: 'Outdoor look with soft shadows' },
	{ value: 'RING_LIGHT', label: 'Ring Light', description: 'Even front lighting, popular for beauty' },
	{ value: 'GOLDEN_HOUR', label: 'Golden Hour', description: 'Warm sunset-like glow' },
	{ value: 'DRAMATIC_SHADOW', label: 'Dramatic Shadow', description: 'Strong directional light with deep shadows' },
	{ value: 'BUTTERFLY', label: 'Butterfly', description: 'Classic portrait lighting from above' },
	{ value: 'REMBRANDT', label: 'Rembrandt', description: 'Artistic side lighting with triangle highlight' },
]

// ============================================================================
// Camera Framings (expanded from 3 to 7)
// ============================================================================

export interface CameraFramingOption {
	value: CameraFraming
	label: string
	description: string
}

export const CAMERA_FRAMINGS: CameraFramingOption[] = [
	{ value: 'WAIST_UP_50MM', label: 'Waist Up (50mm)', description: 'Classic portrait framing for tops' },
	{ value: 'FULL_BODY_35MM', label: 'Full Body (35mm)', description: 'Complete outfit view' },
	{ value: 'PORTRAIT_85MM', label: 'Portrait (85mm)', description: 'Close-up with beautiful bokeh' },
	{ value: 'CLOSE_UP', label: 'Close Up', description: 'Face and upper chest detail' },
	{ value: 'THREE_QUARTER', label: '3/4 View', description: 'Angled perspective showing depth' },
	{ value: 'BACK_VIEW', label: 'Back View', description: 'Rear angle for back details' },
	{ value: 'KNEE_UP', label: 'Knee Up', description: 'Mid-length framing for dresses' },
]

// ============================================================================
// Background/Backdrop Options (NEW)
// ============================================================================

export interface BackgroundOption {
	value: BackgroundType
	label: string
	description: string
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
	{ value: 'STUDIO_WHITE', label: 'Studio White', description: 'Clean white seamless background' },
	{ value: 'STUDIO_GRAY', label: 'Studio Gray', description: 'Neutral gray backdrop' },
	{ value: 'GRADIENT', label: 'Gradient', description: 'Soft gradient transitions' },
	{ value: 'OUTDOOR_URBAN', label: 'Urban Outdoor', description: 'City streets and architecture' },
	{ value: 'OUTDOOR_NATURE', label: 'Natural Outdoor', description: 'Parks, gardens, landscapes' },
	{ value: 'TRANSPARENT', label: 'Transparent', description: 'PNG with alpha channel' },
]

// ============================================================================
// Pose Style Options (NEW)
// ============================================================================

export interface PoseStyleOption {
	value: PoseStyle
	label: string
	description: string
}

export const POSE_STYLES: PoseStyleOption[] = [
	{ value: 'STATIC_FRONT', label: 'Static Front', description: 'Standard front-facing pose' },
	{ value: 'STATIC_SIDE', label: 'Static Side', description: 'Profile or 3/4 angle' },
	{ value: 'WALKING', label: 'Walking', description: 'Natural walking motion' },
	{ value: 'EDITORIAL', label: 'Editorial', description: 'High-fashion artistic poses' },
	{ value: 'CASUAL', label: 'Casual', description: 'Relaxed, everyday poses' },
	{ value: 'DYNAMIC', label: 'Dynamic', description: 'Movement and action poses' },
]

// ============================================================================
// Model Expression Options (NEW)
// ============================================================================

export interface ExpressionOption {
	value: Expression
	label: string
	description: string
}

export const EXPRESSION_OPTIONS: ExpressionOption[] = [
	{ value: 'NEUTRAL', label: 'Neutral', description: 'Relaxed, natural expression' },
	{ value: 'SMILE', label: 'Smile', description: 'Warm, approachable smile' },
	{ value: 'SERIOUS', label: 'Serious', description: 'Professional, focused look' },
	{ value: 'CONFIDENT', label: 'Confident', description: 'Strong, assured expression' },
	{ value: 'SOFT', label: 'Soft', description: 'Gentle, approachable demeanor' },
]

// ============================================================================
// Post-Processing Style Options (NEW)
// ============================================================================

export interface PostProcessingOption {
	value: PostProcessingStyle
	label: string
	description: string
}

export const POST_PROCESSING_STYLES: PostProcessingOption[] = [
	{ value: 'NATURAL', label: 'Natural', description: 'Minimal editing, true to life' },
	{ value: 'VIBRANT', label: 'Vibrant', description: 'Enhanced colors and saturation' },
	{ value: 'MUTED', label: 'Muted', description: 'Soft, desaturated tones' },
	{ value: 'HIGH_CONTRAST', label: 'High Contrast', description: 'Bold blacks and whites' },
	{ value: 'WARM', label: 'Warm', description: 'Golden, warm color grading' },
	{ value: 'COOL', label: 'Cool', description: 'Blue-toned, modern feel' },
]

// ============================================================================
// Product Categories (expanded from 6 to 10)
// ============================================================================

export interface ProductCategoryOption {
	value: ProductCategory
	label: string
}

export const PRODUCT_CATEGORIES: ProductCategoryOption[] = [
	{ value: 'TOPS', label: 'Tops' },
	{ value: 'BOTTOMS', label: 'Bottoms' },
	{ value: 'DRESSES', label: 'Dresses' },
	{ value: 'OUTERWEAR', label: 'Outerwear' },
	{ value: 'ACCESSORIES', label: 'Accessories' },
	{ value: 'FOOTWEAR', label: 'Footwear' },
	{ value: 'SWIMWEAR', label: 'Swimwear' },
	{ value: 'ACTIVEWEAR', label: 'Activewear' },
	{ value: 'FORMAL', label: 'Formal Wear' },
	{ value: 'JEWELRY', label: 'Jewelry' },
]

// ============================================================================
// Appearance Options
// ============================================================================

export const GENDER_OPTIONS = [
	{ value: 'MALE', label: 'Male' },
	{ value: 'FEMALE', label: 'Female' },
	{ value: 'NON_BINARY', label: 'Non-Binary' },
] as const

export const AGE_RANGE_OPTIONS = [
	{ value: 'YOUNG_ADULT', label: 'Young Adult (18-25)' },
	{ value: 'ADULT', label: 'Adult (26-35)' },
	{ value: 'MIDDLE_AGED', label: 'Middle Aged (36-50)' },
	{ value: 'MATURE', label: 'Mature (50+)' },
] as const

export const BODY_TYPE_OPTIONS = [
	{ value: 'SLIM', label: 'Slim' },
	{ value: 'ATHLETIC', label: 'Athletic' },
	{ value: 'AVERAGE', label: 'Average' },
	{ value: 'CURVY', label: 'Curvy' },
	{ value: 'PLUS_SIZE', label: 'Plus Size' },
] as const

export const ETHNICITY_OPTIONS = [
	{ value: 'ASIAN', label: 'Asian' },
	{ value: 'BLACK', label: 'Black' },
	{ value: 'CAUCASIAN', label: 'Caucasian' },
	{ value: 'HISPANIC', label: 'Hispanic' },
	{ value: 'MIDDLE_EASTERN', label: 'Middle Eastern' },
	{ value: 'MIXED', label: 'Mixed' },
	{ value: 'SOUTH_ASIAN', label: 'South Asian' },
] as const

// ============================================================================
// Step Configuration
// ============================================================================

export const WIZARD_STEPS = [
	{ id: 1, key: 'basicInfo', icon: 'User' },
	{ id: 2, key: 'appearance', icon: 'Palette' },
	{ id: 3, key: 'fashionConfig', icon: 'Settings' },
	{ id: 4, key: 'referenceImages', icon: 'Image' },
	{ id: 5, key: 'review', icon: 'CheckCircle' },
] as const

export type StepId = (typeof WIZARD_STEPS)[number]['id']

// ============================================================================
// File Upload Configuration
// ============================================================================

export const UPLOAD_CONFIG = {
	maxFiles: 5,
	maxFileSize: 10 * 1024 * 1024, // 10MB
	acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
	acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
} as const

// ============================================================================
// Helper Functions
// ============================================================================

export function getLightingPresetByValue(value: LightingPreset): LightingPresetOption | undefined {
	return LIGHTING_PRESETS.find((p) => p.value === value)
}

export function getCameraFramingByValue(value: CameraFraming): CameraFramingOption | undefined {
	return CAMERA_FRAMINGS.find((f) => f.value === value)
}

export function getBackgroundByValue(value: BackgroundType): BackgroundOption | undefined {
	return BACKGROUND_OPTIONS.find((b) => b.value === value)
}

export function getPoseStyleByValue(value: PoseStyle): PoseStyleOption | undefined {
	return POSE_STYLES.find((p) => p.value === value)
}

export function getExpressionByValue(value: Expression): ExpressionOption | undefined {
	return EXPRESSION_OPTIONS.find((e) => e.value === value)
}

export function getPostProcessingByValue(value: PostProcessingStyle): PostProcessingOption | undefined {
	return POST_PROCESSING_STYLES.find((p) => p.value === value)
}

export function getProductCategoryByValue(value: ProductCategory): ProductCategoryOption | undefined {
	return PRODUCT_CATEGORIES.find((c) => c.value === value)
}
