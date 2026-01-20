'use client'

import { motion } from 'framer-motion'
import { User } from 'lucide-react'

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { UseModelFormReturn } from '../_hooks'

interface StepBasicInfoProps {
	form: UseModelFormReturn['form']
}

export function StepBasicInfo({ form }: StepBasicInfoProps) {
	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-3'>
				<div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
					<User className='h-5 w-5 text-primary' />
				</div>
				<div>
					<h3 className='font-semibold'>Basic Information</h3>
					<p className='text-muted-foreground text-sm'>Enter basic information about your AI model</p>
				</div>
			</div>

			{/* Form Fields */}
			<div className='space-y-4'>
				{/* Name Field */}
				<form.Field name='name'>
					{(field) => (
						<Field>
							<FieldLabel htmlFor='name'>Model Name *</FieldLabel>
							<Input
								id='name'
								placeholder='Enter a name for your model'
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							<FieldDescription>
								Give your AI influencer a memorable name ({field.state.value.length}/50 characters)
							</FieldDescription>
							{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
								<FieldError>{field.state.meta.errors[0]}</FieldError>
							)}
						</Field>
					)}
				</form.Field>

				{/* Description Field */}
				<form.Field name='description'>
					{(field) => (
						<Field>
							<FieldLabel htmlFor='description'>Description</FieldLabel>
							<Textarea
								id='description'
								placeholder="Describe your model's personality and style..."
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								rows={4}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							<FieldDescription>
								Optional: Provide additional context about your model ({(field.state.value ?? '').length}
								/500 characters)
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
