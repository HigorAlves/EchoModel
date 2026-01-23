'use client'

import { Calendar, ImageIcon, Loader2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { ModelDocument } from '@/lib/firebase'

interface ModelStatisticsCardProps {
	generatedImagesCount: number
	createdAt: Date | null | undefined
}

function formatDate(date: Date | null | undefined): string {
	if (!date) return 'N/A'
	if (date instanceof Date) return date.toLocaleDateString()
	return String(date).split('T')[0] ?? 'N/A'
}

export function ModelStatisticsCard({ generatedImagesCount, createdAt }: ModelStatisticsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-base'>Statistics</CardTitle>
			</CardHeader>
			<CardContent className='grid gap-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2 text-sm text-muted-foreground'>
						<ImageIcon className='h-4 w-4' />
						<span>Generated Images</span>
					</div>
					<span className='font-semibold'>{generatedImagesCount}</span>
				</div>
				<Separator />
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2 text-sm text-muted-foreground'>
						<Calendar className='h-4 w-4' />
						<span>Created</span>
					</div>
					<span className='text-sm'>{formatDate(createdAt)}</span>
				</div>
			</CardContent>
		</Card>
	)
}

interface ModelConfigurationCardProps {
	model: ModelDocument
	referenceImages: string[]
	isLoadingImages: boolean
}

export function ModelConfigurationCard({ model, referenceImages, isLoadingImages }: ModelConfigurationCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-base'>Configuration</CardTitle>
				<CardDescription>AI generation settings</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div>
					<h4 className='mb-2 text-sm font-medium text-muted-foreground'>Appearance</h4>
					<div className='space-y-2 text-sm'>
						<div className='flex justify-between'>
							<span className='text-muted-foreground'>Gender</span>
							<span>{model.gender}</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-muted-foreground'>Age Range</span>
							<span>{model.ageRange}</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-muted-foreground'>Ethnicity</span>
							<span>{model.ethnicity}</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-muted-foreground'>Body Type</span>
							<span>{model.bodyType}</span>
						</div>
					</div>
				</div>

				{model.prompt && (
					<>
						<Separator />
						<div>
							<h4 className='mb-2 text-sm font-medium text-muted-foreground'>Prompt</h4>
							<p className='text-sm'>{model.prompt}</p>
						</div>
					</>
				)}

				{referenceImages.length > 0 && (
					<>
						<Separator />
						<div>
							<h4 className='mb-2 text-sm font-medium text-muted-foreground'>Reference Images</h4>
							{isLoadingImages ? (
								<div className='flex items-center justify-center py-4'>
									<Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
								</div>
							) : (
								<>
									<div className='grid grid-cols-3 gap-2'>
										{referenceImages.slice(0, 6).map((url, idx) => (
											<div key={url} className='relative aspect-square overflow-hidden rounded-md bg-muted'>
												{/* biome-ignore lint/performance/noImgElement: Dynamic user-generated content */}
												<img src={url} alt={`Reference ${idx + 1}`} className='h-full w-full object-cover' />
											</div>
										))}
									</div>
									{referenceImages.length > 6 && (
										<p className='mt-2 text-xs text-muted-foreground'>+{referenceImages.length - 6} more</p>
									)}
								</>
							)}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	)
}
