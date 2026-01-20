'use client'

import { motion } from 'framer-motion'
import { Activity, Calendar, Globe, Palette, User } from 'lucide-react'

import { Field, FieldDescription, FieldError, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AGE_RANGE_OPTIONS, BODY_TYPE_OPTIONS, ETHNICITY_OPTIONS, GENDER_OPTIONS } from '../_constants'
import type { UseModelFormReturn } from '../_hooks'

interface StepAppearanceProps {
	form: UseModelFormReturn['form']
}

export function StepAppearance({ form }: StepAppearanceProps) {
	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-3'>
				<div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10'>
					<Palette className='h-5 w-5 text-purple-500' />
				</div>
				<div>
					<h3 className='font-semibold'>Appearance</h3>
					<p className='text-muted-foreground text-sm'>Define the physical appearance of your model</p>
				</div>
			</div>

			{/* Physical Characteristics */}
			<div className='space-y-4'>
				<div className='grid gap-4 sm:grid-cols-2'>
					{/* Gender Field */}
					<form.Field name='gender'>
						{(field) => (
							<Field>
								<FieldLabel className='gap-2'>
									<User className='h-4 w-4 text-muted-foreground' />
									Gender *
								</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value as (typeof GENDER_OPTIONS)[number]['value'])}>
									<SelectTrigger>
										<SelectValue placeholder='Select gender' />
									</SelectTrigger>
									<SelectContent>
										{GENDER_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
									<FieldError>{field.state.meta.errors[0]}</FieldError>
								)}
							</Field>
						)}
					</form.Field>

					{/* Age Range Field */}
					<form.Field name='ageRange'>
						{(field) => (
							<Field>
								<FieldLabel className='gap-2'>
									<Calendar className='h-4 w-4 text-muted-foreground' />
									Age Range *
								</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value as (typeof AGE_RANGE_OPTIONS)[number]['value'])}>
									<SelectTrigger>
										<SelectValue placeholder='Select age range' />
									</SelectTrigger>
									<SelectContent>
										{AGE_RANGE_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
									<FieldError>{field.state.meta.errors[0]}</FieldError>
								)}
							</Field>
						)}
					</form.Field>

					{/* Body Type Field */}
					<form.Field name='bodyType'>
						{(field) => (
							<Field>
								<FieldLabel className='gap-2'>
									<Activity className='h-4 w-4 text-muted-foreground' />
									Body Type *
								</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value as (typeof BODY_TYPE_OPTIONS)[number]['value'])}>
									<SelectTrigger>
										<SelectValue placeholder='Select body type' />
									</SelectTrigger>
									<SelectContent>
										{BODY_TYPE_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
									<FieldError>{field.state.meta.errors[0]}</FieldError>
								)}
							</Field>
						)}
					</form.Field>

					{/* Ethnicity Field */}
					<form.Field name='ethnicity'>
						{(field) => (
							<Field>
								<FieldLabel className='gap-2'>
									<Globe className='h-4 w-4 text-muted-foreground' />
									Ethnicity *
								</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value as (typeof ETHNICITY_OPTIONS)[number]['value'])}>
									<SelectTrigger>
										<SelectValue placeholder='Select ethnicity' />
									</SelectTrigger>
									<SelectContent>
										{ETHNICITY_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
									<FieldError>{field.state.meta.errors[0]}</FieldError>
								)}
							</Field>
						)}
					</form.Field>
				</div>

				<FieldSeparator>Custom Details</FieldSeparator>

				{/* Custom Prompt Field */}
				<form.Field name='prompt'>
					{(field) => (
						<Field>
							<FieldLabel htmlFor='prompt'>Custom Appearance Prompt</FieldLabel>
							<Textarea
								id='prompt'
								placeholder='Add specific details about the model&apos;s appearance (e.g., hair color, eye color, specific features)...'
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								rows={3}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							<FieldDescription>
								Optional: Provide additional details for more precise results ({(field.state.value ?? '').length}/1000
								characters)
							</FieldDescription>
							{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
								<FieldError>{field.state.meta.errors[0]}</FieldError>
							)}
						</Field>
					)}
				</form.Field>
			</div>
		</motion.div>
	)
}
