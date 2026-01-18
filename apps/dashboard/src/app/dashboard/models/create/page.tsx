'use client'

import { ArrowLeft, ArrowRight, Upload } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { useBreadcrumbs } from '@/components/layout/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Step = 1 | 2 | 3 | 4

function StepIndicator({ currentStep, totalSteps }: { currentStep: Step; totalSteps: number }) {
	return (
		<div className='flex items-center gap-2'>
			{Array.from({ length: totalSteps }, (_, i) => (
				<div
					key={i}
					className={`h-2 flex-1 rounded-full transition-colors ${i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'}`}
				/>
			))}
		</div>
	)
}

export default function CreateModelPage() {
	const { setItems } = useBreadcrumbs()
	const t = useTranslations('models')
	const tForm = useTranslations('models.form')
	const tCreate = useTranslations('models.create')

	const [step, setStep] = useState<Step>(1)
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		gender: '',
		ageRange: '',
		ethnicity: '',
		bodyType: '',
		prompt: '',
	})

	useEffect(() => {
		setItems([{ label: t('breadcrumbs.models'), href: '/dashboard/models' }, { label: t('breadcrumbs.create') }])
	}, [setItems, t])

	const handleNext = () => {
		if (step < 4) setStep((s) => (s + 1) as Step)
	}

	const handleBack = () => {
		if (step > 1) setStep((s) => (s - 1) as Step)
	}

	const stepTitles = [tCreate('step1'), tCreate('step2'), tCreate('step3'), tCreate('step4')]

	return (
		<div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Button variant='ghost' size='icon' render={<Link href='/dashboard/models' />}>
					<ArrowLeft className='h-4 w-4' />
				</Button>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>{tCreate('title')}</h1>
					<p className='text-muted-foreground'>{tCreate('subtitle')}</p>
				</div>
			</div>

			{/* Progress */}
			<div className='mx-auto w-full max-w-2xl'>
				<div className='mb-2 flex justify-between text-sm'>
					<span className='font-medium'>
						Step {step} of 4: {stepTitles[step - 1]}
					</span>
				</div>
				<StepIndicator currentStep={step} totalSteps={4} />
			</div>

			{/* Form Card */}
			<Card className='mx-auto w-full max-w-2xl'>
				<CardHeader>
					<CardTitle>{stepTitles[step - 1]}</CardTitle>
					<CardDescription>
						{step === 1 && 'Enter basic information about your AI model'}
						{step === 2 && 'Define the physical appearance of your model'}
						{step === 3 && 'Upload reference images to guide the AI'}
						{step === 4 && 'Review your model configuration before creating'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{step === 1 && (
						<div className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='name'>{tForm('name')}</Label>
								<Input
									id='name'
									placeholder={tForm('namePlaceholder')}
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								/>
								<p className='text-muted-foreground text-sm'>{tForm('nameDescription')}</p>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='description'>{tForm('description')}</Label>
								<Input
									id='description'
									placeholder={tForm('descriptionPlaceholder')}
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								/>
							</div>
						</div>
					)}

					{step === 2 && (
						<div className='grid gap-4 sm:grid-cols-2'>
							<div className='space-y-2'>
								<Label>{tForm('gender')}</Label>
								<Select
									value={formData.gender || undefined}
									onValueChange={(value) => setFormData({ ...formData, gender: value ?? '' })}>
									<SelectTrigger>
										<SelectValue placeholder='Select gender' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='male'>{tForm('genderOptions.male')}</SelectItem>
										<SelectItem value='female'>{tForm('genderOptions.female')}</SelectItem>
										<SelectItem value='non-binary'>{tForm('genderOptions.nonBinary')}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<Label>{tForm('ageRange')}</Label>
								<Select
									value={formData.ageRange || undefined}
									onValueChange={(value) => setFormData({ ...formData, ageRange: value ?? '' })}>
									<SelectTrigger>
										<SelectValue placeholder='Select age range' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='young'>{tForm('ageRangeOptions.young')}</SelectItem>
										<SelectItem value='adult'>{tForm('ageRangeOptions.adult')}</SelectItem>
										<SelectItem value='mature'>{tForm('ageRangeOptions.mature')}</SelectItem>
										<SelectItem value='senior'>{tForm('ageRangeOptions.senior')}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<Label>{tForm('bodyType')}</Label>
								<Select
									value={formData.bodyType || undefined}
									onValueChange={(value) => setFormData({ ...formData, bodyType: value ?? '' })}>
									<SelectTrigger>
										<SelectValue placeholder='Select body type' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='slim'>{tForm('bodyTypeOptions.slim')}</SelectItem>
										<SelectItem value='athletic'>{tForm('bodyTypeOptions.athletic')}</SelectItem>
										<SelectItem value='average'>{tForm('bodyTypeOptions.average')}</SelectItem>
										<SelectItem value='curvy'>{tForm('bodyTypeOptions.curvy')}</SelectItem>
										<SelectItem value='plus-size'>{tForm('bodyTypeOptions.plusSize')}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<Label>{tForm('ethnicity')}</Label>
								<Select
									value={formData.ethnicity || undefined}
									onValueChange={(value) => setFormData({ ...formData, ethnicity: value ?? '' })}>
									<SelectTrigger>
										<SelectValue placeholder='Select ethnicity' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='caucasian'>Caucasian</SelectItem>
										<SelectItem value='african'>African</SelectItem>
										<SelectItem value='asian'>Asian</SelectItem>
										<SelectItem value='hispanic'>Hispanic</SelectItem>
										<SelectItem value='middle-eastern'>Middle Eastern</SelectItem>
										<SelectItem value='mixed'>Mixed</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2 sm:col-span-2'>
								<Label>{tForm('prompt')}</Label>
								<Input
									placeholder={tForm('promptPlaceholder')}
									value={formData.prompt}
									onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
								/>
								<p className='text-muted-foreground text-sm'>{tForm('promptDescription')}</p>
							</div>
						</div>
					)}

					{step === 3 && (
						<div className='space-y-4'>
							<div className='space-y-2'>
								<Label>{tForm('referenceImages')}</Label>
								<p className='text-muted-foreground text-sm'>{tForm('referenceImagesDescription')}</p>
							</div>
							<div className='border-muted hover:border-primary/50 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors'>
								<Upload className='text-muted-foreground mb-4 h-10 w-10' />
								<p className='text-muted-foreground mb-2 text-sm'>Drag and drop images here, or click to browse</p>
								<p className='text-muted-foreground text-xs'>Supports: JPEG, PNG, WebP (max 10MB each)</p>
							</div>
						</div>
					)}

					{step === 4 && (
						<div className='space-y-6'>
							<div>
								<h3 className='mb-2 font-medium'>Basic Information</h3>
								<div className='bg-muted rounded-lg p-4'>
									<dl className='grid gap-2 text-sm'>
										<div className='flex justify-between'>
											<dt className='text-muted-foreground'>Name:</dt>
											<dd className='font-medium'>{formData.name || '-'}</dd>
										</div>
										<div className='flex justify-between'>
											<dt className='text-muted-foreground'>Description:</dt>
											<dd className='font-medium'>{formData.description || '-'}</dd>
										</div>
									</dl>
								</div>
							</div>
							<div>
								<h3 className='mb-2 font-medium'>Appearance</h3>
								<div className='bg-muted rounded-lg p-4'>
									<dl className='grid gap-2 text-sm'>
										<div className='flex justify-between'>
											<dt className='text-muted-foreground'>Gender:</dt>
											<dd className='font-medium capitalize'>{formData.gender || '-'}</dd>
										</div>
										<div className='flex justify-between'>
											<dt className='text-muted-foreground'>Age Range:</dt>
											<dd className='font-medium capitalize'>{formData.ageRange || '-'}</dd>
										</div>
										<div className='flex justify-between'>
											<dt className='text-muted-foreground'>Body Type:</dt>
											<dd className='font-medium capitalize'>{formData.bodyType || '-'}</dd>
										</div>
										<div className='flex justify-between'>
											<dt className='text-muted-foreground'>Ethnicity:</dt>
											<dd className='font-medium capitalize'>{formData.ethnicity || '-'}</dd>
										</div>
									</dl>
								</div>
							</div>
						</div>
					)}
				</CardContent>

				{/* Navigation */}
				<div className='flex justify-between border-t px-6 py-4'>
					<Button variant='outline' onClick={handleBack} disabled={step === 1}>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Back
					</Button>
					{step < 4 ? (
						<Button onClick={handleNext}>
							Next
							<ArrowRight className='ml-2 h-4 w-4' />
						</Button>
					) : (
						<Button>Create Model</Button>
					)}
				</div>
			</Card>
		</div>
	)
}
