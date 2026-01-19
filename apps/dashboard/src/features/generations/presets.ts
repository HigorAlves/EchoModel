import {
	Building2,
	Camera,
	Cloud,
	Compass,
	Eye,
	Frame,
	Home,
	Lightbulb,
	Palmtree,
	Sparkles,
	Square,
	Sun,
	TreePine,
	User,
	UserCheck,
	UserCircle,
	UserPlus,
	Users,
	Video,
	Wind,
	Zap,
} from 'lucide-react'

export const PRESET_CATEGORIES = {
	SETTING: 'setting',
	LIGHTING: 'lighting',
	POSE: 'pose',
	ANGLE: 'angle',
	MOOD: 'mood',
} as const

export const SETTING_OPTIONS = {
	studio: { label: 'Studio', template: 'a clean studio with seamless backdrop' },
	urban: { label: 'Urban Street', template: 'an urban street setting with modern architecture' },
	beach: { label: 'Beach/Seaside', template: 'a beach setting with ocean and sand' },
	park: { label: 'Park/Garden', template: 'a park with natural greenery and trees' },
	indoor: { label: 'Indoor Lifestyle', template: 'a modern interior space with natural light' },
	minimalist: { label: 'Minimalist', template: 'a minimalist background with solid color' },
}

export const LIGHTING_OPTIONS = {
	golden: { label: 'Golden Hour', template: 'warm golden hour lighting' },
	studio: { label: 'Studio Lighting', template: 'professional studio lighting setup' },
	natural: { label: 'Natural Daylight', template: 'soft natural daylight' },
	dramatic: { label: 'Dramatic', template: 'dramatic lighting with strong shadows' },
	soft: { label: 'Soft/Diffused', template: 'soft diffused lighting' },
	bright: { label: 'Bright & Airy', template: 'bright airy lighting' },
}

export const POSE_OPTIONS = {
	standing: { label: 'Standing', template: 'full body standing pose' },
	walking: { label: 'Walking', template: 'walking pose in motion' },
	sitting: { label: 'Sitting', template: 'sitting in a relaxed pose' },
	leaning: { label: 'Leaning', template: 'leaning casually against a surface' },
	closeup: { label: 'Close-up', template: 'close-up upper body portrait' },
	action: { label: 'Action', template: 'dynamic action pose' },
}

export const ANGLE_OPTIONS = {
	eye: { label: 'Eye Level', template: 'shot from eye level' },
	below: { label: 'Slightly Below', template: 'shot from slightly below' },
	above: { label: 'Slightly Above', template: 'shot from slightly above' },
	side: { label: 'Side Profile', template: 'side profile angle' },
	threequarter: { label: 'Three-Quarter', template: 'three-quarter angle view' },
}

export const MOOD_OPTIONS = {
	professional: { label: 'Professional', template: 'professional editorial style' },
	casual: { label: 'Casual', template: 'casual lifestyle style' },
	elegant: { label: 'Elegant', template: 'elegant sophisticated style' },
	edgy: { label: 'Edgy', template: 'edgy urban style' },
	playful: { label: 'Playful', template: 'playful dynamic style' },
	minimalist: { label: 'Minimalist', template: 'minimalist clean style' },
}

export interface PresetSelection {
	setting?: string
	lighting?: string
	pose?: string
	angle?: string
	mood?: string
}

export function generateScenePrompt(presets: PresetSelection): string {
	const parts: string[] = []

	if (presets.pose && POSE_OPTIONS[presets.pose as keyof typeof POSE_OPTIONS]) {
		parts.push(POSE_OPTIONS[presets.pose as keyof typeof POSE_OPTIONS].template)
	}

	if (presets.setting && SETTING_OPTIONS[presets.setting as keyof typeof SETTING_OPTIONS]) {
		parts.push(`in ${SETTING_OPTIONS[presets.setting as keyof typeof SETTING_OPTIONS].template}`)
	}

	if (presets.lighting && LIGHTING_OPTIONS[presets.lighting as keyof typeof LIGHTING_OPTIONS]) {
		parts.push(LIGHTING_OPTIONS[presets.lighting as keyof typeof LIGHTING_OPTIONS].template)
	}

	if (presets.angle && ANGLE_OPTIONS[presets.angle as keyof typeof ANGLE_OPTIONS]) {
		parts.push(ANGLE_OPTIONS[presets.angle as keyof typeof ANGLE_OPTIONS].template)
	}

	if (presets.mood && MOOD_OPTIONS[presets.mood as keyof typeof MOOD_OPTIONS]) {
		parts.push(MOOD_OPTIONS[presets.mood as keyof typeof MOOD_OPTIONS].template)
	}

	parts.push('professional fashion photography, high quality, detailed')

	return parts.filter(Boolean).join(', ')
}

export function getSettingIcon(key: string) {
	const icons: Record<string, React.ComponentType<{ className?: string }>> = {
		studio: Building2,
		urban: Building2,
		beach: Palmtree,
		park: TreePine,
		indoor: Home,
		minimalist: Square,
	}
	return icons[key] || Building2
}

export function getLightingIcon(key: string) {
	const icons: Record<string, React.ComponentType<{ className?: string }>> = {
		golden: Sun,
		studio: Lightbulb,
		natural: Cloud,
		dramatic: Zap,
		soft: Wind,
		bright: Sparkles,
	}
	return icons[key] || Lightbulb
}

export function getPoseIcon(key: string) {
	const icons: Record<string, React.ComponentType<{ className?: string }>> = {
		standing: User,
		walking: UserCheck,
		sitting: UserPlus,
		leaning: Users,
		closeup: UserCircle,
		action: Compass,
	}
	return icons[key] || User
}

export function getAngleIcon(key: string) {
	const icons: Record<string, React.ComponentType<{ className?: string }>> = {
		eye: Eye,
		below: Camera,
		above: Video,
		side: Frame,
		threequarter: Camera,
	}
	return icons[key] || Camera
}

export function getMoodIcon(key: string) {
	const icons: Record<string, React.ComponentType<{ className?: string }>> = {
		professional: Sparkles,
		casual: User,
		elegant: Sparkles,
		edgy: Zap,
		playful: Compass,
		minimalist: Square,
	}
	return icons[key] || Sparkles
}
