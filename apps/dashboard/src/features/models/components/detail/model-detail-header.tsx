'use client'

import { ArrowLeft, Edit, MoreHorizontal, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import type { ModelDocument } from '@/lib/firebase'

import { getStatusConfig } from '../../constants/status-config'

interface ModelDetailHeaderProps {
	model: ModelDocument
}

function formatDate(date: Date | null | undefined): string {
	if (!date) return 'N/A'
	if (date instanceof Date) return date.toLocaleDateString()
	return String(date).split('T')[0] ?? 'N/A'
}

export function ModelDetailHeader({ model }: ModelDetailHeaderProps) {
	const router = useRouter()
	const t = useTranslations('models')
	const statusConfig = getStatusConfig(model.status)
	const StatusIcon = statusConfig.icon

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center gap-4'>
				<Button variant='ghost' size='icon' onClick={() => router.push('/dashboard/models')}>
					<ArrowLeft className='h-5 w-5' />
				</Button>
				<div className='flex-1'>
					<div className='flex items-center gap-3'>
						<h1 className='text-3xl font-bold tracking-tight'>{model.name}</h1>
						<Badge className={statusConfig.colorClass}>
							<StatusIcon className='mr-1.5 h-3.5 w-3.5' />
							{t(`status.${model.status.toLowerCase()}`)}
						</Badge>
					</div>
					{model.description && <p className='mt-1 text-muted-foreground'>{model.description}</p>}
				</div>
				<div className='flex items-center gap-2'>
					<DropdownMenu>
						<DropdownMenuTrigger render={<Button variant='outline' size='icon' />}>
							<MoreHorizontal className='h-4 w-4' />
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem>
								<Edit className='mr-2 h-4 w-4' />
								Edit Model
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings className='mr-2 h-4 w-4' />
								Settings
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className='text-destructive'>Archive Model</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Model Attributes */}
			<div className='flex flex-wrap items-center gap-2'>
				<Badge variant='secondary'>{model.gender}</Badge>
				<Badge variant='secondary'>{model.ageRange}</Badge>
				<Badge variant='secondary'>{model.ethnicity}</Badge>
				<Badge variant='secondary'>{model.bodyType}</Badge>
				<Separator orientation='vertical' className='h-4' />
				<span className='text-sm text-muted-foreground'>Created {formatDate(model.createdAt)}</span>
			</div>
		</div>
	)
}
