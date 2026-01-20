/**
 * @fileoverview Unit Tests for Seedream45Service
 *
 * Tests for the unified Seedream 4.5 image generation and model calibration service.
 */

import { AgeRange, AspectRatio, BodyType, CameraFraming, Ethnicity, Gender, LightingPreset } from '@foundry/domain'
import { beforeEach, describe, expect, it } from 'vitest'
import { Seedream45Service } from './seedream45.service'
import { MAX_REFERENCE_IMAGES, MAX_TOTAL_IMAGES } from './seedream45.types'

describe('Seedream45Service', () => {
	let service: Seedream45Service

	beforeEach(() => {
		// Always use mock mode for unit tests
		service = new Seedream45Service({ useMock: true })
	})

	describe('constructor', () => {
		it('should initialize in mock mode when no API key is provided', () => {
			const mockService = new Seedream45Service({ useMock: true })
			expect(mockService).toBeDefined()
		})

		it('should initialize with custom region', () => {
			const mockService = new Seedream45Service({
				useMock: true,
				region: 'ap-southeast' as any,
			})
			expect(mockService).toBeDefined()
		})

		it('should initialize with custom base URL', () => {
			const mockService = new Seedream45Service({
				useMock: true,
				baseUrl: 'https://custom.api.example.com/v3',
			})
			expect(mockService).toBeDefined()
		})
	})

	describe('generateCalibrationImages', () => {
		const baseCalibrationParams = {
			prompt: 'Professional fashion model portrait',
			gender: Gender.FEMALE,
			ageRange: AgeRange.YOUNG_ADULT,
			ethnicity: Ethnicity.CAUCASIAN,
			bodyType: BodyType.ATHLETIC,
			count: 4,
		}

		describe('without reference images', () => {
			it('should generate calibration images successfully', async () => {
				const result = await service.generateCalibrationImages(baseCalibrationParams)

				expect(result.success).toBe(true)
				expect(result.images).toHaveLength(4)
				expect(result.error).toBeUndefined()
				expect(result.modelVersion).toBe('mock-v1')
			})

			it('should include metadata in generated images', async () => {
				const result = await service.generateCalibrationImages(baseCalibrationParams)

				expect(result.success).toBe(true)
				for (const image of result.images) {
					expect(image.id).toBeDefined()
					expect(image.url).toBeDefined()
					expect(image.metadata).toBeDefined()
					expect(image.metadata?.width).toBe(2048)
					expect(image.metadata?.height).toBe(2048)
				}
			})
		})

		describe('with single reference image', () => {
			it('should generate calibration images with 1 reference image', async () => {
				const params = {
					...baseCalibrationParams,
					referenceImageUrls: ['https://example.com/ref1.jpg'],
				}

				const result = await service.generateCalibrationImages(params)

				expect(result.success).toBe(true)
				expect(result.images).toHaveLength(4)
			})
		})

		describe('with multiple reference images (5 images)', () => {
			it('should generate calibration images with 5 reference images', async () => {
				const params = {
					...baseCalibrationParams,
					referenceImageUrls: [
						'https://example.com/ref1.jpg',
						'https://example.com/ref2.jpg',
						'https://example.com/ref3.jpg',
						'https://example.com/ref4.jpg',
						'https://example.com/ref5.jpg',
					],
				}

				const result = await service.generateCalibrationImages(params)

				expect(result.success).toBe(true)
				// With 5 input images, max output is 15 - 5 = 10, but we requested 4
				expect(result.images).toHaveLength(4)
			})
		})

		describe('with maximum reference images (14 images)', () => {
			it('should generate calibration images with 14 reference images', async () => {
				const params = {
					...baseCalibrationParams,
					count: 1, // Only 1 output since 14 + 1 = 15 (max total)
					referenceImageUrls: Array(MAX_REFERENCE_IMAGES)
						.fill(null)
						.map((_, i) => `https://example.com/ref${i + 1}.jpg`),
				}

				const result = await service.generateCalibrationImages(params)

				expect(result.success).toBe(true)
				expect(result.images).toHaveLength(1)
			})

			it('should respect MAX_TOTAL_IMAGES constraint', async () => {
				const params = {
					...baseCalibrationParams,
					count: 10, // Request 10, but with 14 inputs, max output is 1
					referenceImageUrls: Array(MAX_REFERENCE_IMAGES)
						.fill(null)
						.map((_, i) => `https://example.com/ref${i + 1}.jpg`),
				}

				const result = await service.generateCalibrationImages(params)

				expect(result.success).toBe(true)
				// Max output = 15 - 14 = 1
				expect(result.images.length).toBeLessThanOrEqual(MAX_TOTAL_IMAGES - MAX_REFERENCE_IMAGES)
			})
		})

		describe('sequential generation options', () => {
			it('should support sequential generation mode', async () => {
				const params = {
					...baseCalibrationParams,
					useSequentialGeneration: true,
				}

				const result = await service.generateCalibrationImages(params)

				expect(result.success).toBe(true)
				expect(result.images).toHaveLength(4)
			})

			it('should support disabled sequential generation', async () => {
				const params = {
					...baseCalibrationParams,
					useSequentialGeneration: false,
				}

				const result = await service.generateCalibrationImages(params)

				expect(result.success).toBe(true)
			})
		})

		describe('fashion configuration', () => {
			it('should accept fashion config with lighting preset', async () => {
				const params = {
					...baseCalibrationParams,
					fashionConfig: {
						lightingPreset: LightingPreset.EDITORIAL_CONTRAST,
						cameraFraming: CameraFraming.FULL_BODY_35MM,
						texturePreferences: ['matte cotton'],
					},
				}

				const result = await service.generateCalibrationImages(params)

				expect(result.success).toBe(true)
			})

			it('should use default fashion config when not provided', async () => {
				const result = await service.generateCalibrationImages(baseCalibrationParams)

				expect(result.success).toBe(true)
			})
		})
	})

	describe('generateImages', () => {
		const baseGenerationParams = {
			modelIdentityUrl: 'https://storage.example.com/identities/model-123/locked.json',
			garmentImageUrl: 'https://storage.example.com/garments/garment-456.jpg',
			scenePrompt: 'Fashion model in urban setting',
			aspectRatios: [AspectRatio.PORTRAIT_4_5],
			count: 2,
		}

		it('should generate images successfully', async () => {
			const result = await service.generateImages(baseGenerationParams)

			expect(result.success).toBe(true)
			expect(result.images).toHaveLength(2)
			expect(result.error).toBeUndefined()
		})

		it('should generate images for multiple aspect ratios', async () => {
			const params = {
				...baseGenerationParams,
				aspectRatios: [AspectRatio.PORTRAIT_4_5, AspectRatio.SQUARE_1_1, AspectRatio.LANDSCAPE_16_9],
				count: 1,
			}

			const result = await service.generateImages(params)

			expect(result.success).toBe(true)
			expect(result.images).toHaveLength(3) // 1 per aspect ratio
		})

		it('should include correct aspect ratio in generated images', async () => {
			const params = {
				...baseGenerationParams,
				aspectRatios: [AspectRatio.PORTRAIT_9_16],
				count: 1,
			}

			const result = await service.generateImages(params)

			expect(result.success).toBe(true)
			expect(result.images[0]?.aspectRatio).toBe(AspectRatio.PORTRAIT_9_16)
		})

		it('should accept fashion config override', async () => {
			const params = {
				...baseGenerationParams,
				fashionConfig: {
					lightingPreset: LightingPreset.NATURAL_DAYLIGHT,
					cameraFraming: CameraFraming.PORTRAIT_85MM,
					texturePreferences: ['silk', 'velvet'],
				},
			}

			const result = await service.generateImages(params)

			expect(result.success).toBe(true)
		})
	})

	describe('lockIdentity', () => {
		it('should lock identity and return URL', async () => {
			const modelId = 'model-123'
			const selectedImageIds = ['img-1', 'img-2', 'img-3']

			const result = await service.lockIdentity(modelId, selectedImageIds)

			expect(result).toBeDefined()
			expect(result).toContain(modelId)
			expect(result).toContain('locked')
		})

		it('should work with single selected image', async () => {
			const result = await service.lockIdentity('model-456', ['img-1'])

			expect(result).toBeDefined()
		})

		it('should work with multiple selected images', async () => {
			const result = await service.lockIdentity('model-789', ['img-1', 'img-2', 'img-3', 'img-4'])

			expect(result).toBeDefined()
		})
	})

	describe('validateApiKey', () => {
		it('should return true in mock mode', async () => {
			const result = await service.validateApiKey()
			expect(result).toBe(true)
		})
	})

	describe('estimateCost', () => {
		it('should estimate cost for Seedream 4.5', () => {
			const cost = Seedream45Service.estimateCost('seedream-4-5-251128' as any, 4)
			expect(cost).toBe(0.045 * 4)
		})

		it('should estimate cost for Seedream 4.0', () => {
			const cost = Seedream45Service.estimateCost('seedream-4-0-250828' as any, 4)
			expect(cost).toBe(0.035 * 4)
		})

		it('should default to single image cost', () => {
			const cost = Seedream45Service.estimateCost('seedream-4-5-251128' as any)
			expect(cost).toBe(0.045)
		})
	})

	describe('constants', () => {
		it('should have correct MAX_REFERENCE_IMAGES value', () => {
			expect(MAX_REFERENCE_IMAGES).toBe(14)
		})

		it('should have correct MAX_TOTAL_IMAGES value', () => {
			expect(MAX_TOTAL_IMAGES).toBe(15)
		})
	})
})
