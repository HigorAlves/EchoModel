type AppEnvironment = 'production' | 'staging' | 'development' | 'local' | 'test'

interface EnvironmentConfig {
	enabled: boolean
	tracesSampleRate: number
	replaysSessionSampleRate: number
	replaysOnErrorSampleRate: number
	debug: boolean
}

const ENVIRONMENT_CONFIGS: Record<AppEnvironment, EnvironmentConfig> = {
	production: {
		enabled: true,
		tracesSampleRate: 0.1,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,
		debug: false,
	},
	staging: {
		enabled: true,
		tracesSampleRate: 0.5,
		replaysSessionSampleRate: 0.5,
		replaysOnErrorSampleRate: 1.0,
		debug: true,
	},
	development: {
		enabled: true,
		tracesSampleRate: 1.0,
		replaysSessionSampleRate: 1.0,
		replaysOnErrorSampleRate: 1.0,
		debug: true,
	},
	local: {
		enabled: false,
		tracesSampleRate: 1.0,
		replaysSessionSampleRate: 1.0,
		replaysOnErrorSampleRate: 1.0,
		debug: true,
	},
	test: {
		enabled: false,
		tracesSampleRate: 0,
		replaysSessionSampleRate: 0,
		replaysOnErrorSampleRate: 0,
		debug: false,
	},
}

function getAppEnvironment(): AppEnvironment {
	const appEnv = process.env.NEXT_PUBLIC_APP_ENV
	if (appEnv && ['production', 'staging', 'development', 'local', 'test'].includes(appEnv)) {
		return appEnv as AppEnvironment
	}
	const nodeEnv = process.env.NODE_ENV
	if (nodeEnv === 'production') return 'production'
	if (nodeEnv === 'test') return 'test'
	return 'local'
}

function isSentryEnabled(): boolean {
	const sentryEnabled = process.env.NEXT_PUBLIC_SENTRY_ENABLED
	if (sentryEnabled === 'true') return true
	if (sentryEnabled === 'false') return false
	const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
	if (!dsn) return false
	return ENVIRONMENT_CONFIGS[getAppEnvironment()].enabled
}

// Only initialize Sentry in browser environment at runtime
// This check ensures we don't initialize during SSR/prerendering
const isBrowser = typeof window !== 'undefined'
const environment = getAppEnvironment()
const envConfig = ENVIRONMENT_CONFIGS[environment]
const enabled = isSentryEnabled()
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

// Use dynamic import to avoid loading Sentry during build/prerendering
// This prevents useContext issues during static generation
if (isBrowser && enabled && dsn) {
	import('@sentry/nextjs').then((Sentry) => {
		Sentry.init({
			dsn,
			environment,
			tracesSampleRate: envConfig.tracesSampleRate,
			replaysSessionSampleRate: envConfig.replaysSessionSampleRate,
			replaysOnErrorSampleRate: envConfig.replaysOnErrorSampleRate,
			debug: envConfig.debug,
			integrations: [Sentry.replayIntegration()],
			initialScope: {
				tags: {
					app: 'dashboard',
				},
			},
		})
	})
}

export async function onRouterTransitionStart() {
	if (isBrowser) {
		const Sentry = await import('@sentry/nextjs')
		return Sentry.captureRouterTransitionStart
	}
	return () => {}
}
