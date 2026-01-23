/**
 * @fileoverview Model Status Configuration
 *
 * Status colors, icons, and display configuration for model statuses.
 */

import { Star, TrendingUp, Users, X, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ModelDocument } from '@/lib/firebase'

type ModelStatus = ModelDocument['status']

export interface StatusConfig {
	icon: LucideIcon
	colorClass: string
	label: string
}

export const STATUS_CONFIG: Record<ModelStatus, StatusConfig> = {
	DRAFT: {
		icon: Zap,
		colorClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
		label: 'Draft',
	},
	CALIBRATING: {
		icon: TrendingUp,
		colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
		label: 'Calibrating',
	},
	ACTIVE: {
		icon: Star,
		colorClass: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
		label: 'Active',
	},
	FAILED: {
		icon: X,
		colorClass: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
		label: 'Failed',
	},
	ARCHIVED: {
		icon: Users,
		colorClass: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
		label: 'Archived',
	},
}

export function getStatusConfig(status: ModelStatus): StatusConfig {
	return STATUS_CONFIG[status]
}
