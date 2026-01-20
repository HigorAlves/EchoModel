'use client'

import { motion } from 'framer-motion'
import {
	Camera,
	ImageIcon,
	Info,
	Lightbulb,
	Palette,
	Settings,
	Shirt,
	Smile,
	Sparkles,
	X,
	Move,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import type { UseModelFormReturn } from '../_hooks'
import {
	LIGHTING_PRESETS,
	CAMERA_FRAMINGS,
	BACKGROUND_OPTIONS,
	POSE_STYLES,
	EXPRESSION_OPTIONS,
	POST_PROCESSING_STYLES,
	PRODUCT_CATEGORIES,
} from '../_constants'
import { SelectionCard, SelectionCardContent, SelectionCardGrid } from './selection-card'
import type { ProductCategory as ProductCategoryType } from '../_schemas'

interface StepFashionConfigProps {
	form: UseModelFormReturn['form']
	textureInput: string
	setTextureInput: (value: string) => void
	addTexture: () => void
	removeTexture: (texture: string) => void
	toggleProductCategory: (category: ProductCategoryType) => void
}

interface SectionHeaderProps {
	icon: React.ElementType
	iconColor: string
	title: string
	tooltip: string
}

function SectionHeader({ icon: Icon, iconColor, title, tooltip }: SectionHeaderProps) {
	return (
		<div className='flex items-center gap-2'>
			<Icon className={`h-4 w-4 ${iconColor}`} />
			<Label className='font-medium'>{title}</Label>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>
						<Info className='text-muted-foreground h-4 w-4 cursor-help' />
					</TooltipTrigger>
					<TooltipContent>
						<p className='max-w-xs'>{tooltip}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	)
}

export function StepFashionConfig({
	form,
	textureInput,
	setTextureInput,
	addTexture,
	removeTexture,
	toggleProductCategory,
}: StepFashionConfigProps) {
	const handleTextureKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			addTexture()
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='space-y-8'>
			{/* Header */}
			<div className='flex items-center gap-3'>
				<div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10'>
					<Settings className='h-5 w-5 text-blue-500' />
				</div>
				<div>
					<h3 className='font-semibold'>Fashion Configuration</h3>
					<p className='text-muted-foreground text-sm'>
						Configure lighting, camera, and styling preferences for optimal results
					</p>
				</div>
			</div>

			{/* Lighting Preset */}
			<div className='space-y-3'>
				<SectionHeader
					icon={Lightbulb}
					iconColor='text-amber-500'
					title='Lighting Preset'
					tooltip='Controls the lighting style for generated images. Choose based on your product photography needs.'
				/>
				<form.Field name='lightingPreset'>
					{(field) => (
						<SelectionCardGrid columns={4}>
							{LIGHTING_PRESETS.map((preset) => (
								<SelectionCard
									key={preset.value}
									selected={field.state.value === preset.value}
									onClick={() => field.handleChange(preset.value)}>
									<SelectionCardContent label={preset.label} description={preset.description} />
								</SelectionCard>
							))}
						</SelectionCardGrid>
					)}
				</form.Field>
			</div>

			{/* Camera Framing */}
			<div className='space-y-3'>
				<SectionHeader
					icon={Camera}
					iconColor='text-blue-500'
					title='Camera Framing'
					tooltip='Defines how the model is framed in generated images. Different framings work better for different product types.'
				/>
				<form.Field name='cameraFraming'>
					{(field) => (
						<SelectionCardGrid columns={4}>
							{CAMERA_FRAMINGS.map((framing) => (
								<SelectionCard
									key={framing.value}
									selected={field.state.value === framing.value}
									onClick={() => field.handleChange(framing.value)}>
									<SelectionCardContent label={framing.label} description={framing.description} />
								</SelectionCard>
							))}
						</SelectionCardGrid>
					)}
				</form.Field>
			</div>

			{/* Background Type */}
			<div className='space-y-3'>
				<SectionHeader
					icon={ImageIcon}
					iconColor='text-green-500'
					title='Background/Backdrop'
					tooltip='Choose the backdrop style for your generated images.'
				/>
				<form.Field name='backgroundType'>
					{(field) => (
						<SelectionCardGrid columns={3}>
							{BACKGROUND_OPTIONS.map((bg) => (
								<SelectionCard
									key={bg.value}
									selected={field.state.value === bg.value}
									onClick={() => field.handleChange(bg.value)}>
									<SelectionCardContent label={bg.label} description={bg.description} />
								</SelectionCard>
							))}
						</SelectionCardGrid>
					)}
				</form.Field>
			</div>

			{/* Pose Style */}
			<div className='space-y-3'>
				<SectionHeader
					icon={Move}
					iconColor='text-pink-500'
					title='Pose Style'
					tooltip='Select the pose style for your model in generated images.'
				/>
				<form.Field name='poseStyle'>
					{(field) => (
						<SelectionCardGrid columns={3}>
							{POSE_STYLES.map((pose) => (
								<SelectionCard
									key={pose.value}
									selected={field.state.value === pose.value}
									onClick={() => field.handleChange(pose.value)}>
									<SelectionCardContent label={pose.label} description={pose.description} />
								</SelectionCard>
							))}
						</SelectionCardGrid>
					)}
				</form.Field>
			</div>

			{/* Expression */}
			<div className='space-y-3'>
				<SectionHeader
					icon={Smile}
					iconColor='text-yellow-500'
					title='Model Expression'
					tooltip="Define the model's facial expression for generated images."
				/>
				<form.Field name='expression'>
					{(field) => (
						<SelectionCardGrid columns={3}>
							{EXPRESSION_OPTIONS.map((expr) => (
								<SelectionCard
									key={expr.value}
									selected={field.state.value === expr.value}
									onClick={() => field.handleChange(expr.value)}>
									<SelectionCardContent label={expr.label} description={expr.description} />
								</SelectionCard>
							))}
						</SelectionCardGrid>
					)}
				</form.Field>
			</div>

			{/* Post-Processing Style */}
			<div className='space-y-3'>
				<SectionHeader
					icon={Palette}
					iconColor='text-violet-500'
					title='Post-Processing Style'
					tooltip='Choose the color grading and editing style for your generated images.'
				/>
				<form.Field name='postProcessingStyle'>
					{(field) => (
						<SelectionCardGrid columns={3}>
							{POST_PROCESSING_STYLES.map((style) => (
								<SelectionCard
									key={style.value}
									selected={field.state.value === style.value}
									onClick={() => field.handleChange(style.value)}>
									<SelectionCardContent label={style.label} description={style.description} />
								</SelectionCard>
							))}
						</SelectionCardGrid>
					)}
				</form.Field>
			</div>

			{/* Texture Preferences */}
			<div className='space-y-3'>
				<SectionHeader
					icon={Sparkles}
					iconColor='text-purple-500'
					title='Texture Preferences'
					tooltip='Add keywords describing fabric textures and materials. Examples: "matte cotton", "glossy silk", "brushed denim"'
				/>
				<form.Field name='texturePreferences'>
					{(field) => (
						<Field>
							<div className='flex gap-2'>
								<Input
									placeholder='Enter texture (e.g., matte cotton)'
									value={textureInput}
									onChange={(e) => setTextureInput(e.target.value)}
									onKeyDown={handleTextureKeyDown}
									disabled={field.state.value.length >= 5}
								/>
								<Button
									type='button'
									variant='outline'
									onClick={addTexture}
									disabled={!textureInput.trim() || field.state.value.length >= 5}>
									Add
								</Button>
							</div>
							{field.state.value.length > 0 && (
								<div className='flex flex-wrap gap-2 pt-2'>
									{field.state.value.map((texture) => (
										<Badge key={texture} variant='secondary' className='gap-1 pr-1'>
											{texture}
											<button
												type='button'
												onClick={() => removeTexture(texture)}
												className='hover:bg-muted ml-1 rounded-full p-0.5'>
												<X className='h-3 w-3' />
											</button>
										</Badge>
									))}
								</div>
							)}
							<FieldDescription>{field.state.value.length}/5 textures added</FieldDescription>
						</Field>
					)}
				</form.Field>
			</div>

			{/* Product Categories */}
			<div className='space-y-3'>
				<SectionHeader
					icon={Shirt}
					iconColor='text-emerald-500'
					title='Product Categories'
					tooltip='Select up to 3 product categories this model specializes in. This helps optimize generation results.'
				/>
				<form.Field name='productCategories'>
					{(field) => (
						<Field>
							<div className='grid grid-cols-2 gap-3 sm:grid-cols-5'>
								{PRODUCT_CATEGORIES.map((category) => {
									const isSelected = field.state.value.includes(category.value)
									const isDisabled = !isSelected && field.state.value.length >= 3

									return (
										<label
											key={category.value}
											className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all ${
												isSelected
													? 'border-primary bg-primary/5'
													: isDisabled
														? 'cursor-not-allowed border-muted opacity-50'
														: 'border-muted hover:border-primary/50'
											}`}>
											<Checkbox
												checked={isSelected}
												onCheckedChange={() => toggleProductCategory(category.value)}
												disabled={isDisabled}
											/>
											<span className='text-sm'>{category.label}</span>
										</label>
									)
								})}
							</div>
							<FieldDescription>
								{field.state.value.length}/3 categories selected (minimum 1 required)
							</FieldDescription>
						</Field>
					)}
				</form.Field>
			</div>

			{/* Outfit Swapping Toggle */}
			<form.Field name='supportOutfitSwapping'>
				{(field) => (
					<div className='flex items-center justify-between rounded-lg border p-4'>
						<div className='space-y-1'>
							<div className='flex items-center gap-2'>
								<Label htmlFor='outfit-swapping' className='font-medium'>
									Enable Outfit Swapping
								</Label>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>
											<Info className='text-muted-foreground h-4 w-4 cursor-help' />
										</TooltipTrigger>
										<TooltipContent>
											<p className='max-w-xs'>
												Allow this model to be used for garment swapping, where different clothing
												items can be placed on the model.
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<p className='text-muted-foreground text-sm'>
								Use this model for virtual try-on and outfit generation
							</p>
						</div>
						<Switch
							id='outfit-swapping'
							checked={field.state.value}
							onCheckedChange={(checked) => field.handleChange(checked)}
						/>
					</div>
				)}
			</form.Field>
		</motion.div>
	)
}
