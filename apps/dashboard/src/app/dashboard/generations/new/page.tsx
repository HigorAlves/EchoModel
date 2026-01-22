'use client'

import { ArrowLeft, ChevronDown, ImageIcon, Sparkles, Upload } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { PresetCard } from '@/features/generations/components/preset-card'
import { PresetCategory } from '@/features/generations/components/preset-category'
import {
	ANGLE_OPTIONS,
	generateScenePrompt,
	getAngleIcon,
	getLightingIcon,
	getPoseIcon,
	getSettingIcon,
	LIGHTING_OPTIONS,
	POSE_OPTIONS,
	type PresetSelection,
	SETTING_OPTIONS,
} from '@/features/generations/presets'
import { cn } from '@/lib/utils'

// Sample models for selection
const availableModels = [
	{ id: '1', name: 'Sofia', status: 'active' },
	{ id: '2', name: 'Marcus', status: 'active' },
]

export default function NewGenerationPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('generations')
	const tCreate = useTranslations('generations.create')

	const [formData, setFormData] = useState({
		modelId: '',
		garmentAssetId: '',
		aspectRatio: '4:5',
		imageCount: '2',
	})
	const [isGenerating, setIsGenerating] = useState(false)

	// Preset state with smart defaults
	const [presets, setPresets] = useState<PresetSelection>({
		setting: 'studio',
		lighting: 'studio',
		pose: 'standing',
		angle: 'eye',
		mood: undefined,
	})

	// Advanced options state
	const [showAdvanced, setShowAdvanced] = useState(false)
	const [useCustomPrompt, setUseCustomPrompt] = useState(false)
	const [customPrompt, setCustomPrompt] = useState('')

	// Auto-generate prompt from presets
	const generatedPrompt = useMemo(() => generateScenePrompt(presets), [presets])

	// Final prompt for submission
	const finalScenePrompt = useCustomPrompt && customPrompt ? customPrompt : generatedPrompt

	useEffect(() => {
		setItems([{ label: t('breadcrumbs.generations'), href: '/dashboard/generations' }, { label: t('breadcrumbs.new') }])
	}, [setItems, t])

	const handleGenerate = () => {
		setIsGenerating(true)
		// Log the final scene prompt that would be used for generation
		console.log('Generating with scene prompt:', finalScenePrompt)
		// Simulate generation
		setTimeout(() => {
			setIsGenerating(false)
		}, 3000)
	}

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Button variant='ghost' size='icon' render={<Link href='/dashboard/generations' />} nativeButton={false}>
					<ArrowLeft className='h-4 w-4' />
				</Button>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>{tCreate('title')}</h1>
					<p className='text-muted-foreground'>{tCreate('subtitle')}</p>
				</div>
			</div>

			<div className='grid gap-6 lg:grid-cols-2'>
				{/* Form */}
				<div className='space-y-6'>
					{/* Model Selection */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>{tCreate('selectModel')}</CardTitle>
							<CardDescription>Choose which AI model will wear the garment</CardDescription>
						</CardHeader>
						<CardContent>
							<Select
								value={formData.modelId || undefined}
								onValueChange={(value) => setFormData({ ...formData, modelId: value ?? '' })}>
								<SelectTrigger>
									<SelectValue placeholder={tCreate('selectModelPlaceholder')} />
								</SelectTrigger>
								<SelectContent>
									{availableModels.map((model) => (
										<SelectItem key={model.id} value={model.id}>
											{model.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</CardContent>
					</Card>

					{/* Garment Selection */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>{tCreate('selectGarment')}</CardTitle>
							<CardDescription>Select or upload the garment image</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='border-muted hover:border-primary/50 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors'>
								<Upload className='text-muted-foreground mb-2 h-8 w-8' />
								<p className='text-muted-foreground text-sm'>Click to select or upload a garment</p>
							</div>
						</CardContent>
					</Card>

					{/* Preset Selector Card */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>{tCreate('presetSelector')}</CardTitle>
							<CardDescription>{tCreate('presetSelectorDescription')}</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Photography Setting */}
							<PresetCategory title={tCreate('setting')} description={tCreate('settingDescription')}>
								{Object.entries(SETTING_OPTIONS).map(([key, { label }]) => (
									<PresetCard
										key={key}
										id={key}
										label={label}
										icon={getSettingIcon(key)}
										selected={presets.setting === key}
										onSelect={() => setPresets({ ...presets, setting: key })}
									/>
								))}
							</PresetCategory>

							{/* Lighting Style */}
							<PresetCategory title={tCreate('lighting')} description={tCreate('lightingDescription')}>
								{Object.entries(LIGHTING_OPTIONS).map(([key, { label }]) => (
									<PresetCard
										key={key}
										id={key}
										label={label}
										icon={getLightingIcon(key)}
										selected={presets.lighting === key}
										onSelect={() => setPresets({ ...presets, lighting: key })}
									/>
								))}
							</PresetCategory>

							{/* Pose & Action */}
							<PresetCategory title={tCreate('pose')} description={tCreate('poseDescription')}>
								{Object.entries(POSE_OPTIONS).map(([key, { label }]) => (
									<PresetCard
										key={key}
										id={key}
										label={label}
										icon={getPoseIcon(key)}
										selected={presets.pose === key}
										onSelect={() => setPresets({ ...presets, pose: key })}
									/>
								))}
							</PresetCategory>

							{/* Camera Angle */}
							<PresetCategory title={tCreate('angle')} description={tCreate('angleDescription')}>
								{Object.entries(ANGLE_OPTIONS).map(([key, { label }]) => (
									<PresetCard
										key={key}
										id={key}
										label={label}
										icon={getAngleIcon(key)}
										selected={presets.angle === key}
										onSelect={() => setPresets({ ...presets, angle: key })}
									/>
								))}
							</PresetCategory>

							{/* Generated Prompt Preview */}
							<div className='rounded-md bg-muted/50 p-4'>
								<p className='text-xs text-muted-foreground mb-2'>{tCreate('generatedPrompt')}</p>
								<p className='text-sm font-mono'>{generatedPrompt || tCreate('noPresetsSelected')}</p>
							</div>
						</CardContent>
					</Card>

					{/* Advanced Options - Collapsible */}
					<Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
						<CollapsibleTrigger className='w-full'>
							<Button variant='ghost' className='w-full'>
								{showAdvanced ? tCreate('hideAdvanced') : tCreate('showAdvanced')}
								<ChevronDown className={cn('ml-2 h-4 w-4 transition-transform', showAdvanced && 'rotate-180')} />
							</Button>
						</CollapsibleTrigger>

						<CollapsibleContent>
							<Card>
								<CardHeader>
									<CardTitle className='text-lg'>{tCreate('advancedOptions')}</CardTitle>
									<CardDescription>{tCreate('advancedPromptDescription')}</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									{/* Custom Prompt Toggle */}
									<div className='flex items-center space-x-2'>
										<Switch id='custom-prompt' checked={useCustomPrompt} onCheckedChange={setUseCustomPrompt} />
										<Label htmlFor='custom-prompt'>{tCreate('useCustomPrompt')}</Label>
									</div>

									{/* Custom Prompt Input */}
									{useCustomPrompt && (
										<div>
											<Label htmlFor='custom-prompt-input'>{tCreate('customPromptOverride')}</Label>
											<Textarea
												id='custom-prompt-input'
												rows={4}
												placeholder={tCreate('scenePromptPlaceholder')}
												value={customPrompt}
												onChange={(e) => setCustomPrompt(e.target.value)}
												className='mt-2'
											/>
											<p className='text-xs text-muted-foreground mt-2'>{tCreate('customPromptHelp')}</p>
										</div>
									)}

									{/* Show Generated Prompt (read-only when not in custom mode) */}
									{!useCustomPrompt && (
										<div>
											<Label>{tCreate('generatedPrompt')}</Label>
											<Textarea rows={4} value={generatedPrompt} readOnly className='mt-2 bg-muted/50' />
										</div>
									)}
								</CardContent>
							</Card>
						</CollapsibleContent>
					</Collapsible>

					{/* Settings */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Settings</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid gap-4 sm:grid-cols-2'>
								<div className='space-y-2'>
									<Label>{tCreate('aspectRatio')}</Label>
									<Select
										value={formData.aspectRatio || undefined}
										onValueChange={(value) => setFormData({ ...formData, aspectRatio: value ?? '4:5' })}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='4:5'>{tCreate('aspectRatioOptions.portrait')}</SelectItem>
											<SelectItem value='9:16'>{tCreate('aspectRatioOptions.story')}</SelectItem>
											<SelectItem value='1:1'>{tCreate('aspectRatioOptions.square')}</SelectItem>
											<SelectItem value='16:9'>{tCreate('aspectRatioOptions.landscape')}</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-2'>
									<Label>{tCreate('imageCount')}</Label>
									<Select
										value={formData.imageCount || undefined}
										onValueChange={(value) => setFormData({ ...formData, imageCount: value ?? '2' })}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1'>1 image</SelectItem>
											<SelectItem value='2'>2 images</SelectItem>
											<SelectItem value='3'>3 images</SelectItem>
											<SelectItem value='4'>4 images</SelectItem>
										</SelectContent>
									</Select>
									<p className='text-muted-foreground text-xs'>{tCreate('imageCountDescription')}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Generate Button */}
					<Button className='w-full' size='lg' onClick={handleGenerate} disabled={isGenerating}>
						{isGenerating ? (
							<>
								<Sparkles className='mr-2 h-4 w-4 animate-spin' />
								{tCreate('generating')}
							</>
						) : (
							<>
								<Sparkles className='mr-2 h-4 w-4' />
								{tCreate('generate')}
							</>
						)}
					</Button>
				</div>

				{/* Preview */}
				<div>
					<Card className='sticky top-4'>
						<CardHeader>
							<CardTitle className='text-lg'>Preview</CardTitle>
							<CardDescription>Your generation will appear here</CardDescription>
						</CardHeader>
						<CardContent>
							<div
								className={`bg-muted flex items-center justify-center rounded-lg ${
									formData.aspectRatio === '4:5'
										? 'aspect-[4/5]'
										: formData.aspectRatio === '9:16'
											? 'aspect-[9/16]'
											: formData.aspectRatio === '1:1'
												? 'aspect-square'
												: 'aspect-video'
								}`}>
								{isGenerating ? (
									<div className='text-center'>
										<Sparkles className='text-primary mx-auto mb-2 h-12 w-12 animate-pulse' />
										<p className='text-muted-foreground'>Generating your images...</p>
									</div>
								) : (
									<div className='text-center'>
										<ImageIcon className='text-muted-foreground mx-auto mb-2 h-12 w-12' />
										<p className='text-muted-foreground'>Generated images will appear here</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
