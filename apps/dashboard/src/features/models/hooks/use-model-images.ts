'use client'

import { useMemo } from 'react'

import { useResolvedAssetUrls, useStorageUrls } from '@/features/assets'
import type { ModelDocument } from '@/lib/firebase'

export interface UseModelImagesOptions {
	model: ModelDocument | null
}

export interface UseModelImagesReturn {
	/** All displayable images (generated or reference) */
	images: string[]
	/** Resolved reference image URLs only */
	referenceImages: string[]
	/** Whether URLs are still being resolved */
	isLoading: boolean
	/** Whether model has generated images */
	hasGeneratedImages: boolean
	/** Number of reference image IDs that couldn't be resolved */
	unresolvedCount: number
}

export function useModelImages({ model }: UseModelImagesOptions): UseModelImagesReturn {
	// Separate reference images into storage paths (new format) and asset IDs (old format)
	const referenceImageIds = model?.referenceImages ?? []

	const { storagePaths, assetIds } = useMemo(() => {
		const storage: string[] = []
		const assets: string[] = []

		for (const id of referenceImageIds) {
			if (id.includes('/')) {
				storage.push(id)
			} else {
				assets.push(id)
			}
		}

		return { storagePaths: storage, assetIds: assets }
	}, [referenceImageIds])

	// Resolve storage paths to download URLs (new format)
	const { urls: storageUrls, isLoading: isLoadingStorageUrls } = useStorageUrls(storagePaths)

	// Resolve asset IDs to URLs (old format - for backwards compatibility)
	const { urls: assetUrls, isLoading: isLoadingAssetUrls } = useResolvedAssetUrls(assetIds)

	const isLoading = isLoadingStorageUrls || isLoadingAssetUrls

	// Combine resolved URLs from both sources
	const resolvedUrls = useMemo(() => new Map([...assetUrls, ...storageUrls]), [assetUrls, storageUrls])

	// Build resolved reference image URLs array
	const referenceImages = useMemo(
		() => referenceImageIds.map((id) => resolvedUrls.get(id)).filter((url): url is string => !!url),
		[referenceImageIds, resolvedUrls],
	)

	// Use generated images if available, otherwise use resolved reference images
	const hasGeneratedImages = (model?.generatedImages?.length ?? 0) > 0
	const images = hasGeneratedImages ? (model?.generatedImages ?? []) : referenceImages

	// Count unresolved references
	const unresolvedCount = referenceImageIds.length - referenceImages.length

	return {
		images,
		referenceImages,
		isLoading,
		hasGeneratedImages,
		unresolvedCount,
	}
}
