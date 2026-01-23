'use client'

import { motion } from 'framer-motion'
import { Activity, Calendar, Globe, User } from 'lucide-react'

import { Field, FieldDescription, FieldError, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AGE_RANGE_OPTIONS, BODY_TYPE_OPTIONS, ETHNICITY_OPTIONS, GENDER_OPTIONS } from '../../constants'
import type { UseModelWizardReturn } from '../../hooks/use-model-wizard'

interface StepAppearanceProps {
	wizard: UseModelWizardReturn
}

export function StepAppearance({ wizard }: StepAppearanceProps) {
	const { formData, updateField, touchField, stepErrors, touchedFields } = wizard
	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='space-y-4'>
			{/* Physical Characteristics */}
			<div className='grid gap-4 sm:grid-cols-2'>
				{/* Gender Field */}
				<Field>
					<FieldLabel className='gap-2'>
						<User className='h-4 w-4 text-muted-foreground' />
						Gender *
					</FieldLabel>
					<Select
						value={formData.gender}
						onValueChange={(value) => updateField('gender', value as (typeof GENDER_OPTIONS)[number]['value'])}>
						<SelectTrigger className='w-full'>
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
					{touchedFields.has('gender') && stepErrors.gender && <FieldError>{stepErrors.gender[0]}</FieldError>}
				</Field>

				{/* Age Range Field */}
				<Field>
					<FieldLabel className='gap-2'>
						<Calendar className='h-4 w-4 text-muted-foreground' />
						Age Range *
					</FieldLabel>
					<Select
						value={formData.ageRange}
						onValueChange={(value) => updateField('ageRange', value as (typeof AGE_RANGE_OPTIONS)[number]['value'])}>
						<SelectTrigger className='w-full'>
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
					{touchedFields.has('ageRange') && stepErrors.ageRange && <FieldError>{stepErrors.ageRange[0]}</FieldError>}
				</Field>

				{/* Body Type Field */}
				<Field>
					<FieldLabel className='gap-2'>
						<Activity className='h-4 w-4 text-muted-foreground' />
						Body Type *
					</FieldLabel>
					<Select
						value={formData.bodyType}
						onValueChange={(value) => updateField('bodyType', value as (typeof BODY_TYPE_OPTIONS)[number]['value'])}>
						<SelectTrigger className='w-full'>
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
					{touchedFields.has('bodyType') && stepErrors.bodyType && <FieldError>{stepErrors.bodyType[0]}</FieldError>}
				</Field>

				{/* Ethnicity Field */}
				<Field>
					<FieldLabel className='gap-2'>
						<Globe className='h-4 w-4 text-muted-foreground' />
						Ethnicity *
					</FieldLabel>
					<Select
						value={formData.ethnicity}
						onValueChange={(value) => updateField('ethnicity', value as (typeof ETHNICITY_OPTIONS)[number]['value'])}>
						<SelectTrigger className='w-full'>
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
					{touchedFields.has('ethnicity') && stepErrors.ethnicity && <FieldError>{stepErrors.ethnicity[0]}</FieldError>}
				</Field>
			</div>

			<FieldSeparator>Custom Details</FieldSeparator>

			{/* Custom Prompt Field */}
			<Field>
				<FieldLabel htmlFor='prompt'>Custom Appearance Prompt</FieldLabel>
				<Textarea
					id='prompt'
					placeholder='Add specific details about the model&apos;s appearance (e.g., hair color, eye color, specific features)...'
					value={formData.prompt}
					onChange={(e) => updateField('prompt', e.target.value)}
					onBlur={() => touchField('prompt')}
					rows={3}
					aria-invalid={!!stepErrors.prompt}
				/>
				<FieldDescription>
					Optional: Provide additional details for more precise results ({(formData.prompt ?? '').length}/1000
					characters)
				</FieldDescription>
				{touchedFields.has('prompt') && stepErrors.prompt && <FieldError>{stepErrors.prompt[0]}</FieldError>}
			</Field>
		</motion.div>
	)
}
