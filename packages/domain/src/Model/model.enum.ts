/**
 * @fileoverview Model Enumerations
 *
 * Enums for the Model (AI Influencer) bounded context.
 */

/**
 * Model Status Enumeration
 *
 * State machine:
 * draft → calibrating → active
 *              ↓
 *           failed → draft (retry)
 * active → archived
 */
export enum ModelStatus {
	/** Initial state, model is being configured */
	DRAFT = 'DRAFT',

	/** Calibration images are being generated */
	CALIBRATING = 'CALIBRATING',

	/** Model is ready for use in generations */
	ACTIVE = 'ACTIVE',

	/** Calibration or processing failed */
	FAILED = 'FAILED',

	/** Model has been archived and cannot be used */
	ARCHIVED = 'ARCHIVED',
}

/**
 * Gender Enumeration
 *
 * Represents the gender presentation of the AI influencer.
 */
export enum Gender {
	FEMALE = 'FEMALE',
	MALE = 'MALE',
	NON_BINARY = 'NON_BINARY',
}

/**
 * Age Range Enumeration
 *
 * Represents the apparent age range of the AI influencer.
 */
export enum AgeRange {
	YOUNG_ADULT = 'YOUNG_ADULT', // 18-25
	ADULT = 'ADULT', // 26-35
	MIDDLE_AGED = 'MIDDLE_AGED', // 36-50
	MATURE = 'MATURE', // 50+
}

/**
 * Ethnicity Enumeration
 *
 * Represents the ethnic appearance of the AI influencer.
 */
export enum Ethnicity {
	ASIAN = 'ASIAN',
	BLACK = 'BLACK',
	CAUCASIAN = 'CAUCASIAN',
	HISPANIC = 'HISPANIC',
	MIDDLE_EASTERN = 'MIDDLE_EASTERN',
	MIXED = 'MIXED',
	SOUTH_ASIAN = 'SOUTH_ASIAN',
}

/**
 * Body Type Enumeration
 *
 * Represents the body type of the AI influencer.
 */
export enum BodyType {
	SLIM = 'SLIM',
	ATHLETIC = 'ATHLETIC',
	AVERAGE = 'AVERAGE',
	CURVY = 'CURVY',
	PLUS_SIZE = 'PLUS_SIZE',
}

/**
 * Utility functions for ModelStatus enum
 */

/**
 * Get all possible status values
 */
export function getAllModelStatuses(): ModelStatus[] {
	return Object.values(ModelStatus)
}

/**
 * Check if a status is valid
 */
export function isValidModelStatus(status: string): status is ModelStatus {
	return Object.values(ModelStatus).includes(status as ModelStatus)
}

/**
 * Get valid transitions from a status
 */
export function getValidModelTransitionsFrom(status: ModelStatus): ModelStatus[] {
	switch (status) {
		case ModelStatus.DRAFT:
			return [ModelStatus.CALIBRATING]
		case ModelStatus.CALIBRATING:
			return [ModelStatus.ACTIVE, ModelStatus.FAILED]
		case ModelStatus.ACTIVE:
			return [ModelStatus.ARCHIVED]
		case ModelStatus.FAILED:
			return [ModelStatus.DRAFT] // Retry
		case ModelStatus.ARCHIVED:
			return [] // Terminal state
		default:
			return []
	}
}

/**
 * Check if a status transition is valid
 */
export function isValidModelTransition(fromStatus: ModelStatus, toStatus: ModelStatus): boolean {
	const validTransitions = getValidModelTransitionsFrom(fromStatus)
	return validTransitions.includes(toStatus)
}

/**
 * Get human-readable label for status
 */
export function getModelStatusLabel(status: ModelStatus): string {
	switch (status) {
		case ModelStatus.DRAFT:
			return 'Draft'
		case ModelStatus.CALIBRATING:
			return 'Calibrating'
		case ModelStatus.ACTIVE:
			return 'Active'
		case ModelStatus.FAILED:
			return 'Failed'
		case ModelStatus.ARCHIVED:
			return 'Archived'
		default:
			return 'Unknown'
	}
}

/**
 * Utility functions for Gender enum
 */

export function getAllGenders(): Gender[] {
	return Object.values(Gender)
}

export function isValidGender(gender: string): gender is Gender {
	return Object.values(Gender).includes(gender as Gender)
}

export function getGenderLabel(gender: Gender): string {
	switch (gender) {
		case Gender.FEMALE:
			return 'Female'
		case Gender.MALE:
			return 'Male'
		case Gender.NON_BINARY:
			return 'Non-Binary'
		default:
			return 'Unknown'
	}
}

/**
 * Utility functions for AgeRange enum
 */

export function getAllAgeRanges(): AgeRange[] {
	return Object.values(AgeRange)
}

export function isValidAgeRange(ageRange: string): ageRange is AgeRange {
	return Object.values(AgeRange).includes(ageRange as AgeRange)
}

export function getAgeRangeLabel(ageRange: AgeRange): string {
	switch (ageRange) {
		case AgeRange.YOUNG_ADULT:
			return 'Young Adult (18-25)'
		case AgeRange.ADULT:
			return 'Adult (26-35)'
		case AgeRange.MIDDLE_AGED:
			return 'Middle Aged (36-50)'
		case AgeRange.MATURE:
			return 'Mature (50+)'
		default:
			return 'Unknown'
	}
}

/**
 * Utility functions for Ethnicity enum
 */

export function getAllEthnicities(): Ethnicity[] {
	return Object.values(Ethnicity)
}

export function isValidEthnicity(ethnicity: string): ethnicity is Ethnicity {
	return Object.values(Ethnicity).includes(ethnicity as Ethnicity)
}

export function getEthnicityLabel(ethnicity: Ethnicity): string {
	switch (ethnicity) {
		case Ethnicity.ASIAN:
			return 'Asian'
		case Ethnicity.BLACK:
			return 'Black'
		case Ethnicity.CAUCASIAN:
			return 'Caucasian'
		case Ethnicity.HISPANIC:
			return 'Hispanic'
		case Ethnicity.MIDDLE_EASTERN:
			return 'Middle Eastern'
		case Ethnicity.MIXED:
			return 'Mixed'
		case Ethnicity.SOUTH_ASIAN:
			return 'South Asian'
		default:
			return 'Unknown'
	}
}

/**
 * Utility functions for BodyType enum
 */

export function getAllBodyTypes(): BodyType[] {
	return Object.values(BodyType)
}

export function isValidBodyType(bodyType: string): bodyType is BodyType {
	return Object.values(BodyType).includes(bodyType as BodyType)
}

export function getBodyTypeLabel(bodyType: BodyType): string {
	switch (bodyType) {
		case BodyType.SLIM:
			return 'Slim'
		case BodyType.ATHLETIC:
			return 'Athletic'
		case BodyType.AVERAGE:
			return 'Average'
		case BodyType.CURVY:
			return 'Curvy'
		case BodyType.PLUS_SIZE:
			return 'Plus Size'
		default:
			return 'Unknown'
	}
}

// ============================================================================
// Seedream 4.5 Fashion Configuration Enums
// ============================================================================

/**
 * Lighting Preset Enumeration (Expanded)
 *
 * Represents lighting configurations for Seedream 4.5 Fashion generation.
 * These presets control the lighting style of generated images.
 */
export enum LightingPreset {
	/** Soft, diffused studio lighting - ideal for most fashion shots */
	SOFT_STUDIO = 'SOFT_STUDIO',

	/** High-contrast editorial lighting - dramatic, magazine-style */
	EDITORIAL_CONTRAST = 'EDITORIAL_CONTRAST',

	/** Natural daylight simulation - outdoor, window-lit appearance */
	NATURAL_DAYLIGHT = 'NATURAL_DAYLIGHT',

	/** Ring light - even front lighting, popular for beauty */
	RING_LIGHT = 'RING_LIGHT',

	/** Golden hour - warm sunset-like glow */
	GOLDEN_HOUR = 'GOLDEN_HOUR',

	/** Dramatic shadow - strong directional light with deep shadows */
	DRAMATIC_SHADOW = 'DRAMATIC_SHADOW',

	/** Butterfly lighting - classic portrait lighting from above */
	BUTTERFLY = 'BUTTERFLY',

	/** Rembrandt lighting - artistic side lighting with triangle highlight */
	REMBRANDT = 'REMBRANDT',

	/** Custom lighting settings defined by user */
	CUSTOM = 'CUSTOM',
}

/**
 * Camera Framing Enumeration (Expanded)
 *
 * Represents standardized camera framing options for consistent shots.
 */
export enum CameraFraming {
	/** Waist-up shot with 50mm lens - classic fashion photography */
	WAIST_UP_50MM = 'WAIST_UP_50MM',

	/** Full body shot with 35mm lens - shows complete outfit */
	FULL_BODY_35MM = 'FULL_BODY_35MM',

	/** Portrait shot with 85mm lens - face and upper body focus */
	PORTRAIT_85MM = 'PORTRAIT_85MM',

	/** Close-up - face and upper chest detail */
	CLOSE_UP = 'CLOSE_UP',

	/** Three-quarter view - angled perspective showing depth */
	THREE_QUARTER = 'THREE_QUARTER',

	/** Back view - rear angle for back details */
	BACK_VIEW = 'BACK_VIEW',

	/** Knee up - mid-length framing for dresses */
	KNEE_UP = 'KNEE_UP',

	/** Custom camera settings defined by user */
	CUSTOM = 'CUSTOM',
}

/**
 * Background Type Enumeration
 *
 * Represents backdrop/background options for generated images.
 */
export enum BackgroundType {
	/** Clean white seamless background */
	STUDIO_WHITE = 'STUDIO_WHITE',

	/** Neutral gray backdrop */
	STUDIO_GRAY = 'STUDIO_GRAY',

	/** Soft gradient transitions */
	GRADIENT = 'GRADIENT',

	/** City streets and architecture */
	OUTDOOR_URBAN = 'OUTDOOR_URBAN',

	/** Parks, gardens, landscapes */
	OUTDOOR_NATURE = 'OUTDOOR_NATURE',

	/** PNG with alpha channel */
	TRANSPARENT = 'TRANSPARENT',
}

/**
 * Pose Style Enumeration
 *
 * Represents pose options for the model.
 */
export enum PoseStyle {
	/** Standard front-facing pose */
	STATIC_FRONT = 'STATIC_FRONT',

	/** Profile or 3/4 angle */
	STATIC_SIDE = 'STATIC_SIDE',

	/** Natural walking motion */
	WALKING = 'WALKING',

	/** High-fashion artistic poses */
	EDITORIAL = 'EDITORIAL',

	/** Relaxed, everyday poses */
	CASUAL = 'CASUAL',

	/** Movement and action poses */
	DYNAMIC = 'DYNAMIC',
}

/**
 * Expression Enumeration
 *
 * Represents facial expression options for the model.
 */
export enum Expression {
	/** Relaxed, natural expression */
	NEUTRAL = 'NEUTRAL',

	/** Warm, approachable smile */
	SMILE = 'SMILE',

	/** Professional, focused look */
	SERIOUS = 'SERIOUS',

	/** Strong, assured expression */
	CONFIDENT = 'CONFIDENT',

	/** Gentle, approachable demeanor */
	SOFT = 'SOFT',
}

/**
 * Post-Processing Style Enumeration
 *
 * Represents color grading and post-processing options.
 */
export enum PostProcessingStyle {
	/** Minimal editing, true to life */
	NATURAL = 'NATURAL',

	/** Enhanced colors and saturation */
	VIBRANT = 'VIBRANT',

	/** Soft, desaturated tones */
	MUTED = 'MUTED',

	/** Bold blacks and whites */
	HIGH_CONTRAST = 'HIGH_CONTRAST',

	/** Golden, warm color grading */
	WARM = 'WARM',

	/** Blue-toned, modern feel */
	COOL = 'COOL',
}

/**
 * Product Category Enumeration (Expanded)
 *
 * Represents the types of products a model specializes in.
 * Models can be optimized for specific product categories.
 */
export enum ProductCategory {
	TOPS = 'TOPS',
	BOTTOMS = 'BOTTOMS',
	DRESSES = 'DRESSES',
	OUTERWEAR = 'OUTERWEAR',
	ACCESSORIES = 'ACCESSORIES',
	FOOTWEAR = 'FOOTWEAR',
	SWIMWEAR = 'SWIMWEAR',
	ACTIVEWEAR = 'ACTIVEWEAR',
	FORMAL = 'FORMAL',
	JEWELRY = 'JEWELRY',
}

/**
 * Utility functions for LightingPreset enum
 */

export function getAllLightingPresets(): LightingPreset[] {
	return Object.values(LightingPreset)
}

export function isValidLightingPreset(preset: string): preset is LightingPreset {
	return Object.values(LightingPreset).includes(preset as LightingPreset)
}

export function getLightingPresetLabel(preset: LightingPreset): string {
	switch (preset) {
		case LightingPreset.SOFT_STUDIO:
			return 'Soft Studio'
		case LightingPreset.EDITORIAL_CONTRAST:
			return 'Editorial Contrast'
		case LightingPreset.NATURAL_DAYLIGHT:
			return 'Natural Daylight'
		case LightingPreset.RING_LIGHT:
			return 'Ring Light'
		case LightingPreset.GOLDEN_HOUR:
			return 'Golden Hour'
		case LightingPreset.DRAMATIC_SHADOW:
			return 'Dramatic Shadow'
		case LightingPreset.BUTTERFLY:
			return 'Butterfly'
		case LightingPreset.REMBRANDT:
			return 'Rembrandt'
		case LightingPreset.CUSTOM:
			return 'Custom'
		default:
			return 'Unknown'
	}
}

export function getLightingPresetDescription(preset: LightingPreset): string {
	switch (preset) {
		case LightingPreset.SOFT_STUDIO:
			return 'Soft, diffused lighting ideal for most fashion shots'
		case LightingPreset.EDITORIAL_CONTRAST:
			return 'High-contrast dramatic lighting for editorial looks'
		case LightingPreset.NATURAL_DAYLIGHT:
			return 'Natural daylight simulation for outdoor appearance'
		case LightingPreset.RING_LIGHT:
			return 'Even front lighting, popular for beauty shots'
		case LightingPreset.GOLDEN_HOUR:
			return 'Warm sunset-like glow for romantic shots'
		case LightingPreset.DRAMATIC_SHADOW:
			return 'Strong directional light with deep shadows'
		case LightingPreset.BUTTERFLY:
			return 'Classic portrait lighting from above'
		case LightingPreset.REMBRANDT:
			return 'Artistic side lighting with triangle highlight'
		case LightingPreset.CUSTOM:
			return 'Custom lighting settings'
		default:
			return 'Unknown preset'
	}
}

/**
 * Utility functions for CameraFraming enum
 */

export function getAllCameraFramings(): CameraFraming[] {
	return Object.values(CameraFraming)
}

export function isValidCameraFraming(framing: string): framing is CameraFraming {
	return Object.values(CameraFraming).includes(framing as CameraFraming)
}

export function getCameraFramingLabel(framing: CameraFraming): string {
	switch (framing) {
		case CameraFraming.WAIST_UP_50MM:
			return 'Waist Up (50mm)'
		case CameraFraming.FULL_BODY_35MM:
			return 'Full Body (35mm)'
		case CameraFraming.PORTRAIT_85MM:
			return 'Portrait (85mm)'
		case CameraFraming.CLOSE_UP:
			return 'Close Up'
		case CameraFraming.THREE_QUARTER:
			return '3/4 View'
		case CameraFraming.BACK_VIEW:
			return 'Back View'
		case CameraFraming.KNEE_UP:
			return 'Knee Up'
		case CameraFraming.CUSTOM:
			return 'Custom'
		default:
			return 'Unknown'
	}
}

export function getCameraFramingDescription(framing: CameraFraming): string {
	switch (framing) {
		case CameraFraming.WAIST_UP_50MM:
			return 'Classic waist-up fashion shot with 50mm lens'
		case CameraFraming.FULL_BODY_35MM:
			return 'Full body shot showing complete outfit with 35mm lens'
		case CameraFraming.PORTRAIT_85MM:
			return 'Portrait focusing on face and upper body with 85mm lens'
		case CameraFraming.CLOSE_UP:
			return 'Face and upper chest detail'
		case CameraFraming.THREE_QUARTER:
			return 'Angled perspective showing depth'
		case CameraFraming.BACK_VIEW:
			return 'Rear angle for back details'
		case CameraFraming.KNEE_UP:
			return 'Mid-length framing for dresses'
		case CameraFraming.CUSTOM:
			return 'Custom camera settings'
		default:
			return 'Unknown framing'
	}
}

/**
 * Utility functions for BackgroundType enum
 */

export function getAllBackgroundTypes(): BackgroundType[] {
	return Object.values(BackgroundType)
}

export function isValidBackgroundType(bg: string): bg is BackgroundType {
	return Object.values(BackgroundType).includes(bg as BackgroundType)
}

export function getBackgroundTypeLabel(bg: BackgroundType): string {
	switch (bg) {
		case BackgroundType.STUDIO_WHITE:
			return 'Studio White'
		case BackgroundType.STUDIO_GRAY:
			return 'Studio Gray'
		case BackgroundType.GRADIENT:
			return 'Gradient'
		case BackgroundType.OUTDOOR_URBAN:
			return 'Urban Outdoor'
		case BackgroundType.OUTDOOR_NATURE:
			return 'Natural Outdoor'
		case BackgroundType.TRANSPARENT:
			return 'Transparent'
		default:
			return 'Unknown'
	}
}

/**
 * Utility functions for PoseStyle enum
 */

export function getAllPoseStyles(): PoseStyle[] {
	return Object.values(PoseStyle)
}

export function isValidPoseStyle(pose: string): pose is PoseStyle {
	return Object.values(PoseStyle).includes(pose as PoseStyle)
}

export function getPoseStyleLabel(pose: PoseStyle): string {
	switch (pose) {
		case PoseStyle.STATIC_FRONT:
			return 'Static Front'
		case PoseStyle.STATIC_SIDE:
			return 'Static Side'
		case PoseStyle.WALKING:
			return 'Walking'
		case PoseStyle.EDITORIAL:
			return 'Editorial'
		case PoseStyle.CASUAL:
			return 'Casual'
		case PoseStyle.DYNAMIC:
			return 'Dynamic'
		default:
			return 'Unknown'
	}
}

/**
 * Utility functions for Expression enum
 */

export function getAllExpressions(): Expression[] {
	return Object.values(Expression)
}

export function isValidExpression(expr: string): expr is Expression {
	return Object.values(Expression).includes(expr as Expression)
}

export function getExpressionLabel(expr: Expression): string {
	switch (expr) {
		case Expression.NEUTRAL:
			return 'Neutral'
		case Expression.SMILE:
			return 'Smile'
		case Expression.SERIOUS:
			return 'Serious'
		case Expression.CONFIDENT:
			return 'Confident'
		case Expression.SOFT:
			return 'Soft'
		default:
			return 'Unknown'
	}
}

/**
 * Utility functions for PostProcessingStyle enum
 */

export function getAllPostProcessingStyles(): PostProcessingStyle[] {
	return Object.values(PostProcessingStyle)
}

export function isValidPostProcessingStyle(style: string): style is PostProcessingStyle {
	return Object.values(PostProcessingStyle).includes(style as PostProcessingStyle)
}

export function getPostProcessingStyleLabel(style: PostProcessingStyle): string {
	switch (style) {
		case PostProcessingStyle.NATURAL:
			return 'Natural'
		case PostProcessingStyle.VIBRANT:
			return 'Vibrant'
		case PostProcessingStyle.MUTED:
			return 'Muted'
		case PostProcessingStyle.HIGH_CONTRAST:
			return 'High Contrast'
		case PostProcessingStyle.WARM:
			return 'Warm'
		case PostProcessingStyle.COOL:
			return 'Cool'
		default:
			return 'Unknown'
	}
}

/**
 * Utility functions for ProductCategory enum
 */

export function getAllProductCategories(): ProductCategory[] {
	return Object.values(ProductCategory)
}

export function isValidProductCategory(category: string): category is ProductCategory {
	return Object.values(ProductCategory).includes(category as ProductCategory)
}

export function getProductCategoryLabel(category: ProductCategory): string {
	switch (category) {
		case ProductCategory.TOPS:
			return 'Tops'
		case ProductCategory.BOTTOMS:
			return 'Bottoms'
		case ProductCategory.DRESSES:
			return 'Dresses'
		case ProductCategory.OUTERWEAR:
			return 'Outerwear'
		case ProductCategory.ACCESSORIES:
			return 'Accessories'
		case ProductCategory.FOOTWEAR:
			return 'Footwear'
		case ProductCategory.SWIMWEAR:
			return 'Swimwear'
		case ProductCategory.ACTIVEWEAR:
			return 'Activewear'
		case ProductCategory.FORMAL:
			return 'Formal Wear'
		case ProductCategory.JEWELRY:
			return 'Jewelry'
		default:
			return 'Unknown'
	}
}
