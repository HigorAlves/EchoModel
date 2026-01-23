'use client'

import { motion } from 'framer-motion'
import { FileText, User } from 'lucide-react'

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Textarea } from '@/components/ui/textarea'

import type { UseModelWizardReturn } from '../../hooks/use-model-wizard'

interface StepBasicInfoProps {
	wizard: UseModelWizardReturn
}

export function StepBasicInfo({ wizard }: StepBasicInfoProps) {
	const { formData, updateField, touchField, stepErrors, touchedFields } = wizard

	const nameError = touchedFields.has('name') && stepErrors.name ? stepErrors.name[0] : undefined
	const descriptionError =
		touchedFields.has('description') && stepErrors.description ? stepErrors.description[0] : undefined

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='space-y-4'>
			{/* Name Field with Icon */}
			<Field>
				<FieldLabel htmlFor='name'>Model Name *</FieldLabel>
				<InputGroup>
					<InputGroupInput
						id='name'
						name='name'
						placeholder='Enter a name for your model'
						value={formData.name}
						onChange={(e) => updateField('name', e.target.value)}
						onBlur={() => touchField('name')}
						aria-invalid={!!nameError}
						required
					/>
					<InputGroupAddon>
						<User className='size-4' />
					</InputGroupAddon>
				</InputGroup>
				<FieldDescription>
					Give your AI influencer a memorable name ({formData.name.length}/50 characters)
				</FieldDescription>
				{nameError && <FieldError>{nameError}</FieldError>}
			</Field>

			{/* Description Field with Icon */}
			<Field>
				<FieldLabel htmlFor='description'>Description</FieldLabel>
				<div className='relative flex w-full items-start'>
					<FileText className='text-muted-foreground absolute left-2.5 top-2.5 size-4 pointer-events-none z-10' />
					<Textarea
						id='description'
						name='description'
						placeholder="Describe your model's personality and style..."
						value={formData.description}
						onChange={(e) => updateField('description', e.target.value)}
						onBlur={() => touchField('description')}
						rows={4}
						className='pl-9'
						aria-invalid={!!descriptionError}
					/>
				</div>
				<FieldDescription>
					Optional: Provide additional context about your model ({formData.description?.length || 0}/500 characters)
				</FieldDescription>
				{descriptionError && <FieldError>{descriptionError}</FieldError>}
			</Field>
		</motion.div>
	)
}
