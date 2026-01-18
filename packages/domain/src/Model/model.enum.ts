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
